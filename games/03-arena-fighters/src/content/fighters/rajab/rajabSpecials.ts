import type { SpecialMove } from '../specials';

/** Rajab's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const RAJAB_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Card Toss (→ + P): a flick of the wrist sends razor-edged cards spinning across the
     * arena, turning over as they fly. They go faster than a fireball and he recovers sooner,
     * but they hurt less. The heavy punch throws them faster still.
     */
    name: 'cardToss',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 8,
      fromLimb: 'nearHand',
      forwardPx: 6,
      speed: { light: 768, heavy: 1024 },
      width: 12,
      height: 9,
      strike: { damage: 45, chip: 8, hitstun: 15, blockstun: 13, push: 512, guard: 'mid' },
      sprite: 'card',
    },
    move: {
      segments: [
        { pose: 'cardWindup', steps: 8 },
        { pose: 'cardRelease', steps: 18 },
        { pose: 'idle2', steps: 4 },
      ],
    },
  },
  {
    /**
     * Roulette Roll (↓ → + P): he sends a little roulette wheel spinning low along the floor,
     * the ball still rattling round it at shin height. It must be blocked crouching, and it can
     * be jumped clean over. The heavy punch rolls it faster.
     */
    name: 'rouletteRoll',
    motion: 'downForward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 9,
      fromLimb: 'nearHand',
      forwardPx: 4,
      speed: { light: 704, heavy: 960 },
      width: 11,
      height: 10,
      strike: { damage: 50, chip: 10, hitstun: 17, blockstun: 14, push: 576, guard: 'low' },
      sprite: 'rouletteWheel',
    },
    move: {
      segments: [
        { pose: 'wheelWindup', steps: 9 },
        { pose: 'wheelRoll', steps: 18 },
        { pose: 'idle2', steps: 5 },
      ],
    },
  },
];
