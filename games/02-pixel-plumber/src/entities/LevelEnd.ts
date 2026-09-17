import type * as Phaser from 'phaser';

import { LEVEL, LEVEL_END } from '../config';
import { VALVE_WHEEL_ANIMATIONS, VALVE_WHEEL_SHEET } from '../content/sprites/levelEnd';
import type { Cell } from '../systems/levelLoader';

const MS_PER_SECOND = 1000;

/**
 * The valve wheel on the pole that ends a level. Catching it anywhere along the pole opens the
 * main: the wheel winds down to the foot of the pole, and the higher it was caught the better.
 */
export class LevelEnd {
  private readonly wheel: Phaser.GameObjects.Sprite;
  /** The middle of the pole, and the wheel's highest and lowest points on it. */
  readonly x: number;
  readonly topY: number;
  readonly bottomY: number;

  constructor(
    private readonly scene: Phaser.Scene,
    cell: Cell,
    groundY: number,
  ) {
    this.x = (cell.column + 0.5) * LEVEL.tileSize;
    this.topY = (cell.row + 0.5) * LEVEL.tileSize;
    this.bottomY = groundY;
    this.wheel = scene.add.sprite(this.x, this.topY, VALVE_WHEEL_SHEET.key).play(VALVE_WHEEL_ANIMATIONS.turn.key);
  }

  /** True once Rusty has reached the pole. */
  caughtBy(body: Phaser.Physics.Arcade.Body): boolean {
    const half = LEVEL_END.grabWidth / 2;
    return (
      body.right > this.x - half && body.left < this.x + half && body.bottom > this.topY && body.top < this.bottomY
    );
  }

  /** How high up the pole his feet were, 0 at the foot of it and 1 at the very top. */
  heightCaught(feetY: number): number {
    const fromBottom = (this.bottomY - feetY) / (this.bottomY - this.topY);
    return Math.min(Math.max(fromBottom, 0), 1);
  }

  /** Winds the wheel down to the foot of the pole, and says how long that takes. */
  windDown(): number {
    const duration = ((this.bottomY - this.wheel.y) / LEVEL_END.slideSpeed) * MS_PER_SECOND;
    this.scene.tweens.add({ targets: this.wheel, y: this.bottomY, duration });
    return duration;
  }
}
