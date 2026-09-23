import type { SpecialMove } from '../specials';

/** Osal's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const OSAL_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Rifle Shot (→ + P): he brings his service rifle to his shoulder and fires a single round
     * down the arena. It flies faster than anything else thrown, and hurts about as much as a
     * card for it. The heavy punch sends it faster still.
     */
    name: 'rifleShot',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 9,
      fromLimb: 'nearHand',
      forwardPx: 6,
      speed: { light: 1024, heavy: 1344 },
      width: 14,
      height: 6,
      strike: { damage: 75, chip: 14, hitstun: 17, blockstun: 14, push: 512, guard: 'mid' },
      sprite: 'tracer',
    },
    move: {
      segments: [
        { pose: 'rifleAim', steps: 9 },
        { pose: 'rifleFire', steps: 13 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
  {
    /**
     * Grenade (↓ → + P): he pulls the pin and lobs one over. It arcs and falls, so it only
     * reaches a little way in front of him, and bursts where it lands for a knockdown. The heavy
     * punch throws it further. Slow enough to walk out of, so it is for pushing someone back
     * rather than for catching them out.
     */
    name: 'grenadeToss',
    motion: 'downForward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 10,
      fromLimb: 'nearHand',
      forwardPx: 2,
      speed: { light: 512, heavy: 640 },
      arc: { light: 900, heavy: 1000 },
      width: 10,
      height: 10,
      burst: { steps: 14, width: 26, height: 18 },
      strike: { damage: 85, chip: 16, hitstun: 20, blockstun: 16, push: 704, guard: 'mid', knockdown: true },
      sprite: 'grenade',
    },
    move: {
      segments: [
        { pose: 'grenadePull', steps: 10 },
        { pose: 'grenadeThrow', steps: 18 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
];
