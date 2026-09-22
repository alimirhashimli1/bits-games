import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const LION_PALM: Strike = {
  limb: 'nearHand',
  width: 14,
  height: 12,
  damage: 75,
  chip: 12,
  hitstun: 22,
  blockstun: 13,
  push: 896,
  guard: 'mid',
};

const HEEL: Strike = {
  limb: 'nearFoot',
  width: 20,
  height: 14,
  damage: 105,
  chip: 18,
  hitstun: 20,
  blockstun: 18,
  push: 512,
  guard: 'mid',
  knockdown: true,
};

/** Mahmood's special moves, on the two motions every fighter shares: → + P and ↓ → + P. */
export const MAHMOOD_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Lion Palm (→ + P): a long lunge behind his outstretched front arm, which stops on whatever it meets.
     * The heavy punch lunges further.
     */
    name: 'lionPalm',
    motion: 'forward',
    behaviour: { kind: 'dash', startStep: 9, endStep: 18, speed: { light: 640, heavy: 896 }, stopsOnContact: true },
    move: {
      segments: [
        { pose: 'standHPWindup', steps: 9 },
        { pose: 'palmLunge', steps: 9, strike: LION_PALM },
        { pose: 'palmLunge', steps: 8 },
        { pose: 'idle2', steps: 16 },
      ],
    },
  },
  {
    /**
     * Rising Heel (↓ → + P): he springs low and flat across the floor with his heel driven
     * straight out in front. It cannot be hit as it starts (longer for the heavy version, which
     * also flies further), and it is wide open on landing if it misses.
     */
    name: 'risingHeel',
    motion: 'downForward',
    behaviour: {
      kind: 'rising',
      launchStep: 4,
      rise: { light: 320, heavy: 448 },
      drift: { light: 640, heavy: 896 },
      invulnerableSteps: { light: 5, heavy: 9 },
    },
    move: {
      segments: [
        { pose: 'heelCrouch', steps: 4 },
        { pose: 'heelRise', steps: 8, strike: HEEL },
        // Held until he lands, then the recovery on landing.
        { pose: 'heelRise', steps: 60 },
        { pose: 'crouch', steps: 14 },
      ],
    },
  },
];
