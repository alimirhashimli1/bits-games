import * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { ENEMY_ANIMATIONS, ENEMY_SHEET } from '../../content/sprites/enemies';
import type { EnemyForm } from '../../systems/enemyRules';
import { Enemy } from './Enemy';

const FULL_TURN = Math.PI * 2;

/** The chain link frame, by name in the enemy sheet. */
const CHAIN_LINK_FRAME = 'chainLink';

/**
 * A flame swinging round the end of a chain in the boiler works. It cannot be stomped or beaten,
 * and only the Golden Gasket keeps Rusty safe from it.
 */
export class Spark extends Enemy {
  private readonly links: Phaser.GameObjects.Image[];
  private swing = 0;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    private readonly anchorX: number,
    private readonly anchorY: number,
  ) {
    super(scene, group, anchorX, anchorY, ENEMY_SHEET.key);
    this.setOrigin(0.5, 0.5);
    this.setShape('spark');
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.play(ENEMY_ANIMATIONS.spark.key);

    this.links = Array.from({ length: ENEMIES.sparkChainLinks }, () =>
      scene.add.image(anchorX, anchorY, ENEMY_SHEET.key, CHAIN_LINK_FRAME),
    );
    this.once(Phaser.GameObjects.Events.DESTROY, () => this.links.forEach((link) => link.destroy()));
    this.hang();
  }

  override get form(): EnemyForm {
    return 'spark';
  }

  /** It swings through the air on its chain, past anything in the way. */
  override get walksOnTiles(): boolean {
    return false;
  }

  protected move(_rustyX: number, deltaMs: number): void {
    this.swing += (FULL_TURN * deltaMs) / ENEMIES.sparkTurnMs;
    this.hang();
  }

  /** Puts the flame and its chain where the swing has reached. */
  private hang(): void {
    const along = (distance: number) => ({
      x: this.anchorX + Math.cos(this.swing) * distance,
      y: this.anchorY + Math.sin(this.swing) * distance,
    });

    const flame = along(ENEMIES.sparkRadius);
    // Moved by hand, so the sprite and body are put there together. Moving the sprite and then
    // syncing the body left the body's last position behind, and on a frame with a different
    // number of physics steps (as after the level restarts on the way back up a pipe) Arcade
    // added the difference to the sprite, which then jumped 37 pixels each way every frame.
    this.body.reset(flame.x, flame.y);
    this.links.forEach((link, index) => {
      const { x, y } = along((ENEMIES.sparkRadius * (index + 1)) / (this.links.length + 1));
      link.setPosition(x, y);
    });
  }
}
