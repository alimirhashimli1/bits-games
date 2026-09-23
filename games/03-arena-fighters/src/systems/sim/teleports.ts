import { specialOf } from './attacks';
import { toSubpixels, type Facing, type FighterState } from './fightState';
import { insideWalls } from './pushboxes';

type Pair = readonly [FighterState, FighterState];

/**
 * A fighter whose teleport reaches its appearing step comes back on the other side of the
 * opponent, turned to face them. The arena walls still hold them in, so with the opponent backed
 * into a corner there may be no room behind and they come back as close to it as they fit.
 * Checked once both fighters have moved and been held inside the arena.
 */
export function resolveTeleports([a, b]: Pair): Pair {
  return [reappear(a, b), reappear(b, a)];
}

function reappear(fighter: FighterState, opponent: FighterState): FighterState {
  const behaviour = specialOf(fighter)?.behaviour;
  const attack = fighter.attack;
  if (behaviour?.kind !== 'teleport' || !attack || attack.step !== behaviour.appearStep) return fighter;

  const behind = toSubpixels(behaviour.behindPx[attack.heavy ? 'heavy' : 'light']);
  const x = insideWalls(opponent.x + fighter.facing * behind);
  const facing: Facing = opponent.x >= x ? 1 : -1;
  return { ...fighter, x, facing };
}
