import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

/** The fist driven up behind the crown: it knocks down, and it is what punishes a jump-in. */
const CROWN_FIST: Strike = {
  limb: 'nearHand',
  width: 15,
  height: 24,
  damage: 125,
  chip: 20,
  hitstun: 24,
  blockstun: 18,
  push: 704,
  guard: 'mid',
  knockdown: true,
};

/**
 * Magnus Vane's special moves, on the two motions every fighter shares: → + P and ↓ → + P.
 *
 * Between them they answer both ways past him: the crown holds the ground in front of him, and
 * the rising fist takes anyone who tries to go over the top. There is no third answer, which is
 * where the fight is won — at the range where the crown has gone by and the fist cannot reach.
 */
export const VANE_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Iron Verdict (→ + P): he lifts the Iron Crown off his own head and sends it spinning down
     * the arena, and it is back on his head by the time it matters. It flies level at chest
     * height, so a crouch goes under it; the heavy punch sends it faster. It hits harder than any
     * other fighter's projectile, and he recovers from it slowly enough to be walked down.
     */
    name: 'ironVerdict',
    motion: 'forward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 12,
      fromLimb: 'nearHand',
      forwardPx: 7,
      speed: { light: 768, heavy: 1024 },
      width: 18,
      height: 14,
      strike: { damage: 88, chip: 15, hitstun: 20, blockstun: 17, push: 640, guard: 'mid' },
      sprite: 'ironVerdict',
    },
    move: {
      segments: [
        { pose: 'verdictRaise', steps: 12 },
        { pose: 'verdictThrow', steps: 23 },
        { pose: 'idle2', steps: 8 },
      ],
    },
  },
  {
    /**
     * Crown Breaker (↓ → + P): he sinks and comes straight back up behind his fist, higher than
     * anyone else rises. Nothing can hit him as it starts, so it beats a jump-in outright, and the
     * heavy punch keeps him safe longer. Missed, he comes down into a long recovery on landing,
     * which is the opening worth baiting out.
     */
    name: 'crownBreaker',
    motion: 'downForward',
    behaviour: {
      kind: 'rising',
      launchStep: 4,
      rise: { light: 1408, heavy: 1664 },
      drift: { light: 160, heavy: 224 },
      invulnerableSteps: { light: 7, heavy: 11 },
    },
    move: {
      segments: [
        { pose: 'crownCrouch', steps: 4 },
        { pose: 'crownRise', steps: 11, strike: CROWN_FIST },
        // Held until he lands, however long that takes, then the recovery on landing.
        { pose: 'jumpTuck', steps: 60 },
        { pose: 'crouch', steps: 20 },
      ],
    },
  },
];
