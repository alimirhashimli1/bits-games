import type { SpecialMove } from '../specials';

/**
 * Rajab's special moves, on the two motions every fighter shares. Card Toss comes first: a
 * charge held while doing ← ↓ → would also read as Bluff.
 */
export const RAJAB_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Card Toss (← ↓ → + P): a flick of the wrist sends razor-edged cards spinning across the
     * arena. They fly faster than a fireball and he recovers sooner, but they hurt less. The
     * heavy punch throws them faster still.
     */
    name: 'cardToss',
    motion: 'halfCircleForward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 8,
      fromLimb: 'nearHand',
      forwardPx: 6,
      speed: { light: 896, heavy: 1216 },
      width: 10,
      height: 7,
      strike: { damage: 60, chip: 11, hitstun: 15, blockstun: 13, push: 512, guard: 'mid' },
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
     * Bluff (hold ←, then → + P): he opens his arms and dares a blow. Anything thrown at him by
     * hand or foot in that moment is caught and answered with a backhand that knocks down.
     * Projectiles and throws are not caught, and if nothing comes he is left open.
     */
    name: 'bluff',
    motion: 'chargeBackForward',
    behaviour: {
      kind: 'counter',
      catchStart: 3,
      catchEnd: 25,
      answerStep: 40,
      answer: { damage: 115, hitstun: 20, blockstun: 0, push: 640, guard: 'mid', knockdown: true },
    },
    move: {
      segments: [
        { pose: 'bluffStance', steps: 3 },
        { pose: 'bluffStance', steps: 22 },
        { pose: 'idle2', steps: 15 },
        // Only reached when a blow was caught.
        { pose: 'bluffAnswer', steps: 18 },
      ],
    },
  },
];
