import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

/** The press itself: his whole body, coming down flat on top of them. */
const PRESS: Strike = {
  limb: 'head',
  width: 26,
  height: 16,
  damage: 90,
  chip: 14,
  hitstun: 20,
  blockstun: 16,
  push: 512,
  guard: 'overhead',
  knockdown: true,
};

/** Cometa's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const COMETA_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Star Clutch (→ + P, up close): he takes hold around the middle, arches right back and drops
     * them behind him. No block and no throw break helps against it, but a miss leaves him
     * reaching at thin air. The light punch reaches further; the heavy one hurts more.
     */
    name: 'starClutch',
    motion: 'forward',
    behaviour: {
      kind: 'commandThrow',
      rangePx: { light: 38, heavy: 32 },
      damage: { light: 152, heavy: 185 },
      hold: [
        { pose: 'clutchReach', steps: 5 },
        { pose: 'clutchHold', steps: 10 },
        { pose: 'clutchArch', steps: 18 },
        { pose: 'clutchHold', steps: 6 },
      ],
      // Lifted off the floor as he arches back, and thrown down behind him.
      lift: { step: 15, heightPx: 50, forwardPx: -4 },
      tossSpeed: 288,
      tossPop: 448,
    },
    move: {
      segments: [
        { pose: 'clutchReach', steps: 2 },
        { pose: 'clutchReach', steps: 3, grab: true },
        { pose: 'clutchReach', steps: 14 },
        { pose: 'idle2', steps: 12 },
      ],
    },
  },
  {
    /**
     * Comet Press (↓ → + P): he springs high and forward, arms spread like a star, and comes down
     * flat on top of them for a knockdown. Like any attack from the air it must be blocked
     * standing. The heavy punch carries him further across.
     */
    name: 'cometPress',
    motion: 'downForward',
    behaviour: {
      kind: 'dive',
      launchStep: 5,
      rise: { light: 1408, heavy: 1408 },
      drift: { light: 448, heavy: 576 },
      diveStep: 22,
      diveForward: { light: 704, heavy: 896 },
      diveDown: { light: 576, heavy: 576 },
    },
    move: {
      segments: [
        { pose: 'crouch', steps: 5 },
        { pose: 'cometLeap', steps: 17 },
        // Held flat out until he lands, however long that takes, then the recovery on landing.
        { pose: 'cometPress', steps: 60, strike: PRESS },
        { pose: 'crouch', steps: 16 },
      ],
    },
  },
];
