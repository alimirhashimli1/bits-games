import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const FLYING_PUNCH: Strike = {
  limb: 'nearHand',
  width: 22,
  height: 14,
  damage: 110,
  chip: 20,
  hitstun: 20,
  blockstun: 18,
  push: 512,
  guard: 'mid',
  knockdown: true,
};

/** Brand's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const BRAND_SPECIALS: readonly SpecialMove[] = [
  {
    /** Ember Shot (→ + P): a fireball. The heavy punch throws a faster one. */
    name: 'emberShot',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 10,
      fromLimb: 'nearHand',
      forwardPx: 6,
      speed: { light: 640, heavy: 1024 },
      width: 14,
      height: 10,
      strike: { damage: 70, chip: 15, hitstun: 18, blockstun: 16, push: 640, guard: 'mid' },
      sprite: 'emberShot',
    },
    move: {
      segments: [
        { pose: 'emberWindup', steps: 10 },
        { pose: 'emberRelease', steps: 26 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
  {
    /**
     * Flare Rise (↓ → + P): out of a crouch he leaps low and flat across the floor behind a
     * straight punch. It cannot be hit as it starts, and is wide open if it misses. The heavy
     * punch leaps further.
     */
    name: 'flareRise',
    motion: 'downForward',
    behaviour: {
      kind: 'rising',
      launchStep: 3,
      rise: { light: 320, heavy: 448 },
      drift: { light: 640, heavy: 896 },
      invulnerableSteps: { light: 4, heavy: 8 },
    },
    move: {
      segments: [
        { pose: 'flareCrouch', steps: 3 },
        { pose: 'flareRise', steps: 9, strike: FLYING_PUNCH },
        // Held until he lands, however long that takes, then the recovery on landing.
        { pose: 'flareRise', steps: 60 },
        { pose: 'crouch', steps: 14 },
      ],
    },
  },
];
