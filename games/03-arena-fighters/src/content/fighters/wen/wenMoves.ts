import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Old Wen's normals: his palms are quick and hit hard, and his feet are old. His punches come
 * out as fast as anyone's and hurt like a heavyweight's; his kicks are plain,
 * no better than anyone's. Steps are fight steps (60 per second), damage is out of 1000 health
 * and push is a slide speed in sub-pixels per step.
 */

const LIGHT = { hitstun: 12, blockstun: 8, push: 384 } as const;
const HEAVY = { hitstun: 19, blockstun: 15, push: 896 } as const;

const PALM: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 9, damage: 40, guard: 'mid' };
const TWIN_PALMS: Strike = { ...HEAVY, limb: 'nearHand', width: 14, height: 12, damage: 105, guard: 'mid' };
const STAMP: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 8, damage: 35, guard: 'mid' };
const PUSH_KICK: Strike = { ...HEAVY, limb: 'nearFoot', width: 18, height: 12, damage: 85, push: 960, guard: 'mid' };

/** Slow on his feet, as slow as Grom, and a low jump. */
export const WEN_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 320,
  walkBack: 288,
  jumpForward: 384,
  jumpBack: 320,
  jumpVelocity: 1312,
};

export const WEN_MOVES: FighterMoves = {
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
      { pose: 'standHP', steps: 4, strike: TWIN_PALMS },
      { pose: 'standHP', steps: 6 },
      { pose: 'standHPWindup', steps: 8 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 4, strike: STAMP },
      { pose: 'standHKWindup', steps: 8 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 8 },
      { pose: 'standHK', steps: 5, strike: PUSH_KICK },
      { pose: 'standHK', steps: 6 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 3, strike: { ...PALM, damage: 35, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** A palm thrust straight up: his answer to jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchHP', steps: 5, strike: { ...TWIN_PALMS, width: 12, height: 18, push: 640 } },
      { pose: 'crouchHP', steps: 7 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchLK', steps: 3, strike: { ...STAMP, damage: 25, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 7 },
      { pose: 'crouchHK', steps: 4, strike: { ...PUSH_KICK, width: 20, height: 8, damage: 80, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 13 },
      { pose: 'crouch', steps: 9 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 7, strike: { ...PALM, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHP', steps: 6, strike: { ...TWIN_PALMS, damage: 100, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 10, strike: { ...STAMP, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 6 },
      { pose: 'jumpHK', steps: 9, strike: { ...PUSH_KICK, damage: 80, hitstun: 17, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
