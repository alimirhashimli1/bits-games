import { ROUND } from '../../config';
import { startOfRound, type FighterState, type FightState, type RoundState, type Winner } from './fightState';

/**
 * Moves the round along by one step: the intro gives way to the fight, the clock runs down, a KO
 * or the end of the clock ends the round, the result is shown, and then the next round starts
 * or the match is over. `frozen` is true on hitstop steps, which the clock does not count.
 *
 * Best of three by default: the first to win `roundsToWin` rounds takes the match. A drawn round
 * (a double KO, or equal health when time runs out) counts for nobody, so after the last round
 * the one with more wins takes it, and equal wins make a draw game.
 */
export function advanceRound(state: FightState, frozen: boolean): FightState {
  const { round } = state;
  const phaseSteps = round.phaseSteps + 1;
  switch (round.phase) {
    case 'intro':
      return withRound(state, phaseSteps >= ROUND.introSteps ? { phase: 'fight', phaseSteps: 0 } : { phaseSteps });
    case 'fight':
      return fight(state, frozen);
    case 'ko':
    case 'timeUp':
      return phaseSteps >= ROUND.endingSteps ? showResult(state) : withRound(state, { phaseSteps });
    case 'result':
      return phaseSteps >= ROUND.resultSteps ? nextRound(state) : withRound(state, { phaseSteps });
    case 'matchOver':
      return state;
  }
}

/** Final round: both players are one win from the match. */
export function isFinalRound(state: FightState): boolean {
  const matchPoint = state.rules.roundsToWin - 1;
  return state.wins[0] === matchPoint && state.wins[1] === matchPoint;
}

function fight(state: FightState, frozen: boolean): FightState {
  const [first, second] = state.fighters;
  const firstOut = knockedOut(first);
  const secondOut = knockedOut(second);
  if (firstOut || secondOut) {
    const winner: Winner = firstOut && secondOut ? 'draw' : firstOut ? 1 : 0;
    return withRound(state, { phase: 'ko', phaseSteps: 0, winner });
  }

  const timer = frozen ? state.round.timer : state.round.timer - 1;
  if (timer <= 0) {
    const winner: Winner = first.health === second.health ? 'draw' : first.health > second.health ? 0 : 1;
    return withRound(state, { phase: 'timeUp', phaseSteps: 0, timer: 0, winner });
  }
  return withRound(state, { phaseSteps: state.round.phaseSteps + 1, timer });
}

/** The round's winner gets their win as the result is shown. */
function showResult(state: FightState): FightState {
  const { winner } = state.round;
  const wins: readonly [number, number] = [
    state.wins[0] + (winner === 0 ? 1 : 0),
    state.wins[1] + (winner === 1 ? 1 : 0),
  ];
  return { ...withRound(state, { phase: 'result', phaseSteps: 0 }), wins };
}

/** After the result: the match is over, or the fighters are set up afresh for the next round. */
function nextRound(state: FightState): FightState {
  const { wins, rules, round } = state;
  const lastRound = rules.roundsToWin * 2 - 1;
  const decided = wins[0] >= rules.roundsToWin || wins[1] >= rules.roundsToWin || round.number >= lastRound;
  if (decided) {
    const matchWinner: Winner = wins[0] === wins[1] ? 'draw' : wins[0] > wins[1] ? 0 : 1;
    return { ...withRound(state, { phase: 'matchOver', phaseSteps: 0 }), matchWinner };
  }

  const characters = [state.fighters[0].character, state.fighters[1].character] as const;
  return {
    ...state,
    ...startOfRound(characters),
    round: { number: round.number + 1, phase: 'intro', phaseSteps: 0, timer: rules.roundSteps, winner: null },
  };
}

function knockedOut(fighter: FighterState): boolean {
  return fighter.status.kind === 'knockdown' && fighter.status.ko;
}

function withRound(state: FightState, changes: Partial<RoundState>): FightState {
  return { ...state, round: { ...state.round, ...changes } };
}
