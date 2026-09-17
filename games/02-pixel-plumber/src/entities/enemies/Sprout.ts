import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { SPROUT_ANIMATIONS, SPROUT_SHEET } from '../../content/sprites/enemies';
import type { EnemyForm } from '../../systems/enemyRules';
import { Enemy } from './Enemy';

/** Drawn behind the tiles, so the plant is out of sight inside its pipe. */
const BEHIND_TILES_DEPTH = -1;

/**
 * A snapping plant that rises out of a pipe and sinks back into it. It stays down while Rusty
 * is standing right next to the pipe, so he is never trapped, and it cannot be stomped.
 */
export class Sprout extends Enemy {
  private readonly outY: number;
  private readonly hiddenY: number;
  private out = false;
  /** Game time (`scene.time.now`) at which it next rises or sinks. */
  private changeAt = 0;

  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, pipeMiddleX: number, pipeTopY: number) {
    super(scene, group, pipeMiddleX, pipeTopY, SPROUT_SHEET.key);
    this.outY = pipeTopY;
    this.hiddenY = pipeTopY + this.height;
    this.setDepth(BEHIND_TILES_DEPTH);
    this.setShape('sprout');
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.reset(this.x, this.hiddenY);
    this.play(SPROUT_ANIMATIONS.snap.key);
  }

  override get form(): EnemyForm {
    return 'sprout';
  }

  /** It moves through the pipe it lives in. */
  override get walksOnTiles(): boolean {
    return false;
  }

  protected override wake(): void {
    this.changeAt = this.scene.time.now + ENEMIES.sproutDownMs;
  }

  protected move(rustyX: number): void {
    const now = this.scene.time.now;
    if (now >= this.changeAt) {
      if (this.out) {
        this.out = false;
        this.changeAt = now + ENEMIES.sproutDownMs;
      } else if (Math.abs(rustyX - this.x) > ENEMIES.sproutSafeX) {
        this.out = true;
        this.changeAt = now + ENEMIES.sproutOutMs;
      }
    }

    const distance = (this.out ? this.outY : this.hiddenY) - this.y;
    this.body.setVelocityY(Math.abs(distance) < 1 ? 0 : Math.sign(distance) * ENEMIES.sproutRiseSpeed);
  }
}
