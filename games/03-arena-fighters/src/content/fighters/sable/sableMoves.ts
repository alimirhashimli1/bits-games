import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Sable's normals: quiet and quick, palms and low kicks, none of them hitting especially hard.
 * What she takes from an opponent she takes by being somewhere they were not looking. Steps are
 * fight steps (60 per second), damage is out of 1000 health and push is a slide speed in
 * sub-pixels per step.
 */

const LIGHT = { hitstun: 12, blockstun: 8, push: 352 } as const;
const HEAVY = { hitstun: 18, blockstun: 14, push: 704 } as const;

const PALM: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 30, guard: 'mid' };
const DOUBLE_PALM: Strike = { ...HEAVY, limb: 'nearHand', width: 13, height: 11, damage: 100, guard: 'mid' };
const LOW_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 8, damage: 35, guard: 'mid' };
const TURN_KICK: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 12, damage: 100, hitstun: 19, push: 768, guard: 'mid' };

/** Quick and quiet on her feet, with an ordinary jump. */
export const SABLE_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 416,
  walkBack: 384,
};

export const SABLE_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLP', steps: 3, strike: PALM },
      { pose: 'idle2', steps: 5 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 6 },
      { pose: 'standHP', steps: 4, strike: DOUBLE_PALM },
      { pose: 'standHP', steps: 5 },
      { pose: 'standHPWindup', steps: 8 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 3, strike: LOW_KICK },
      { pose: 'standHKWindup', steps: 8 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 8 },
      { pose: 'standHK', steps: 4, strike: TURN_KICK },
      { pose: 'standHK', steps: 5 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 3, strike: { ...PALM, damage: 25, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** A rising palm against jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchHP', steps: 5, strike: { ...DOUBLE_PALM, width: 11, height: 17, push: 576 } },
      { pose: 'crouchHP', steps: 7 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 3, strike: { ...LOW_KICK, damage: 25, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 6 },
      { pose: 'crouchHK', steps: 4, strike: { ...TURN_KICK, width: 16, height: 8, damage: 90, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 12 },
      { pose: 'crouch', steps: 8 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 7, strike: { ...PALM, damage: 40, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHP', steps: 7, strike: { ...DOUBLE_PALM, damage: 85, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 10, strike: { ...LOW_KICK, damage: 40, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHK', steps: 10, strike: { ...TURN_KICK, damage: 95, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
