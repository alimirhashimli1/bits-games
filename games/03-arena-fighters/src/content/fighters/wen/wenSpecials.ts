import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

/** The burst of force in front of his palms: a big box, and a shove that sends them a long way. */
const SPIRIT_BURST: Strike = {
  limb: 'nearHand',
  width: 30,
  height: 22,
  damage: 100,
  chip: 16,
  hitstun: 20,
  blockstun: 16,
  push: 1216,
  guard: 'mid',
};

/** Old Wen's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const WEN_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Spirit Palm (→ + P): he gathers himself and drives both palms out with a short step, and a
     * burst of force goes out ahead of them, catching anything close in front and shoving it far
     * away. The heavy punch steps further.
     */
    name: 'spiritPalm',
    motion: 'forward',
    behaviour: { kind: 'dash', startStep: 7, endStep: 12, speed: { light: 384, heavy: 576 }, stopsOnContact: true },
    move: {
      segments: [
        { pose: 'spiritGather', steps: 8 },
        { pose: 'spiritPalm', steps: 5, strike: SPIRIT_BURST },
        { pose: 'spiritPalm', steps: 7 },
        { pose: 'idle2', steps: 7 },
      ],
    },
  },
  {
    /**
     * Crane Stance (↓ → + P): he rises onto one leg, arms spread, and waits. A punch or kick that
     * lands on him in the stance is caught, and he answers it at once with a beak-hand strike that
     * knocks the attacker down. Projectiles and throws are not caught, and if nothing comes he is
     * left standing on one leg.
     */
    name: 'craneStance',
    motion: 'downForward',
    behaviour: {
      kind: 'counter',
      catchStart: 3,
      catchEnd: 22,
      answerStep: 24,
      answer: { damage: 100, hitstun: 24, blockstun: 0, push: 768, guard: 'mid', knockdown: true },
    },
    move: {
      segments: [
        { pose: 'crouch', steps: 3 },
        { pose: 'craneStance', steps: 21 },
        { pose: 'craneAnswer', steps: 8 },
        { pose: 'craneAnswer', steps: 6 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
];
