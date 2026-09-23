import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const AXE_HEEL: Strike = {
  limb: 'nearFoot',
  width: 16,
  height: 18,
  damage: 100,
  chip: 15,
  hitstun: 22,
  blockstun: 13,
  push: 576,
  guard: 'overhead',
};

/** Nova's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const NOVA_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Static Wave (→ + P): a side kick that sends a ball of crackling charge off her foot. It
     * drifts across the arena slowly, so she can walk in behind it. The heavy punch sends it a
     * little faster.
     */
    name: 'staticWave',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 12,
      fromLimb: 'nearFoot',
      forwardPx: 6,
      speed: { light: 384, heavy: 544 },
      width: 14,
      height: 12,
      strike: { damage: 80, chip: 15, hitstun: 18, blockstun: 16, push: 640, guard: 'mid' },
      sprite: 'staticWave',
    },
    move: {
      segments: [
        { pose: 'waveChamber', steps: 12 },
        { pose: 'waveKick', steps: 11 },
        { pose: 'standHKWindup', steps: 8 },
        { pose: 'idle2', steps: 4 },
      ],
    },
  },
  {
    /**
     * Thunder Heel (↓ → + P): she steps in with her leg swung straight up and brings the heel
     * down like an axe. It is an overhead, so it must be blocked standing, and it beats a
     * crouching guard. It is slow to come out, and a little unsafe when blocked. The heavy punch
     * steps further.
     */
    name: 'thunderHeel',
    motion: 'downForward',
    behaviour: { kind: 'dash', startStep: 2, endStep: 12, speed: { light: 384, heavy: 576 } },
    move: {
      segments: [
        { pose: 'standHKWindup', steps: 3 },
        { pose: 'heelRaise', steps: 9 },
        { pose: 'heelDrop', steps: 4, strike: AXE_HEEL },
        { pose: 'heelDrop', steps: 6 },
        { pose: 'standHKWindup', steps: 8 },
      ],
    },
  },
];
