import { specialOf } from './attacks';
import type { FighterState } from './fightState';
import { atMaxSeparation, atWall } from './pushboxes';

type Pair = readonly [FighterState, FighterState];

/**
 * A fighter in the middle of a wall leap who has reached the edge behind them springs off it,
 * back towards the opponent: the move jumps to its spring step, and the fighter takes the
 * spring's speed. The edge is the arena wall, or the most one screen lets the fighters part.
 * Checked once both fighters have moved and been held inside the arena.
 */
export function resolveWallLeaps([a, b]: Pair): Pair {
  return [springOff(a, b), springOff(b, a)];
}

function springOff(fighter: FighterState, opponent: FighterState): FighterState {
  const behaviour = specialOf(fighter)?.behaviour;
  const attack = fighter.attack;
  if (behaviour?.kind !== 'wallLeap' || !attack || fighter.posture !== 'airborne') return fighter;
  if (attack.step < behaviour.launchStep || attack.step >= behaviour.springStep) return fighter;
  if (!atWall(fighter, fighter.facing === 1 ? -1 : 1) && !atMaxSeparation(fighter, opponent)) return fighter;

  const strength = attack.heavy ? 'heavy' : 'light';
  return {
    ...fighter,
    vx: behaviour.springForward[strength] * fighter.facing,
    vy: behaviour.springUp[strength],
    attack: { ...attack, step: behaviour.springStep },
  };
}
