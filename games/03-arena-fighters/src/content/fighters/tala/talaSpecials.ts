import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const SPIN: Strike = {
  limb: 'nearFoot',
  width: 16,
  height: 12,
  damage: 68,
  chip: 11,
  hitstun: 18,
  blockstun: 14,
  push: 640,
  guard: 'mid',
};

/**
 * The legs whipping over the top of the cartwheel. They come round high, so the box sits well
 * above the floor, but she is on the ground throughout, so it is blocked either way like any
 * other ground attack. It hits a little softer than the Whirl Kick and pushes less, since she
 * passes through whoever she hits and would otherwise be both safe and hard-hitting.
 */
const CARTWHEEL_KICK: Strike = {
  limb: 'nearFoot',
  width: 14,
  height: 14,
  damage: 55,
  chip: 8,
  hitstun: 15,
  blockstun: 11,
  push: 448,
  guard: 'mid',
};

/** Tala's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const TALA_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Whirl Kick (→ + P): she spins forward across the floor, legs sweeping round. Wide open if
     * blocked. It carries her far enough to reach from the spacing fighters actually stand at:
     * at 448 she covered about 32 pixels and the kick fell short of anyone more than 64 away,
     * which is nearer than a round even starts, so it spun through thin air more often than not.
     */
    name: 'whirlKick',
    motion: 'forward',
    behaviour: { kind: 'dash', startStep: 4, endStep: 22, speed: { light: 640, heavy: 832 } },
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
     * Cartwheel (↓ → + P): she turns over on her hands and travels, the legs coming round hard
     * over the top. Projectiles pass through her, and so does her opponent, so she can come down
     * on the other side of them, and the legs land a blow on the way past.
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
        { pose: 'cartwheel1', steps: 6, strike: CARTWHEEL_KICK },
        { pose: 'cartwheel2', steps: 6, strike: CARTWHEEL_KICK },
        { pose: 'cartwheel1', steps: 6, strike: CARTWHEEL_KICK },
        { pose: 'crouch', steps: 12 },
      ],
    },
  },
];
