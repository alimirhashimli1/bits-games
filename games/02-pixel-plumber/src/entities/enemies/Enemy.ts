import * as Phaser from 'phaser';

import { ENEMIES, ENEMY_BODIES } from '../../config';
import type { EnemyForm, EnemyState } from '../../systems/enemyRules';

export type EnemyShape = keyof typeof ENEMY_BODIES;

/**
 * An enemy in the level: a physics sprite whose origin is at its feet. It stands still until the
 * screen nearly reaches it, as on the original console, so a Gloop does not walk off a ledge
 * long before Rusty can see it. Once it is beaten it touches nothing and falls out of the level.
 */
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  /** Which way it walks. Enemies set off to the left, towards Rusty. */
  protected direction: 1 | -1 = -1;
  private asleep = true;
  private defeated = false;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, feetX: number, feetY: number, texture: string) {
    super(scene, feetX, feetY, texture);
    scene.add.existing(this);
    // Joining the group gives it a body and the group's defaults, so its own body is set up after.
    group.add(this);
    this.setOrigin(0.5, 1);
    this.body.setEnable(false);
  }

  abstract get form(): EnemyForm;

  /** Only a Shellbug has more than one state. (Phaser already uses `state` on a sprite.) */
  get stance(): EnemyState {
    return 'walking';
  }

  /** Sprouts stay inside their pipes and Sparks swing through the air: neither walks on tiles. */
  get walksOnTiles(): boolean {
    return true;
  }

  get isDefeated(): boolean {
    return this.defeated;
  }

  /** False until the screen has reached it: until then it is not in play at all. */
  get isAwake(): boolean {
    return !this.asleep;
  }

  /** False while asleep or beaten, and just after a shell is kicked. */
  get touchesRusty(): boolean {
    return !this.asleep && !this.defeated;
  }

  /** Wakes it when the screen reaches it, then keeps it moving. */
  advance(screenRight: number, rustyX: number, deltaMs: number): void {
    if (this.defeated) return;
    if (this.asleep) {
      if (this.x > screenRight + ENEMIES.wakeMargin) return;
      this.asleep = false;
      this.body.setEnable(true);
      this.wake();
    }
    this.move(rustyX, deltaMs);
  }

  /** Beaten by a steam puff, a sliding shell or the Golden Gasket: it flips over and falls away. */
  knockOver(): void {
    this.stopBeingAnEnemy();
    this.setFlipY(true);
    this.body.setVelocity(0, -ENEMIES.knockOverSpeed);
  }

  /** Stomped into the ground: it lies flat for a moment and is then gone. */
  flatten(): void {
    this.stopBeingAnEnemy();
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.showFlattened();
    this.scene.time.delayedCall(ENEMIES.flatMs, () => this.destroy());
  }

  /** Called once, when the screen first reaches it. */
  protected wake(): void {}

  /** Called every frame while it is awake. */
  protected abstract move(rustyX: number, deltaMs: number): void;

  /** The flattened look. Only a Gloop is ever stomped flat. */
  protected showFlattened(): void {}

  /** Arcade stops a body dead against a wall, so a walking enemy turns round using its own speed. */
  protected keepWalking(speed: number): void {
    const { blocked, velocity } = this.body;
    if (blocked.left) this.direction = 1;
    else if (blocked.right) this.direction = -1;
    velocity.x = this.direction * speed;
    this.setFlipX(this.direction < 0);
  }

  protected setShape(shape: EnemyShape): void {
    const { width, height, offsetX, offsetY } = ENEMY_BODIES[shape];
    this.body.setSize(width, height, false);
    this.body.setOffset(offsetX, offsetY);
  }

  private stopBeingAnEnemy(): void {
    this.defeated = true;
    // Nothing collides or overlaps with it any more, so it falls straight through the level.
    this.body.checkCollision.none = true;
  }
}
