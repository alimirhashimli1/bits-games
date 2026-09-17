import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { ENEMY_ANIMATIONS, ENEMY_SHEET } from '../../content/sprites/enemies';
import type { EnemyForm } from '../../systems/enemyRules';
import { Enemy } from './Enemy';

/** A blob of living sludge. It walks back and forth, and one stomp flattens it. */
export class Gloop extends Enemy {
  constructor(scene: Phaser.Scene, group: Phaser.Physics.Arcade.Group, feetX: number, feetY: number) {
    super(scene, group, feetX, feetY, ENEMY_SHEET.key);
    this.setShape('gloop');
    this.play(ENEMY_ANIMATIONS.gloop.key);
  }

  override get form(): EnemyForm {
    return 'gloop';
  }

  protected move(): void {
    this.keepWalking(ENEMIES.walkSpeed);
  }

  protected override showFlattened(): void {
    this.play(ENEMY_ANIMATIONS.gloopFlat.key);
  }
}
