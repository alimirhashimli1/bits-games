import { newlyPressed, type InputBits } from '../input/inputBits';
import { MOTION_FACING, recordInput } from '../input/motions';
import { updateAttack } from './attacks';
import type { Facing, FighterState, FightState } from './fightState';
import { resolveHits } from './hits';
import { moveFighter } from './movement';
import { advanceProjectiles, hasProjectile, resolveProjectiles } from './projectiles';
import { resolveBodies } from './pushboxes';
import { advanceRound } from './rounds';
import { advanceStatus } from './status';
import { resolveTeleports } from './teleports';
import { resolveCommandThrows, resolveThrows } from './throws';
import { resolveWallLeaps } from './wallLeaps';

/** Both players' input for one step: player 1 first. */
export type StepInputs = readonly [InputBits, InputBits];

/** Outside the fight itself (the intro, after a KO, the result) nobody's controls do anything. */
const NO_INPUTS: StepInputs = [0, 0];

/**
 * Advances the fight by one step. It is a pure function of the state and the inputs, with
 * whole numbers throughout, so the same inputs always give the same fight on any machine.
 *
 * In order: statuses count down, throws start or progress, attacks start or progress, fighters
 * move, bodies are pushed apart, command throws catch, wall leaps spring off the edge, teleports
 * come back on the far side, projectiles fly and new ones are thrown, blows and then projectiles
 * land, and fighters on the ground turn to face each other.
 *
 * During hitstop nothing moves, but inputs are still recorded, so a motion can be entered in the
 * freeze, and buttons pressed in it are kept aside and count as fresh presses when it ends.
 * That is what lets a special move be cancelled out of a normal that has just hit.
 *
 * The round then moves on (see rounds.ts). Controls only count while the fight is on.
 */
export function stepFight(state: FightState, controls: StepInputs): FightState {
  const inputs = state.round.phase === 'fight' ? controls : NO_INPUTS;
  return advanceRound(stepFighters(state, inputs), state.hitstop > 0);
}

function stepFighters(state: FightState, inputs: StepInputs): FightState {
  const [history1, history2] = state.history;
  const previous = [history1[history1.length - 1] ?? 0, history2[history2.length - 1] ?? 0] as const;
  const history = [recordInput(history1, inputs[0]), recordInput(history2, inputs[1])] as const;
  const pressed = [
    newlyPressed(inputs[0], previous[0]) | state.buffered[0],
    newlyPressed(inputs[1], previous[1]) | state.buffered[1],
  ] as const;
  if (state.hitstop > 0) return { ...state, frame: state.frame + 1, hitstop: state.hitstop - 1, history, buffered: pressed };

  const ready = [advanceStatus(state.fighters[0]), advanceStatus(state.fighters[1])] as const;
  const [grab1, grab2] = resolveThrows(ready, inputs, state.history);
  const attacking = [
    updateAttack(grab1, {
      input: inputs[0],
      pressed: pressed[0],
      history: history1,
      motionFacing: MOTION_FACING[0],
      projectileOut: hasProjectile(state.projectiles, 0),
    }),
    updateAttack(grab2, {
      input: inputs[1],
      pressed: pressed[1],
      history: history2,
      motionFacing: MOTION_FACING[1],
      projectileOut: hasProjectile(state.projectiles, 1),
    }),
  ] as const;
  const moved = [moveFighter(attacking[0], inputs[0]), moveFighter(attacking[1], inputs[1])] as const;
  const bodies = resolveTeleports(resolveWallLeaps(resolveCommandThrows(resolveBodies(moved, state.fighters))));
  const flying = advanceProjectiles(bodies, state.projectiles);
  const blows = resolveHits(bodies, inputs);
  const shots = resolveProjectiles(blows.fighters, flying, inputs);
  const [a, b] = shots.fighters;

  return {
    ...state,
    frame: state.frame + 1,
    fighters: [faceOpponent(a, b), faceOpponent(b, a)],
    history,
    hitstop: Math.max(blows.hitstop, shots.hitstop),
    buffered: [0, 0],
    projectiles: shots.projectiles,
  };
}

/**
 * Free fighters on the ground turn to face their opponent. In the air, held up, or in the middle
 * of a move they keep their way, so a dash that passes the opponent carries on past them.
 */
function faceOpponent(fighter: FighterState, opponent: FighterState): FighterState {
  if (fighter.status.kind !== 'free' || fighter.posture === 'airborne' || fighter.attack || opponent.x === fighter.x) return fighter;
  const facing: Facing = opponent.x > fighter.x ? 1 : -1;
  return facing === fighter.facing ? fighter : { ...fighter, facing };
}
