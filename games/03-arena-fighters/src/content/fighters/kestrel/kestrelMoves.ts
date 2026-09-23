import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Kestrel's normals: quick and light on the ground, where he does not like to stay, and strong in
 * the air, where his jumping attacks hit harder and stay out longer than anyone's. Steps are
 * fight steps (60 per second), damage is out of 1000 health and push is a slide speed in
 * sub-pixels per step.
 */

const LIGHT = { hitstun: 11, blockstun: 7, push: 352 } as const;
const HEAVY = { hitstun: 17, blockstun: 13, push: 704 } as const;

const CLAW: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 35, guard: 'mid' };
const RAKE: Strike = { ...HEAVY, limb: 'farHand', width: 12, height: 12, damage: 90, guard: 'mid' };
const SNAP_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 8, damage: 45, guard: 'mid' };
const CRESCENT: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 12, damage: 95, hitstun: 19, push: 832, guard: 'mid' };

/** Quick on his feet, with the highest and furthest jump in the game. */
export const KESTREL_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 416,
  walkBack: 352,
  jumpForward: 544,
  jumpBack: 448,
  jumpVelocity: 1536,
};

export const KESTREL_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 2 },
      { pose: 'standLP', steps: 3, strike: CLAW },
      { pose: 'idle2', steps: 5 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 6 },
      { pose: 'standHP', steps: 3, strike: RAKE },
      { pose: 'standHP', steps: 5 },
      { pose: 'standHPWindup', steps: 7 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 3 },
      { pose: 'standLK', steps: 3, strike: SNAP_KICK },
      { pose: 'standHKWindup', steps: 7 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 7 },
      { pose: 'standHK', steps: 4, strike: CRESCENT },
      { pose: 'standHK', steps: 5 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 2 },
      { pose: 'crouchLP', steps: 3, strike: { ...CLAW, hitstun: 10, blockstun: 6, push: 288 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** A rising claw against jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchHP', steps: 5, strike: { ...RAKE, limb: 'nearHand', width: 10, height: 16, push: 576 } },
      { pose: 'crouchHP', steps: 6 },
      { pose: 'crouch', steps: 7 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 3, strike: { ...SNAP_KICK, damage: 25, hitstun: 10, blockstun: 6, push: 288, guard: 'low' } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 6 },
      { pose: 'crouchHK', steps: 4, strike: { ...CRESCENT, width: 16, height: 8, damage: 95, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 11 },
      { pose: 'crouch', steps: 8 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them. His are his best.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 2 },
      { pose: 'jumpLP', steps: 9, strike: { ...CLAW, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHP', steps: 8, strike: { ...RAKE, width: 14, damage: 95, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 2 },
      { pose: 'jumpLK', steps: 16, strike: { ...SNAP_KICK, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHK', steps: 14, strike: { ...CRESCENT, width: 16, height: 14, damage: 115, hitstun: 19, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
