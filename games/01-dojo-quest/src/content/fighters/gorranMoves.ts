import { BOSS, BOSS_ATTACK_TIMING, COMBAT } from '../../config';
import type {
  AttackHeight,
  AttackKind,
  AttackMove,
  AttackMoveSet,
  AttackTiming,
  Hitbox,
} from '../../entities/fighterMoves';
import type { GorranPoseName } from './gorranPoses';
import type { HeroPoseName } from './heroPoses';

type GorranFrame = HeroPoseName | GorranPoseName;

function move(
  kind: AttackKind,
  height: AttackHeight,
  timing: AttackTiming,
  windupFrame: GorranFrame,
  strikeFrame: GorranFrame,
  hitbox: Hitbox,
  damage: number,
): AttackMove {
  return { kind, height, windupFrame, strikeFrame, hitbox, damage, ...timing };
}

/**
 * Gorran's moves. He is slower to start than his guards and reaches further, and his high
 * punch is replaced by the overhead smash: a long wind-up, a wide hitbox and three pips if
 * it lands. The wind-up is deliberately long enough to duck or step out of.
 */
export const GORRAN_MOVES: AttackMoveSet = {
  punch: {
    high: move(
      'punch',
      'high',
      BOSS_ATTACK_TIMING.smash,
      'smashWindup',
      'smashStrike',
      { x: 8, y: -30, width: 10, height: 12 },
      BOSS.smashDamage,
    ),
    mid: move(
      'punch',
      'mid',
      BOSS_ATTACK_TIMING.punch,
      'punchWindup',
      'punchMid',
      { x: 13, y: -33, width: 7, height: 6 },
      COMBAT.damage.punch,
    ),
    low: move(
      'punch',
      'low',
      BOSS_ATTACK_TIMING.punch,
      'punchWindup',
      'punchLow',
      { x: 11, y: -24, width: 7, height: 6 },
      COMBAT.damage.punch,
    ),
  },
  kick: {
    high: move(
      'kick',
      'high',
      BOSS_ATTACK_TIMING.kick,
      'kickChamber',
      'kickHigh',
      { x: 13, y: -33, width: 8, height: 6 },
      COMBAT.damage.kick,
    ),
    mid: move(
      'kick',
      'mid',
      BOSS_ATTACK_TIMING.kick,
      'kickChamber',
      'kickMid',
      { x: 16, y: -23, width: 8, height: 6 },
      COMBAT.damage.kick,
    ),
    low: move(
      'kick',
      'low',
      BOSS_ATTACK_TIMING.kick,
      'kickChamber',
      'kickLow',
      { x: 15, y: -9, width: 8, height: 6 },
      COMBAT.damage.kick,
    ),
  },
};
