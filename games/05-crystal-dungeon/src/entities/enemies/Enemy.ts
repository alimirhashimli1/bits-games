import * as Phaser from 'phaser';

import { COLORS, COMBAT, DEPTHS } from '../../config';
import type { OpenCellCheck, Random } from '../../systems/ai/gridWalk';
import { knockbackVelocity, type Hittable, type Rect } from '../../systems/combat';
import type { Facing } from '../../systems/facing';
import type { Vector } from '../../systems/playerMovement';

/** What an enemy knows about the world when it decides what to do. */
export interface EnemySenses {
  readonly now: number;
  readonly deltaMs: number;
  /** The middle of Wren's frame. */
  readonly wren: Vector;
  readonly isOpen: OpenCellCheck;
  readonly random: Random;
  /** Spits a pebble from (x, y), flying `direction`. */
  spitPebble(x: number, y: number, direction: Facing): void;
}

export interface EnemyStats {
  /** In sword hits. */
  readonly health: number;
  /** Half hearts taken from Wren when she touches it. */
  readonly contactDamage: number;
}

/** Enemy frames are one tile; bodies are a little smaller, so they fit through gaps between tiles. */
const BODY_SIZE = 12;
const BODY_OFFSET = 2;
/** The hurtbox is the frame less this much on every side, so a pixel of clear air does not count as a touch. */
const HURTBOX_INSET = 2;

/**
 * What every enemy shares: health, the red flash and knockback when hit, being stunned by the
 * Moonrang, and hurting Wren by touching her. Each kind only decides what to do in `think`,
 * which is not called while it is being knocked back or is stunned.
 */
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite implements Hittable {
  declare body: Phaser.Physics.Arcade.Body;
  readonly contactDamage: number;
  private health: number;
  private hurtUntil = 0;
  private knockedBackUntil = 0;
  private knockedBack = false;
  private stunnedUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string, stats: EnemyStats) {
    super(scene, x, y, texture, frame);
    this.health = stats.health;
    this.contactDamage = stats.contactDamage;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setSize(BODY_SIZE, BODY_SIZE, false).setOffset(BODY_OFFSET, BODY_OFFSET);
    this.setDepth(DEPTHS.enemies);
  }

  get alive(): boolean {
    return this.active;
  }

  hurtBox(): Rect {
    const bounds = this.getBounds();
    return {
      x: bounds.x + HURTBOX_INSET,
      y: bounds.y + HURTBOX_INSET,
      width: bounds.width - HURTBOX_INSET * 2,
      height: bounds.height - HURTBOX_INSET * 2,
    };
  }

  canBeHit(now: number): boolean {
    return this.active && now >= this.hurtUntil;
  }

  /** Stands frozen, tinted, until `now + ms`. It can still be hit, and still hurts to touch. */
  stun(now: number, ms: number): void {
    this.stunnedUntil = now + ms;
    this.body.stop();
    this.setTint(COLORS.stunTint);
  }

  isStunned(now: number): boolean {
    return now < this.stunnedUntil;
  }

  /** Takes the damage and is knocked `direction`. Returns true if that was its last hit; the caller removes it. */
  takeHit(damage: number, direction: Facing, now: number): boolean {
    this.health -= damage;
    if (this.health <= 0) return true;
    this.hurtUntil = now + COMBAT.enemyHurtMs;
    this.knockedBackUntil = now + COMBAT.enemyKnockbackMs;
    this.knockedBack = true;
    const velocity = knockbackVelocity(direction, COMBAT.enemyKnockbackSpeed);
    this.body.setVelocity(velocity.x, velocity.y);
    this.setTint(COLORS.enemyHurtTint);
    return false;
  }

  tick(senses: EnemySenses): void {
    const stunned = this.isStunned(senses.now);
    if (senses.now >= this.hurtUntil) {
      if (stunned) this.setTint(COLORS.stunTint);
      else this.clearTint();
    }
    if (this.knockedBack) {
      if (senses.now < this.knockedBackUntil) return;
      this.knockedBack = false;
      this.body.stop();
      this.afterKnockback();
    }
    if (stunned) {
      this.body.stop();
      this.anims.pause();
      return;
    }
    if (this.anims.isPaused) this.anims.resume();
    this.think(senses);
  }

  /** Decides what to do this frame. */
  protected abstract think(senses: EnemySenses): void;

  /** Called when a knockback ends, e.g. to find its way back onto the grid. */
  protected afterKnockback(): void {}
}
