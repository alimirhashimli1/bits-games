import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const TALON: Strike = {
  limb: 'nearFoot',
  width: 14,
  height: 14,
  damage: 100,
  chip: 13,
  hitstun: 21,
  blockstun: 16,
  push: 512,
  guard: 'overhead',
};

const POUNCE: Strike = {
  limb: 'nearFoot',
  width: 18,
  height: 14,
  damage: 95,
  chip: 16,
  hitstun: 20,
  blockstun: 16,
  push: 640,
  guard: 'overhead',
  knockdown: true,
};

/** Kestrel's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const KESTREL_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Talon Dive (→ + P): he springs up and forward, then drops out of the air in a steep dive
     * kick, foot first. Like any attack from the air, it must be blocked standing. The heavy
     * punch dives further.
     */
    name: 'talonDive',
    motion: 'forward',
    behaviour: {
      kind: 'dive',
      launchStep: 4,
      rise: { light: 1280, heavy: 1280 },
      drift: { light: 448, heavy: 448 },
      diveStep: 16,
      diveForward: { light: 1024, heavy: 1280 },
      diveDown: { light: 768, heavy: 768 },
    },
    move: {
      segments: [
        { pose: 'crouch', steps: 4 },
        { pose: 'jumpTuck', steps: 12 },
        // Held until he lands, however long that takes, then the recovery on landing.
        { pose: 'talonDive', steps: 60, strike: TALON },
        { pose: 'crouch', steps: 14 },
      ],
    },
  },
  {
    /**
     * Wall Leap (↓ → + P): he flips backwards to the edge behind him and springs off it, flying
     * back across the arena feet first for a knockdown. It is his way out of a corner. The light
     * punch is a short hop back, for a wall close behind; the heavy one leaps far enough to reach the
     * edge of the screen from where a round starts, and flies faster off it. If the edge is out of
     * reach, he simply lands, wide open.
     */
    name: 'wallLeap',
    motion: 'downForward',
    behaviour: {
      kind: 'wallLeap',
      launchStep: 3,
      rise: { light: 960, heavy: 1088 },
      back: { light: 1152, heavy: 1472 },
      springStep: 7,
      springForward: { light: 1024, heavy: 1280 },
      springUp: { light: 640, heavy: 640 },
    },
    move: {
      segments: [
        { pose: 'crouch', steps: 3 },
        // The last of these is held until he reaches the edge.
        { pose: 'wallFlip', steps: 4 },
        // Pushing off the wall, then flying feet first until he lands.
        { pose: 'wallPounce', steps: 4 },
        { pose: 'wallPounce', steps: 60, strike: POUNCE },
        { pose: 'crouch', steps: 16 },
      ],
    },
  },
];
