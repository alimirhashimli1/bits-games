import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const RUSH: Strike = {
  limb: 'nearHand',
  width: 14,
  height: 10,
  damage: 70,
  chip: 12,
  hitstun: 17,
  blockstun: 14,
  push: 512,
  guard: 'mid',
};

const UPPERCUT: Strike = {
  limb: 'nearHand',
  width: 13,
  height: 22,
  damage: 105,
  chip: 16,
  hitstun: 21,
  blockstun: 16,
  push: 576,
  guard: 'mid',
  knockdown: true,
};

/** Knox's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const KNOX_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Rush Jab (→ + P): he throws himself across the floor behind a straight lead, faster than
     * anyone else travels. It stops dead on whatever it meets, and is safe enough up close to be
     * worth throwing again. The heavy punch covers more ground.
     */
    name: 'rushJab',
    motion: 'forward',
    behaviour: {
      kind: 'dash',
      startStep: 4,
      endStep: 16,
      speed: { light: 896, heavy: 1152 },
      stopsOnContact: true,
    },
    move: {
      segments: [
        { pose: 'rushWind', steps: 4 },
        { pose: 'rushJab', steps: 12, strike: RUSH },
        { pose: 'rushWind', steps: 12 },
      ],
    },
  },
  {
    /**
     * Dash Upper (↓ → + P): a shorter step in, sunk low, and then an uppercut straight up through
     * the middle that knocks them off their feet. Blocked, he is left standing there for a long
     * moment. The heavy punch steps further.
     */
    name: 'dashUpper',
    motion: 'downForward',
    behaviour: {
      kind: 'dash',
      startStep: 3,
      endStep: 11,
      speed: { light: 640, heavy: 896 },
      stopsOnContact: true,
    },
    move: {
      segments: [
        { pose: 'upperWind', steps: 11 },
        { pose: 'dashUpper', steps: 5, strike: UPPERCUT },
        { pose: 'dashUpper', steps: 8 },
        { pose: 'crouch', steps: 12 },
      ],
    },
  },
];
