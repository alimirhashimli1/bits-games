import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Tala's normals: quicker than Brand's and a touch lighter, with kicks that reach further than
 * her punches. Steps are fight steps (60 per second), damage is out of 1000 health and push is a
 * slide speed in sub-pixels per step.
 */

const LIGHT = { hitstun: 11, blockstun: 7, push: 352 } as const;
const HEAVY = { hitstun: 17, blockstun: 13, push: 704 } as const;

const PALM: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 25, guard: 'mid' };
const HAMMER: Strike = { ...HEAVY, limb: 'farHand', width: 12, height: 10, damage: 75, guard: 'mid' };
const SHIN: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 8, damage: 35, guard: 'mid' };
const HOOK_KICK: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 12, damage: 90, hitstun: 19, push: 832, guard: 'mid' };

/** She is quicker on her feet than most, and jumps a little higher and further. */
export const TALA_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 448,
  walkBack: 384,
  jumpForward: 480,
  jumpBack: 416,
  jumpVelocity: 1440,
};

export const TALA_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 2 },
      { pose: 'standLP', steps: 2, strike: PALM },
      { pose: 'idle2', steps: 5 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 5 },
      { pose: 'standHP', steps: 3, strike: HAMMER },
      { pose: 'standHP', steps: 5 },
      { pose: 'standHPWindup', steps: 7 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 3 },
      { pose: 'standLK', steps: 3, strike: SHIN },
      { pose: 'standHKWindup', steps: 7 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 7 },
      { pose: 'standHK', steps: 4, strike: HOOK_KICK },
      { pose: 'standHK', steps: 5 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 2 },
      { pose: 'crouchLP', steps: 2, strike: { ...PALM, hitstun: 10, blockstun: 6, push: 288 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** A rising palm: her answer to jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchHP', steps: 4, strike: { ...HAMMER, limb: 'nearHand', width: 10, height: 14, push: 576 } },
      { pose: 'crouchHP', steps: 6 },
      { pose: 'crouch', steps: 7 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 3, strike: { ...SHIN, damage: 25, hitstun: 10, blockstun: 6, push: 288, guard: 'low' } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  /** A long spinning sweep that knocks down. */
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 5 },
      {
        pose: 'crouchHK',
        steps: 4,
        strike: { ...HOOK_KICK, width: 16, height: 8, damage: 80, push: 512, guard: 'low', knockdown: true },
      },
      { pose: 'crouchHK', steps: 11 },
      { pose: 'crouch', steps: 7 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 7, strike: { ...PALM, damage: 35, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHP', steps: 6, strike: { ...HAMMER, damage: 80, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 14, strike: { ...SHIN, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  /** The split kick, which reaches both ways. */
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHK', steps: 12, strike: { ...HOOK_KICK, width: 16, height: 10, damage: 85, hitstun: 17, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
