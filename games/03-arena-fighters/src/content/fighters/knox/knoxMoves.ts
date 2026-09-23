import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Knox's normals: a boxer's, so every one of them is a punch. The punch buttons throw the jab
 * and the cross at the head; the kick buttons throw hooks and digs to the body, which is why his
 * "kicks" strike with a fist. Nothing he does reaches far, and everything comes out fast. Steps
 * are fight steps (60 per second), damage is out of 1000 health and push is a slide speed in
 * sub-pixels per step.
 */

const LIGHT = { hitstun: 12, blockstun: 8, push: 352 } as const;
const HEAVY = { hitstun: 18, blockstun: 14, push: 704 } as const;

const JAB: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 8, damage: 30, guard: 'mid' };
const CROSS: Strike = { ...HEAVY, limb: 'farHand', width: 12, height: 10, damage: 90, guard: 'mid' };
const BODY_HOOK: Strike = { ...LIGHT, limb: 'nearHand', width: 10, height: 9, damage: 35, guard: 'mid' };
const RIB_HOOK: Strike = { ...HEAVY, limb: 'farHand', width: 13, height: 11, damage: 95, push: 768, guard: 'mid' };

/** The quickest feet in the game on the ground, and a boxer's short jump. */
export const KNOX_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 448,
  walkBack: 400,
  jumpForward: 416,
  jumpBack: 352,
  jumpVelocity: 1328,
};

export const KNOX_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 2 },
      { pose: 'standLP', steps: 3, strike: JAB },
      { pose: 'idle2', steps: 5 },
    ],
  },
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 5 },
      { pose: 'standHP', steps: 4, strike: CROSS },
      { pose: 'standHP', steps: 5 },
      { pose: 'standHPWindup', steps: 8 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLK', steps: 3, strike: BODY_HOOK },
      { pose: 'idle2', steps: 6 },
    ],
  },
  standHK: {
    cancel: 'special',
    segments: [
      { pose: 'standHKWindup', steps: 7 },
      { pose: 'standHK', steps: 4, strike: RIB_HOOK },
      { pose: 'standHK', steps: 6 },
      { pose: 'standHKWindup', steps: 9 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 2 },
      { pose: 'crouchLP', steps: 3, strike: { ...JAB, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** The uppercut: his answer to jump-ins. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 4 },
      { pose: 'crouchHP', steps: 5, strike: { ...CROSS, limb: 'nearHand', width: 11, height: 18, push: 640 } },
      { pose: 'crouchHP', steps: 7 },
      { pose: 'crouch', steps: 8 },
    ],
  },
  /** A dig to the body, which has to be blocked crouching. */
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 3, strike: { ...BODY_HOOK, damage: 30, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  /** A heavy hook under the ribs that puts them on the floor. */
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 6 },
      { pose: 'crouchHK', steps: 4, strike: { ...RIB_HOOK, damage: 85, push: 512, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 12 },
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
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHP', steps: 7, strike: { ...CROSS, damage: 90, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 9, strike: { ...BODY_HOOK, damage: 40, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHK', steps: 8, strike: { ...RIB_HOOK, damage: 90, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
