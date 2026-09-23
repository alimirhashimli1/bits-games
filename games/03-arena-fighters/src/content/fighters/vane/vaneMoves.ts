import { STANDARD_MOVEMENT, type FighterMovement } from '../fighterMovement';
import type { FighterMoves, Strike } from '../moves';

/*
 * Magnus Vane's normals. Steps are fight steps (60 per second), damage is out of 1000 health and
 * push is a slide speed in sub-pixels per step.
 *
 * He is long in the arm and long in the leg, and everything he throws hits harder than the same
 * button does for anyone on the roster. What he pays for it is time: his heavies wind up a step
 * longer than Brand's and stand there a good while afterwards, so a fighter who blocks one and
 * steps in has a real turn. That, and not a bigger health bar, is how he is beaten.
 */

const LIGHT = { hitstun: 13, blockstun: 9, push: 384 } as const;
const HEAVY = { hitstun: 20, blockstun: 15, push: 832 } as const;

const BACKHAND: Strike = { ...LIGHT, limb: 'nearHand', width: 12, height: 8, damage: 40, guard: 'mid' };
const SMASH: Strike = { ...HEAVY, limb: 'nearHand', width: 14, height: 13, damage: 120, push: 960, guard: 'mid' };
const PUSH_KICK: Strike = { ...LIGHT, limb: 'nearFoot', width: 14, height: 9, damage: 45, guard: 'mid' };
const HIGH_KICK: Strike = { ...HEAVY, limb: 'nearFoot', width: 16, height: 13, damage: 115, hitstun: 21, push: 960, guard: 'mid' };

/** He walks without hurrying, and jumps about as well as Brand: his game is on the floor. */
export const VANE_MOVEMENT: FighterMovement = {
  ...STANDARD_MOVEMENT,
  walkForward: 368,
  walkBack: 320,
};

export const VANE_MOVES: FighterMoves = {
  standLP: {
    cancel: 'chain',
    segments: [
      { pose: 'idle2', steps: 3 },
      { pose: 'standLP', steps: 3, strike: BACKHAND },
      { pose: 'idle2', steps: 6 },
    ],
  },
  /** The overhand smash: his hardest normal, and the longest to put away again. */
  standHP: {
    cancel: 'special',
    segments: [
      { pose: 'standHPWindup', steps: 7 },
      { pose: 'standHP', steps: 4, strike: SMASH },
      { pose: 'standHP', steps: 7 },
      { pose: 'standHPWindup', steps: 10 },
    ],
  },
  standLK: {
    cancel: 'chain',
    segments: [
      { pose: 'standHKWindup', steps: 4 },
      { pose: 'standLK', steps: 4, strike: PUSH_KICK },
      { pose: 'standHKWindup', steps: 9 },
    ],
  },
  standHK: {
    segments: [
      { pose: 'standHKWindup', steps: 9 },
      { pose: 'standHK', steps: 4, strike: HIGH_KICK },
      { pose: 'standHK', steps: 6 },
      { pose: 'standHKWindup', steps: 11 },
    ],
  },

  crouchLP: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLP', steps: 3, strike: { ...BACKHAND, damage: 32, hitstun: 11, blockstun: 7, push: 320 } },
      { pose: 'crouch', steps: 5 },
    ],
  },
  /** A rising backhand that takes a jump-in out of the air. */
  crouchHP: {
    cancel: 'special',
    segments: [
      { pose: 'crouch', steps: 5 },
      { pose: 'crouchHP', steps: 5, strike: { ...SMASH, width: 12, height: 19, damage: 105, push: 640 } },
      { pose: 'crouchHP', steps: 7 },
      { pose: 'crouch', steps: 9 },
    ],
  },
  crouchLK: {
    cancel: 'chain',
    segments: [
      { pose: 'crouch', steps: 3 },
      { pose: 'crouchLK', steps: 3, strike: { ...PUSH_KICK, damage: 32, hitstun: 11, blockstun: 7, push: 320, guard: 'low' } },
      { pose: 'crouch', steps: 6 },
    ],
  },
  /** The long sweep: it reaches further than anything else on the floor, and it knocks down. */
  crouchHK: {
    segments: [
      { pose: 'crouch', steps: 7 },
      { pose: 'crouchHK', steps: 4, strike: { ...HIGH_KICK, width: 18, height: 8, damage: 100, push: 576, guard: 'low', knockdown: true } },
      { pose: 'crouchHK', steps: 13 },
      { pose: 'crouch', steps: 9 },
    ],
  },

  // Jumping attacks are overheads and stay out until landing, which ends them.
  jumpLP: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLP', steps: 7, strike: { ...BACKHAND, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLP', steps: 30 },
    ],
  },
  jumpHP: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHP', steps: 7, strike: { ...SMASH, damage: 95, push: 512, guard: 'overhead' } },
      { pose: 'jumpHP', steps: 30 },
    ],
  },
  jumpLK: {
    segments: [
      { pose: 'jumpTuck', steps: 3 },
      { pose: 'jumpLK', steps: 10, strike: { ...PUSH_KICK, damage: 45, guard: 'overhead' } },
      { pose: 'jumpLK', steps: 30 },
    ],
  },
  jumpHK: {
    segments: [
      { pose: 'jumpTuck', steps: 4 },
      { pose: 'jumpHK', steps: 10, strike: { ...HIGH_KICK, damage: 100, push: 512, guard: 'overhead' } },
      { pose: 'jumpHK', steps: 30 },
    ],
  },
};
