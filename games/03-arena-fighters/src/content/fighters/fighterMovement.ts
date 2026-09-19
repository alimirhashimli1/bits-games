import { MOVEMENT } from '../../config';

/** How fast a fighter walks and how they jump, in sub-pixels per step. Gravity is the same for everyone. */
export interface FighterMovement {
  readonly walkForward: number;
  readonly walkBack: number;
  readonly jumpForward: number;
  readonly jumpBack: number;
  readonly jumpVelocity: number;
}

/** The standard build, which fighters such as Brand use as it is and others adjust. */
export const STANDARD_MOVEMENT: FighterMovement = {
  walkForward: MOVEMENT.walkForward,
  walkBack: MOVEMENT.walkBack,
  jumpForward: MOVEMENT.jumpForward,
  jumpBack: MOVEMENT.jumpBack,
  jumpVelocity: MOVEMENT.jumpVelocity,
};
