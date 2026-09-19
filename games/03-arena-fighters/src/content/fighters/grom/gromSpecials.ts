import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const HEADBUTT: Strike = {
  limb: 'head',
  width: 16,
  height: 16,
  damage: 110,
  chip: 18,
  hitstun: 22,
  blockstun: 16,
  push: 768,
  guard: 'mid',
  knockdown: true,
};

/**
 * Grom's special moves. Boulder Toss comes first: its motion ends in → + P, which a charge
 * held long enough (say, while blocking) would also read as Ram.
 */
export const GROM_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Boulder Toss (← ↓ → + P, up close): he wraps the opponent up, hoists them overhead
     * and hurls them forward. It cannot be blocked or broken. The light punch reaches a little
     * further; the heavy one hurts more. A miss leaves him reaching at nothing for a long time.
     */
    name: 'boulderToss',
    motion: 'halfCircleForward',
    behaviour: {
      kind: 'commandThrow',
      rangePx: { light: 40, heavy: 34 },
      damage: { light: 190, heavy: 230 },
      hold: [
        { pose: 'boulderReach', steps: 6 },
        { pose: 'crouch', steps: 6 },
        { pose: 'boulderLift', steps: 20 },
        { pose: 'boulderHeave', steps: 8 },
      ],
      lift: { step: 12, heightPx: 57, forwardPx: 3 },
      tossSpeed: 320,
      tossPop: 512,
    },
    move: {
      segments: [
        { pose: 'boulderReach', steps: 2 },
        { pose: 'boulderReach', steps: 3, grab: true },
        { pose: 'boulderReach', steps: 16 },
        { pose: 'idle2', steps: 14 },
      ],
    },
  },
  {
    /**
     * Ram (hold ←, then → + P): he charges head first along the floor and stops dead on
     * whatever he meets. The heavy punch charges faster, so further. It knocks down on a hit,
     * and leaves him wide open if blocked.
     */
    name: 'ram',
    motion: 'chargeBackForward',
    behaviour: { kind: 'dash', startStep: 6, endStep: 22, speed: { light: 704, heavy: 1024 }, stopsOnContact: true },
    move: {
      segments: [
        { pose: 'ramWindup', steps: 6 },
        { pose: 'ramCharge', steps: 16, strike: HEADBUTT },
        { pose: 'ramWindup', steps: 24 },
      ],
    },
  },
];
