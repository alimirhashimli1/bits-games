import type { SpecialMove } from '../specials';

/**
 * Osal's special moves, on the two motions every fighter shares. Field Tackle comes first: a
 * charge held while doing ← ↓ → would also read as Adrenaline.
 */
export const OSAL_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Field Tackle (← ↓ → + P, up close): he dives in low, drives his shoulder through and pins
     * the opponent to the floor. It cannot be blocked or broken. It reaches as far as
     * Grom's Boulder Toss but hurts less; the light punch reaches further, the heavy hurts more.
     */
    name: 'fieldTackle',
    motion: 'halfCircleForward',
    behaviour: {
      kind: 'commandThrow',
      rangePx: { light: 40, heavy: 35 },
      damage: { light: 150, heavy: 180 },
      hold: [
        { pose: 'tackleDrive', steps: 10 },
        { pose: 'tacklePin', steps: 16 },
      ],
      tossSpeed: 192,
      tossPop: 384,
    },
    move: {
      segments: [
        { pose: 'tackleDive', steps: 3 },
        { pose: 'tackleDive', steps: 4, grab: true },
        { pose: 'tackleDive', steps: 14 },
        { pose: 'crouch', steps: 12 },
      ],
    },
  },
  {
    /**
     * Adrenaline (hold ←, then → + P): he jabs a shot into his own thigh and wins back health,
     * 100 with the light punch or 140 with the heavy. Once per round; a hit before the shot takes
     * effect wastes it, and he is wide open for the whole of it.
     */
    name: 'adrenaline',
    motion: 'chargeBackForward',
    behaviour: { kind: 'heal', healStep: 30, amount: { light: 100, heavy: 140 } },
    move: {
      segments: [
        { pose: 'adrenalineInject', steps: 30 },
        { pose: 'adrenalineFlex', steps: 20 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
];
