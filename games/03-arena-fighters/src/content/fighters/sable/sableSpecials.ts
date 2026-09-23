import type { SpecialMove } from '../specials';

/** Sable's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const SABLE_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Shade Orb (→ + P): she gathers the dark between her palms and sends it across the floor.
     * The light punch sends it level, at a fighter's chest, so a crouch goes under it; the heavy
     * punch angles it upwards, where it climbs as it goes and catches anyone in the air.
     */
    name: 'shadeOrb',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 10,
      fromLimb: 'nearHand',
      forwardPx: 6,
      speed: { light: 832, heavy: 768 },
      climb: { light: 0, heavy: 224 },
      width: 14,
      height: 14,
      strike: { damage: 80, chip: 14, hitstun: 18, blockstun: 16, push: 576, guard: 'mid' },
      sprite: 'shadeOrb',
    },
    move: {
      segments: [
        { pose: 'orbGather', steps: 10 },
        { pose: 'orbRelease', steps: 18 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
  {
    /**
     * Veil Step (↓ → + P): she folds into her cloak and is gone, and comes back on the other side
     * of the opponent, facing them. From step 5 to step 17 there is nothing of her to hit. She
     * does no damage with it: what it buys her is their back. The light punch puts her close
     * behind them, the heavy one further out of reach of whatever they turn round with.
     */
    name: 'veilStep',
    motion: 'downForward',
    behaviour: {
      kind: 'teleport',
      vanishStep: 5,
      appearStep: 17,
      behindPx: { light: 22, heavy: 40 },
    },
    move: {
      segments: [
        { pose: 'veilVanish', steps: 5 },
        // Gone: no hurtboxes, and nothing drawn.
        { pose: 'veilVanish', steps: 12 },
        { pose: 'veilAppear', steps: 6 },
        { pose: 'idle2', steps: 4 },
      ],
    },
  },
];
