import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Cometa's normals: a wrestler's, built to knock someone into range of a hold rather than to
 * out-poke them. His forearms and boots are middling; his lariat is the hardest single blow he
 * has. Steps are fight steps (60 per second), damage is out of 1000 health and push is a slide
 * speed in sub-pixels per step.
 */

const LIGHT = { hitstun: 12, blockstun: 8, push: 352 } as const;
const HEAVY = { hitstun: 18, blockstun: 14, push: 704 } as const;

const FOREARM: Strike = { ...LIGHT, limb: 'nearHand', width: 11, height: 9, damage: 35, guard: 'mid' };
const LARIAT: Strike = { ...HEAVY, limb: 'farHand', width: 16, height: 10, damage: 90, guard: 'mid' };
const BOOT: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 9, damage: 40, guard: 'mid' };
const HIGH_BOOT: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 12, damage: 95, hitstun: 19, push: 768, guard: 'mid' };

/** Light on his feet for his size, and a high jump: he spends half the match in the air. */
export const COMETA_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 384,
  walkBack: 336,
  jumpForward: 512,
  jumpBack: 416,
  jumpVelocity: 1488,
};

export const COMETA_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLP', steps: 3, strike: FOREARM },
      { pose: 'idle2', steps: 6 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 7 },
      { pose: 'standHP', steps: 4, strike: LARIAT },
      { pose: 'standHP', steps: 6 },
      { pose: 'standHPWindup', steps: 9 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 4, strike: BOOT },
      { pose: 'standHKWindup', steps: 8 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 8 },
      { pose: 'standHK', steps: 4, strike: HIGH_BOOT },
      { pose: 'standHK', steps: 6 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 3, strike: { ...FOREARM, damage: 30, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** A rising forearm against jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchHP', steps: 5, strike: { ...LARIAT, limb: 'nearHand', width: 12, height: 18, push: 576 } },
      { pose: 'crouchHP', steps: 7 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 4, strike: { ...BOOT, damage: 30, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 7 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 6 },
      { pose: 'crouchHK', steps: 4, strike: { ...HIGH_BOOT, width: 16, height: 8, damage: 85, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 12 },
      { pose: 'crouch', steps: 8 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 7, strike: { ...FOREARM, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHP', steps: 7, strike: { ...LARIAT, width: 14, damage: 95, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 10, strike: { ...BOOT, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  /** The dropkick: both feet, and a long time in the air behind them. */
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHK', steps: 12, strike: { ...HIGH_BOOT, width: 16, height: 12, damage: 100, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
