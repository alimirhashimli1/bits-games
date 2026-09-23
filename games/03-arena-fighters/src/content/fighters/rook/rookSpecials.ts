import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const FLIP_KICK: Strike = {
  limb: 'nearFoot',
  width: 16,
  height: 22,
  damage: 110,
  chip: 18,
  hitstun: 22,
  blockstun: 18,
  push: 640,
  guard: 'mid',
  knockdown: true,
};

/** Rook's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const ROOK_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Rail Shot (→ + P): he draws both fists back and drives them out together, firing a crescent
     * of compressed air down the arena, much faster than a fireball. The heavy punch fires it
     * faster still.
     */
    name: 'railShot',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 11,
      fromLimb: 'nearHand',
      forwardPx: 6,
      speed: { light: 896, heavy: 1152 },
      width: 16,
      height: 10,
      strike: { damage: 65, chip: 12, hitstun: 18, blockstun: 16, push: 640, guard: 'mid' },
      sprite: 'railShot',
    },
    move: {
      segments: [
        { pose: 'railWindup', steps: 11 },
        { pose: 'railRelease', steps: 20 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
  {
    /**
     * Hook Flip (↓ → + P): he springs up and flips over backwards, the kicking leg sweeping up in
     * an arc in front of him. It cannot be hit as it starts, so it beats a jump-in cleanly, and it
     * is wide open if it misses. The heavy punch flips higher, and stays safe from hits longer.
     */
    name: 'hookFlip',
    motion: 'downForward',
    behaviour: {
      kind: 'rising',
      launchStep: 3,
      rise: { light: 1344, heavy: 1600 },
      drift: { light: 128, heavy: 192 },
      invulnerableSteps: { light: 6, heavy: 10 },
    },
    move: {
      segments: [
        { pose: 'hookCrouch', steps: 3 },
        { pose: 'hookFlip', steps: 10, strike: FLIP_KICK },
        // Held until he lands, however long that takes, then the recovery on landing.
        { pose: 'jumpTuck', steps: 60 },
        { pose: 'crouch', steps: 16 },
      ],
    },
  },
];
