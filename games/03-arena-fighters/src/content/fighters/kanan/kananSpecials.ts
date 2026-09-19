import type { Strike } from '../moves';
import type { SpecialMove } from '../specials';

const SHOULDER: Strike = {
  limb: 'head',
  width: 16,
  height: 18,
  damage: 120,
  chip: 18,
  hitstun: 22,
  blockstun: 16,
  push: 832,
  guard: 'mid',
  knockdown: true,
};

/**
 * Kanan's special moves, on the two motions every fighter shares. Quake Stomp comes first: a
 * charge held while doing ← ↓ → would also read as Titan Rush.
 */
export const KANAN_SPECIALS: readonly SpecialMove[] = [
  {
    /**
     * Quake Stomp (← ↓ → + P): he raises his knee high and stamps, and a shockwave rolls along
     * the floor. It hits low, so it must be blocked crouching, and it can be jumped. The heavy
     * punch sends it faster.
     */
    name: 'quakeStomp',
    motion: 'halfCircleForward',
    behaviour: {
      kind: 'projectile',
      spawnStep: 11,
      fromLimb: 'nearFoot',
      forwardPx: 10,
      upPx: 5,
      speed: { light: 512, heavy: 768 },
      width: 20,
      height: 10,
      strike: { damage: 90, chip: 15, hitstun: 18, blockstun: 16, push: 640, guard: 'low' },
      sprite: 'shockwave',
    },
    move: {
      segments: [
        { pose: 'stompRaise', steps: 10 },
        { pose: 'stompDown', steps: 24 },
        { pose: 'idle2', steps: 6 },
      ],
    },
  },
  {
    /**
     * Titan Rush (hold ←, then → + P): a shoulder charge that bursts straight through
     * projectiles and stops dead on whatever it meets, knocking it down. Punishable if blocked.
     */
    name: 'titanRush',
    motion: 'chargeBackForward',
    behaviour: {
      kind: 'dash',
      startStep: 7,
      endStep: 25,
      speed: { light: 640, heavy: 896 },
      projectileProof: true,
      stopsOnContact: true,
    },
    move: {
      segments: [
        { pose: 'rushWindup', steps: 7 },
        { pose: 'rushCharge', steps: 18, strike: SHOULDER },
        { pose: 'rushWindup', steps: 22 },
      ],
    },
  },
];
