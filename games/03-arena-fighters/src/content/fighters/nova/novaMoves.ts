import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Nova's normals: light, quick punches, and kicks as quick as Brand's whose strikes reach a few
 * pixels further on her long legs, so she wins the space just outside punching range. Steps are
 * fight steps (60 per second), damage is out of 1000 health and push is a slide speed in
 * sub-pixels per step.
 */

const LIGHT = { hitstun: 12, blockstun: 7, push: 384 } as const;
const HEAVY = { hitstun: 18, blockstun: 14, push: 768 } as const;

const JAB: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 30, guard: 'mid' };
const CROSS: Strike = { ...HEAVY, limb: 'farHand', width: 12, height: 10, damage: 80, guard: 'mid' };
const PUSH_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 14, height: 9, damage: 45, guard: 'mid' };
const ROUNDHOUSE: Strike = { ...HEAVY, limb: 'nearFoot', width: 16, height: 12, damage: 100, hitstun: 20, push: 896, guard: 'mid' };

/** Brand's walk, a slightly quicker step back, and a higher jump on her long legs. */
export const NOVA_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkBack: 352,
  jumpVelocity: 1472,
};

export const NOVA_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLP', steps: 2, strike: JAB },
      { pose: 'idle2', steps: 6 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 6 },
      { pose: 'standHP', steps: 3, strike: CROSS },
      { pose: 'standHP', steps: 5 },
      { pose: 'standHPWindup', steps: 8 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 4, strike: PUSH_KICK },
      { pose: 'standHKWindup', steps: 8 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 8 },
      { pose: 'standHK', steps: 5, strike: ROUNDHOUSE },
      { pose: 'standHK', steps: 5 },
      { pose: 'standHKWindup', steps: 8 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 2, strike: { ...JAB, damage: 25, hitstun: 11, blockstun: 6, push: 320 } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  /** A rising uppercut against jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 5 },
      { pose: 'crouchHP', steps: 5, strike: { ...CROSS, limb: 'nearHand', width: 10, height: 16, push: 576 } },
      { pose: 'crouchHP', steps: 7 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchLK', steps: 3, strike: { ...PUSH_KICK, damage: 30, hitstun: 11, blockstun: 6, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 8 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 7 },
      { pose: 'crouchHK', steps: 4, strike: { ...ROUNDHOUSE, width: 18, height: 8, damage: 95, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 10 },
      { pose: 'crouch', steps: 9 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 7, strike: { ...JAB, damage: 40, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHP', steps: 6, strike: { ...CROSS, damage: 85, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 12, strike: { ...PUSH_KICK, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHK', steps: 11, strike: { ...ROUNDHOUSE, damage: 95, hitstun: 18, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
