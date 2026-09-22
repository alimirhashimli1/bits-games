import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Mahmood's normals: every punch is a jab of his handless front arm, so they are a little lighter than
 * Brand's, and his kicks are stronger and reach further to make up for it. Steps are fight
 * steps (60 per second), damage is out of 1000 health and push is a slide speed in sub-pixels
 * per step.
 */

const LIGHT = { hitstun: 12, blockstun: 8, push: 384 } as const;
const HEAVY = { hitstun: 18, blockstun: 14, push: 768 } as const;

const PALM: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 25, guard: 'mid' };
const HEAVY_PALM: Strike = { ...HEAVY, limb: 'nearHand', width: 12, height: 10, damage: 80, guard: 'mid' };
const SNAP_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 9, damage: 45, guard: 'mid' };
const HOOK_KICK: Strike = { ...HEAVY, limb: 'nearFoot', width: 15, height: 12, damage: 100, hitstun: 20, push: 896, guard: 'mid' };

/** Light on his feet: he walks faster than Brand. */
export const MAHMOOD_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 400,
  walkBack: 336,
};

export const MAHMOOD_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLP', steps: 3, strike: PALM },
      { pose: 'idle2', steps: 6 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 6 },
      { pose: 'standHP', steps: 4, strike: HEAVY_PALM },
      { pose: 'standHP', steps: 6 },
      { pose: 'standHPWindup', steps: 8 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 4, strike: SNAP_KICK },
      { pose: 'standHKWindup', steps: 7 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 7 },
      { pose: 'standHK', steps: 5, strike: HOOK_KICK },
      { pose: 'standHK', steps: 6 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 3, strike: { ...PALM, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 5 },
      { pose: 'crouchHP', steps: 5, strike: { ...HEAVY_PALM, width: 10, height: 14, push: 640 } },
      { pose: 'crouchHP', steps: 8 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 4, strike: { ...SNAP_KICK, damage: 35, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 7 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 6 },
      { pose: 'crouchHK', steps: 4, strike: { ...HOOK_KICK, width: 16, height: 8, damage: 90, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 12 },
      { pose: 'crouch', steps: 8 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 8, strike: { ...PALM, damage: 40, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHP', steps: 6, strike: { ...HEAVY_PALM, damage: 85, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 14, strike: { ...SNAP_KICK, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHK', steps: 12, strike: { ...HOOK_KICK, hitstun: 18, damage: 105, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
