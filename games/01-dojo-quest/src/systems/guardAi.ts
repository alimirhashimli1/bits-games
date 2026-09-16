import { GUARD_AI } from '../config';
import type { Fighter, FighterIntent } from '../entities/Fighter';
import type { AttackHeight, AttackKind, BlockHeight } from '../entities/fighterMoves';

/** How a guard fights. Each rank in config.ts has its own values. */
export interface GuardTactics {
  /** Time to notice an incoming attack before the guard goes up. */
  readonly reactionMs: number;
  /** Chance (0-1) of trying to block each attack. */
  readonly blockChance: number;
  /** Chance (0-1) of attacking whenever an attack is ready and the hero is in reach. */
  readonly aggression: number;
  /** Random wait between attack decisions, in milliseconds. */
  readonly attackCooldownMs: readonly [min: number, max: number];
  /** Chance (0-1) of backing off after being hit, and for how long. */
  readonly retreatChance: number;
  readonly retreatMs: number;
  /** Distance the guard tries to keep from the hero, in pixels. */
  readonly preferredDistance: number;
}

const ATTACK_HEIGHTS: readonly AttackHeight[] = ['high', 'mid', 'low'];

const IDLE: FighterIntent = { move: 0, toggleStance: false, attack: null, block: null };

interface BlockPlan {
  readonly attackId: number;
  readonly willBlock: boolean;
  readonly raiseAtMs: number;
}

/**
 * Decides what a guard does each frame, in priority order:
 * defend against an incoming attack, back off after being hit, attack when ready
 * and in reach, otherwise move to the preferred distance.
 */
export class GuardBrain {
  /** The boss swaps these when he is hurt, so they are not fixed for life. */
  protected tactics: GuardTactics;
  private readonly random: () => number;
  private elapsedMs = 0;
  private nextAttackDecisionAtMs: number;
  private retreatUntilMs = 0;
  private lastSeenHealth: number;
  private blockPlan: BlockPlan | null = null;

  constructor(tactics: GuardTactics, guard: Fighter, random: () => number = Math.random) {
    this.tactics = tactics;
    this.random = random;
    this.lastSeenHealth = guard.health.current;
    this.nextAttackDecisionAtMs = this.randomCooldown();
  }

  think(guard: Fighter, hero: Fighter, deltaMs: number): FighterIntent {
    this.elapsedMs += deltaMs;
    if (guard.isKnockedOut || hero.isKnockedOut) return IDLE;

    this.noticeDamage(guard);
    const distance = Math.abs(hero.x - guard.x);
    const towardsHero = Math.sign(hero.x - guard.x) || guard.facing;

    const block = this.chooseBlock(hero, distance);
    if (block) return { ...IDLE, block };

    if (this.elapsedMs < this.retreatUntilMs) return { ...IDLE, move: -towardsHero };

    const attack = this.chooseAttack(distance);
    if (attack) return { ...IDLE, attack };

    return { ...IDLE, move: this.stepToPreferredDistance(distance) * towardsHero };
  }

  /** Decides once per hero attack whether to block it, then raises the guard after the reaction time. */
  private chooseBlock(hero: Fighter, distance: number): BlockHeight | null {
    const attack = hero.currentAttack;
    if (!attack || attack.phase === 'recovery' || distance > GUARD_AI.threatDistance) return null;

    if (this.blockPlan?.attackId !== attack.id) {
      this.blockPlan = {
        attackId: attack.id,
        willBlock: this.random() < this.tactics.blockChance,
        raiseAtMs: this.elapsedMs + this.tactics.reactionMs,
      };
    }
    if (!this.blockPlan.willBlock || this.elapsedMs < this.blockPlan.raiseAtMs) return null;

    return attack.move.height === 'low' ? 'low' : 'high';
  }

  /** Punches when close, kicks when a little further away. Hesitating still uses up the cooldown. */
  private chooseAttack(distance: number): FighterIntent['attack'] {
    if (this.elapsedMs < this.nextAttackDecisionAtMs) return null;

    const kind: AttackKind | null =
      distance <= GUARD_AI.punchReach ? 'punch' : distance <= GUARD_AI.kickReach ? 'kick' : null;
    if (!kind) return null;

    this.nextAttackDecisionAtMs = this.elapsedMs + this.randomCooldown();
    if (this.random() >= this.tactics.aggression) return null;

    const height = ATTACK_HEIGHTS[Math.floor(this.random() * ATTACK_HEIGHTS.length)] ?? 'mid';
    return { kind, height };
  }

  /** Starts a retreat (sometimes) when the guard has just lost health. */
  private noticeDamage(guard: Fighter): void {
    const health = guard.health.current;
    if (health < this.lastSeenHealth && this.random() < this.tactics.retreatChance) {
      this.retreatUntilMs = this.elapsedMs + this.tactics.retreatMs;
    }
    this.lastSeenHealth = health;
  }

  /** 1 = step closer, -1 = step back, 0 = the distance is fine. */
  private stepToPreferredDistance(distance: number): number {
    if (distance > this.tactics.preferredDistance + GUARD_AI.distanceTolerance) return 1;
    if (distance < this.tactics.preferredDistance - GUARD_AI.distanceTolerance) return -1;
    return 0;
  }

  private randomCooldown(): number {
    const [min, max] = this.tactics.attackCooldownMs;
    return min + this.random() * (max - min);
  }
}
