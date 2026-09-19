import type { FighterMoves, Strike } from '../moves';

/*
 * Brand's normals. Steps are fight steps (60 per second), damage is out of 1000 health and
 * push is a slide speed in sub-pixels per step. Lights are quick, chain into each other and
 * leave him ahead when they connect; heavies wind up longer, reach further and hurt more, and
 * leave him open for longer if they miss.
 */

const LIGHT = { hitstun: 12, blockstun: 8, push: 384 } as const;
const HEAVY = { hitstun: 18, blockstun: 14, push: 768 } as const;

const JAB: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 30, guard: 'mid' };
const STRAIGHT: Strike = { ...HEAVY, limb: 'farHand', width: 12, height: 10, damage: 90, guard: 'mid' };
const SNAP_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 12, height: 8, damage: 40, guard: 'mid' };
const ROUNDHOUSE: Strike = { ...HEAVY, limb: 'nearFoot', width: 14, height: 12, damage: 100, hitstun: 20, push: 896, guard: 'mid' };

export const BRAND_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLP', steps: 3, strike: JAB },
      { pose: 'idle2', steps: 6 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 6 },
      { pose: 'standHP', steps: 4, strike: STRAIGHT },
      { pose: 'standHP', steps: 6 },
      { pose: 'standHPWindup', steps: 8 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 4, strike: SNAP_KICK },
      { pose: 'standHKWindup', steps: 8 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 8 },
      { pose: 'standHK', steps: 5, strike: ROUNDHOUSE },
      { pose: 'standHK', steps: 6 },
      { pose: 'standHKWindup', steps: 10 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 3, strike: { ...JAB, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** The uppercut: his answer to jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 5 },
      { pose: 'crouchHP', steps: 5, strike: { ...STRAIGHT, limb: 'nearHand', width: 10, height: 14, push: 640 } },
      { pose: 'crouchHP', steps: 8 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  /** A shin poke: low, so it must be blocked crouching. */
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 4, strike: { ...SNAP_KICK, damage: 30, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 7 },
    ],
  },
  /** The sweep: low, and it knocks down. Very punishable if blocked. */
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 6 },
      {
        pose: 'crouchHK',
        steps: 4,
        strike: { ...ROUNDHOUSE, width: 16, height: 8, damage: 90, push: 512, guard: 'low', knockdown: true },
      },
      { pose: 'crouchHK', steps: 12 },
      { pose: 'crouch', steps: 8 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 8, strike: { ...JAB, damage: 40, push: 384, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHP', steps: 6, strike: { ...STRAIGHT, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 14, strike: { ...SNAP_KICK, push: 384, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 5 },
      { pose: 'jumpHK', steps: 12, strike: { ...ROUNDHOUSE, hitstun: 18, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
