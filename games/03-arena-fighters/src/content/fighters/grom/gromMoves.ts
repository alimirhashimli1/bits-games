import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Grom's normals: slower to come out than anyone's and slower to recover, but they hurt far
 * more and push harder. Steps are fight steps (60 per second), damage is out of 1000 health and
 * push is a slide speed in sub-pixels per step.
 */

const LIGHT = { hitstun: 13, blockstun: 8, push: 416 } as const;
const HEAVY = { hitstun: 20, blockstun: 15, push: 832 } as const;

const JAB: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 10, damage: 40, guard: 'mid' };
const HAMMER: Strike = { ...HEAVY, limb: 'nearHand', width: 16, height: 16, damage: 125, guard: 'mid' };
const STAMP: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 10, damage: 45, guard: 'mid' };
const BIG_BOOT: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 14, damage: 135, hitstun: 22, push: 960, guard: 'mid' };

/** He lumbers: slow on his feet both ways, with a short, low jump. */
export const GROM_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 320,
  walkBack: 256,
  jumpForward: 384,
  jumpBack: 320,
  jumpVelocity: 1320,
};

export const GROM_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 4 },
      { pose: 'standLP', steps: 3, strike: JAB },
      { pose: 'idle2', steps: 8 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 9 },
      { pose: 'standHP', steps: 4, strike: HAMMER },
      { pose: 'standHP', steps: 8 },
      { pose: 'standHPWindup', steps: 10 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 5 },
      { pose: 'standLK', steps: 4, strike: STAMP },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },
  /** The big boot: the slowest normal in the game, and the hardest. */
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 10 },
      { pose: 'standHK', steps: 5, strike: BIG_BOOT },
      { pose: 'standHK', steps: 8 },
      { pose: 'standHKWindup', steps: 12 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchLP', steps: 3, strike: { ...JAB, damage: 35, hitstun: 12, blockstun: 7, push: 352 } },
      { pose: 'crouch', steps: 7 },
    ],
  },
  /** A rising forearm: his answer to jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 6 },
      { pose: 'crouchHP', steps: 5, strike: { ...HAMMER, damage: 110, width: 14, height: 18, push: 640 } },
      { pose: 'crouchHP', steps: 9 },
      { pose: 'crouch', steps: 10 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 5 },
      { pose: 'crouchLK', steps: 4, strike: { ...STAMP, damage: 35, hitstun: 12, blockstun: 7, push: 352, guard: 'low' } },
      { pose: 'crouch', steps: 8 },
    ],
  },
  /** A low sliding kick that knocks down. */
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 8 },
      { pose: 'crouchHK', steps: 4, strike: { ...BIG_BOOT, width: 16, height: 8, damage: 110, push: 576, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 14 },
      { pose: 'crouch', steps: 10 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpLP', steps: 8, strike: { ...JAB, damage: 50, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 6 },
      { pose: 'jumpHP', steps: 6, strike: { ...HAMMER, damage: 115, push: 576, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpLK', steps: 12, strike: { ...STAMP, damage: 50, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  /** Both feet stamped down on whoever is below. */
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 6 },
      { pose: 'jumpHK', steps: 10, strike: { ...BIG_BOOT, width: 16, height: 14, damage: 120, hitstun: 20, push: 576, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
