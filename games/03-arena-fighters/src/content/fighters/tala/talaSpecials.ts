import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const SPIN: Strike = {
  limb: 'nearFoot',
  width: 16,
  height: 12,
  damage: 75,
  chip: 12,
  hitstun: 18,
  blockstun: 14,
  push: 640,
  guard: 'mid',
};

/** Tala's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const TALA_SPECIALS: readonly SpecialMove[] = [
  {
    /** Whirl Kick (→ + P): she spins forward across the floor, legs sweeping round. Wide open if blocked. */
    name: 'whirlKick',
    motion: 'forward',
    behaviour: { kind: 'dash', startStep: 4, endStep: 22, speed: { light: 448, heavy: 640 } },
    move: {
      segments: [
        { pose: 'standHKWindup', steps: 4 },
        { pose: 'whirlKick1', steps: 3, strike: SPIN },
        { pose: 'whirlKick2', steps: 3, strike: { ...SPIN, limb: 'farFoot' } },
        { pose: 'whirlKick1', steps: 3, strike: SPIN },
        { pose: 'whirlKick2', steps: 3, strike: { ...SPIN, limb: 'farFoot' } },
        { pose: 'whirlKick1', steps: 3, strike: SPIN },
        { pose: 'whirlKick2', steps: 3 },
        { pose: 'crouch', steps: 18 },
      ],
    },
  },
  {
    /**
     * Cartwheel (↓ → + P): she turns over on her hands and travels. Projectiles pass
     * through her, and so does her opponent, so she can come down on the other side of them.
     */
    name: 'cartwheel',
    motion: 'downForward',
    behaviour: {
      kind: 'dash',
      startStep: 3,
      endStep: 21,
      speed: { light: 640, heavy: 896 },
      projectileProof: true,
      passThrough: true,
    },
    move: {
      segments: [
        { pose: 'crouch', steps: 3 },
        { pose: 'cartwheel1', steps: 6 },
        { pose: 'cartwheel2', steps: 6 },
        { pose: 'cartwheel1', steps: 6 },
        { pose: 'crouch', steps: 8 },
      ],
    },
  },
];
