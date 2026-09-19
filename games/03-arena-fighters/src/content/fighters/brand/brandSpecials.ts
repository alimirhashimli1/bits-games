import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const UPPERCUT: Strike = {
  limb: 'nearHand',
  width: 20,
  height: 24,
  damage: 110,
  chip: 20,
  hitstun: 20,
  blockstun: 18,
  push: 512,
  guard: 'mid',
  knockdown: true,
};

/**
 * Brand's special moves, on the two motions every fighter shares. Ember Shot comes first: a
 * charge held while doing ← ↓ → would also read as Flare Rise.
 */
export const BRAND_SPECIALS: readonly SpecialMove[] = [
  {
    /** Ember Shot (← ↓ → + P): a fireball. The heavy punch throws a faster one. */
    name: 'emberShot',
    motion: 'halfCircleForward',
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
     * Flare Rise (hold ←, then → + P): a rising uppercut that cannot be hit as it starts, and is
     * wide open if it misses. Holding a block charges it, ready to meet a jump-in.
     */
    name: 'flareRise',
    motion: 'chargeBackForward',
    behaviour: {
      kind: 'rising',
      launchStep: 3,
      rise: { light: 1200, heavy: 1600 },
      drift: { light: 192, heavy: 320 },
      invulnerableSteps: { light: 4, heavy: 8 },
    },
    move: {
      segments: [
        { pose: 'flareCrouch', steps: 3 },
        // Out of the crouch the fist comes up in front of him, then carries on high overhead.
        { pose: 'crouchHP', steps: 3, strike: UPPERCUT },
        { pose: 'flareRise', steps: 6, strike: UPPERCUT },
        // Held until he lands, however long that takes, then the recovery on landing.
        { pose: 'flareRise', steps: 60 },
        { pose: 'crouch', steps: 14 },
      ],
    },
  },
];
