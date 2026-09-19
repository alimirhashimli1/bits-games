import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Kanan's normals: a brawler's set, a step slower than Brand's and much harder. Steps are fight
 * steps (60 per second), damage is out of 1000 health and push is a slide speed in sub-pixels
 * per step.
 */

const LIGHT = { hitstun: 13, blockstun: 8, push: 416 } as const;
const HEAVY = { hitstun: 19, blockstun: 15, push: 832 } as const;

const JAB: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 9, damage: 35, guard: 'mid' };
const SMASH: Strike = { ...HEAVY, limb: 'farHand', width: 14, height: 12, damage: 115, guard: 'mid' };
const SNAP_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 9, damage: 45, guard: 'mid' };
const ROUNDHOUSE: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 12, damage: 120, hitstun: 21, push: 896, guard: 'mid' };

/** Heavy on his feet, though not as slow as Grom, with a lower jump than most. */
export const KANAN_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 352,
  walkBack: 288,
  jumpForward: 416,
  jumpBack: 352,
  jumpVelocity: 1360,
};

export const KANAN_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 4 },
      { pose: 'standLP', steps: 3, strike: JAB },
      { pose: 'idle2', steps: 7 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 8 },
      { pose: 'standHP', steps: 4, strike: SMASH },
      { pose: 'standHP', steps: 7 },
      { pose: 'standHPWindup', steps: 9 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 5 },
      { pose: 'standLK', steps: 4, strike: SNAP_KICK },
      { pose: 'standHKWindup', steps: 9 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 9 },
      { pose: 'standHK', steps: 5, strike: ROUNDHOUSE },
      { pose: 'standHK', steps: 7 },
      { pose: 'standHKWindup', steps: 11 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchLP', steps: 3, strike: { ...JAB, damage: 30, hitstun: 12, blockstun: 7, push: 352 } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  /** A rising uppercut against jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 5 },
      { pose: 'crouchHP', steps: 6, strike: { ...SMASH, limb: 'nearHand', width: 14, height: 20, push: 640 } },
      { pose: 'crouchHP', steps: 9 },
      { pose: 'crouch', steps: 9 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchLK', steps: 4, strike: { ...SNAP_KICK, damage: 35, hitstun: 12, blockstun: 7, push: 352, guard: 'low' } },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 7 },
      { pose: 'crouchHK', steps: 4, strike: { ...ROUNDHOUSE, width: 16, height: 8, damage: 100, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 13 },
      { pose: 'crouch', steps: 9 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 8, strike: { ...JAB, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHP', steps: 6, strike: { ...SMASH, damage: 105, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 12, strike: { ...SNAP_KICK, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHK', steps: 11, strike: { ...ROUNDHOUSE, hitstun: 19, damage: 110, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
