import * as Phaser from 'phaser';

import { COMBAT } from '../config';
import type { Fighter } from '../entities/Fighter';
import type { AttackHeight, BlockHeight } from '../entities/fighterMoves';

export type AttackOutcome = 'hit' | 'blocked' | 'knockout';

/** Which attack heights each guard stops. */
const BLOCK_COVERAGE: Readonly<Record<BlockHeight, readonly AttackHeight[]>> = COMBAT.blockCoverage;

/**
 * Checks whether the attacker's active attack touches the defender this frame, and if so
 * applies the result. Each attack lands at most once. Returns null when nothing landed.
 */
export function resolveAttack(attacker: Fighter, defender: Fighter): AttackOutcome | null {
  const attack = attacker.currentAttack;
  const hitbox = attacker.activeHitbox();
  const hurtbox = defender.hurtbox();
  if (!attack || !hitbox || !hurtbox) return null;
  if (!Phaser.Geom.Intersects.RectangleToRectangle(hitbox, hurtbox)) return null;

  attacker.markAttackLanded();
  const pushDirection = Math.sign(defender.x - attacker.x) || attacker.facing;

  if (isBlocked(defender, attacker, attack.move.height)) {
    defender.absorbBlockedHit(pushDirection * COMBAT.blockPushSpeed);
    return 'blocked';
  }

  // Classic Karateka rule: a fighter caught in running stance goes down in one blow.
  const damage = defender.stance === 'running' ? defender.health.current : COMBAT.damage[attack.move.kind];
  defender.takeHit({ damage, knockbackSpeed: pushDirection * COMBAT.knockbackSpeed, stunMs: COMBAT.stunMs });
  return defender.isKnockedOut ? 'knockout' : 'hit';
}

/** A block works only while facing the attacker with a guard that covers the attack's height. */
function isBlocked(defender: Fighter, attacker: Fighter, height: AttackHeight): boolean {
  const guard = defender.blockHeight;
  const directionToAttacker = Math.sign(attacker.x - defender.x) || defender.facing;
  return guard !== null && defender.facing === directionToAttacker && BLOCK_COVERAGE[guard].includes(height);
}

/** Stops two standing fighters from walking through each other by pushing both apart equally. */
export function keepApart(first: Fighter, second: Fighter, minDistance: number): void {
  if (first.isKnockedOut || second.isKnockedOut) return;

  const distance = second.x - first.x;
  const overlap = minDistance - Math.abs(distance);
  if (overlap <= 0) return;

  const direction = Math.sign(distance) || 1;
  first.pushBy((-direction * overlap) / 2);
  second.pushBy((direction * overlap) / 2);
}
