import * as Phaser from 'phaser';

import { DEPTHS, SPARK } from '../config';
import { SPARK_ANIMATIONS, SPARK_SHEET } from '../content/sprites/combat';
import type { Rect } from '../systems/combat';
import { FACING_VECTORS, type Facing } from '../systems/facing';

/** The spark thrown by a swing at full health: flies straight on, over walls and water, until it hits something or leaves the room. */
export class Spark extends Phaser.GameObjects.Sprite {
  readonly direction: Facing;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: Facing) {
    super(scene, x, y, SPARK_SHEET.key);
    this.direction = direction;
    scene.add.existing(this);
    this.setDepth(DEPTHS.spark).play(SPARK_ANIMATIONS.fly.key);
  }

  /** Moves it on by one frame's worth. */
  fly(deltaMs: number): void {
    const { x, y } = FACING_VECTORS[this.direction];
    const step = (SPARK.speed * deltaMs) / 1000;
    this.setPosition(this.x + x * step, this.y + y * step);
  }

  hitBox(): Rect {
    return { x: this.x - SPARK.size / 2, y: this.y - SPARK.size / 2, width: SPARK.size, height: SPARK.size };
  }

  isOutside(width: number, height: number): boolean {
    return this.x < 0 || this.y < 0 || this.x > width || this.y > height;
  }
}
