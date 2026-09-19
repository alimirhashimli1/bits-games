import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const STING: Strike = {
  limb: 'nearHand',
  width: 12,
  height: 8,
  damage: 95,
  chip: 15,
  hitstun: 20,
  blockstun: 14,
  push: 640,
  guard: 'mid',
};

/**
 * Azar's special moves, on the two motions every fighter shares. Syringe Dart comes first: a
 * charge held while doing ← ↓ → would also read as Needle Sting.
 */
export const AZAR_SPECIALS: readonly SpecialMove[] = [
  {
    /** Syringe Dart (← ↓ → + P): he throws an injection overhand, needle first. The heavy punch throws it faster. */
    name: 'syringeDart',
    motion: 'halfCircleForward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 7,
      fromLimb: 'nearHand',
      forwardPx: 4,
      speed: { light: 896, heavy: 1216 },
      width: 14,
      height: 5,
      strike: { damage: 85, chip: 15, hitstun: 17, blockstun: 14, push: 576, guard: 'mid' },
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
     * Needle Sting (hold ←, then → + P): a fencer's lunge that jabs a needle home, quick to
     * come out and stopping on whatever it meets. The heavy punch lunges further.
     */
    name: 'needleSting',
    motion: 'chargeBackForward',
    behaviour: { kind: 'dash', startStep: 4, endStep: 12, speed: { light: 832, heavy: 1088 }, stopsOnContact: true },
    move: {
      segments: [
        { pose: 'dartWindup', steps: 4 },
        { pose: 'stingLunge', steps: 8, strike: STING },
        { pose: 'stingLunge', steps: 5 },
        { pose: 'idle2', steps: 14 },
      ],
    },
  },
];
