import { COMBAT } from '../../config';
import { FREE, type FighterState } from './fightState';

/**
 * Counts down whatever holds a fighter up: reeling, holding a block, lying on the floor and
 * getting back up. Falling is left to movement, which knows when they land, and throws to
 * the throw rules, which need both fighters.
 */
export function advanceStatus(fighter: FighterState): FighterState {
  const { status } = fighter;
  switch (status.kind) {
    case 'hitstun':
      return status.steps > 1 ? { ...fighter, status: { ...status, steps: status.steps - 1 } } : recover(fighter);
    case 'blockstun':
      return status.steps > 1 ? { ...fighter, status: { ...status, steps: status.steps - 1 } } : { ...fighter, status: FREE };
    case 'knockdown':
      if (status.phase === 'falling' || status.ko) return fighter;
      if (status.steps > 1) return { ...fighter, status: { ...status, steps: status.steps - 1 } };
      if (status.phase === 'lying') {
        return { ...fighter, status: { ...status, phase: 'rising', steps: COMBAT.knockdown.risingSteps } };
      }
      return { ...recover(fighter), posture: 'standing' };
    default:
      return fighter;
  }
}

/** Back on their feet and in control; whatever combo they were caught in is over. */
function recover(fighter: FighterState): FighterState {
  return { ...fighter, status: FREE, comboHits: 0 };
}
