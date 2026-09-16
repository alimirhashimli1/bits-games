import { ATTACK_TIMING } from '../../config';
import type { AttackHeight, AttackKind, AttackMove, AttackMoveSet, Hitbox } from '../../entities/fighterMoves';
import type { HeroPoseName } from './heroPoses';

function move(
  kind: AttackKind,
  height: AttackHeight,
  windupFrame: HeroPoseName,
  strikeFrame: HeroPoseName,
  hitbox: Hitbox,
): AttackMove {
  return { kind, height, windupFrame, strikeFrame, hitbox, ...ATTACK_TIMING[kind] };
}

/**
 * Kenji's punches and kicks. Each hitbox covers the fist or foot of the strike pose
 * in heroPoses.ts, measured from the feet (frame point 24,48) while facing right.
 */
export const HERO_MOVES: AttackMoveSet = {
  punch: {
    high: move('punch', 'high', 'punchWindup', 'punchHigh', { x: 12, y: -39, width: 5, height: 5 }),
    mid: move('punch', 'mid', 'punchWindup', 'punchMid', { x: 13, y: -33, width: 5, height: 5 }),
    low: move('punch', 'low', 'punchWindup', 'punchLow', { x: 11, y: -24, width: 5, height: 5 }),
  },
  kick: {
    high: move('kick', 'high', 'kickChamber', 'kickHigh', { x: 13, y: -33, width: 6, height: 5 }),
    mid: move('kick', 'mid', 'kickChamber', 'kickMid', { x: 16, y: -23, width: 6, height: 5 }),
    low: move('kick', 'low', 'kickChamber', 'kickLow', { x: 15, y: -9, width: 6, height: 5 }),
  },
};
