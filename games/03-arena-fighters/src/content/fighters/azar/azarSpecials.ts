import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const STING: Strike = {
  limb: 'nearHand',
  width: 12,
  height: 8,
  damage: 75,
  chip: 14,
  hitstun: 20,
  blockstun: 14,
  push: 640,
  guard: 'mid',
};

/** Azar's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const AZAR_SPECIALS: readonly SpecialMove[] = [
  {
    /** Syringe Dart (→ + P): he throws an injection overhand, needle first. The heavy punch throws it faster. */
    name: 'syringeDart',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 7,
      fromLimb: 'nearHand',
      forwardPx: 4,
      speed: { light: 896, heavy: 1216 },
      width: 14,
      height: 5,
      strike: { damage: 65, chip: 12, hitstun: 17, blockstun: 14, push: 576, guard: 'mid' },
      sprite: 'syringe',
    },
    move: {
      segments: [
        { pose: 'dartWindup', steps: 7 },
        { pose: 'dartThrow', steps: 18 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
  {
    /**
     * Needle Sting (↓ → + P): a fencer's lunge that jabs a needle home, quick to
     * come out and stopping on whatever it meets. The heavy punch lunges further.
     */
    name: 'needleSting',
    motion: 'downForward',
    behaviour: { kind: 'dash', startStep: 6, endStep: 14, speed: { light: 832, heavy: 1088 }, stopsOnContact: true },
    move: {
      segments: [
        { pose: 'dartWindup', steps: 6 },
        { pose: 'stingLunge', steps: 8, strike: STING },
        { pose: 'stingLunge', steps: 5 },
        { pose: 'idle2', steps: 14 },
      ],
    },
  },
];
