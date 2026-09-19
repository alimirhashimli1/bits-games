import { COMBAT, MOVEMENT } from '../../config';
import { segmentAt } from '../../content/fighters/moves';
import type { AnyPoseName } from '../../content/fighters/poseNames';
import { commandThrowOf, moveOf } from './attacks';
import type { FighterState } from './fightState';

const KNOCKDOWN_POSES = { falling: 'fall', lying: 'lying', rising: 'getUp' } as const;

/**
 * The pose a fighter is in on this step. It decides their hurtboxes, so it belongs to the
 * fight rather than the drawing; walking is drawn as an animation but counts as the stance.
 */
export function poseOf(fighter: FighterState): AnyPoseName {
  const { status } = fighter;
  const crouching = fighter.posture === 'crouching';
  switch (status.kind) {
    case 'hitstun':
      return crouching ? 'hitCrouch' : 'hitStand';
    case 'blockstun':
      return crouching ? 'blockCrouch' : 'blockStand';
    case 'knockdown':
      return KNOCKDOWN_POSES[status.phase];
    case 'thrown':
      // Lifted overhead by a command throw, they are held flat like a log.
      return fighter.y > 0 ? 'lying' : 'hitStand';
    case 'throwing': {
      const command = status.special ? commandThrowOf(fighter.character, status.special) : null;
      if (command) return segmentAt({ segments: command.hold }, status.steps)?.pose ?? 'idle1';
      // The ordinary throw: grabbing, then the heave.
      return status.steps < COMBAT.throw.durationSteps / 2 ? 'standHPWindup' : 'standHP';
    }
    case 'free':
      break;
  }

  const move = moveOf(fighter);
  if (move && fighter.attack) return segmentAt(move, fighter.attack.step)?.pose ?? 'idle1';
  if (crouching) return 'crouch';
  if (fighter.posture === 'airborne') {
    if (fighter.vy > MOVEMENT.jumpApexSpeed) return 'jumpRise';
    return fighter.vy < -MOVEMENT.jumpApexSpeed ? 'jumpFall' : 'jumpTuck';
  }
  return 'idle1';
}
