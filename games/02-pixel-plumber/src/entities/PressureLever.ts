import type * as Phaser from 'phaser';

import { LEVEL } from '../config';
import { LEVER_SHEET } from '../content/sprites/boss';
import type { Cell } from '../systems/levelLoader';

const PULLED_FRAME = 'pulled';

/**
 * The pressure-release lever at the back of the Sludge Baron's hall. Reaching it ends the last
 * level, as the pole ends the others: pulling it lets the pressure out and drops the grates.
 */
export class PressureLever {
  private readonly image: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, cell: Cell) {
    this.image = scene.add
      .image((cell.column + 0.5) * LEVEL.tileSize, (cell.row + 1) * LEVEL.tileSize, LEVER_SHEET.key, 'up')
      .setOrigin(0.5, 1);
  }

  /** True once Rusty is touching any part of it. */
  touchedBy(body: Phaser.Physics.Arcade.Body): boolean {
    const { left, right, top, bottom } = this.image.getBounds();
    return body.right > left && body.left < right && body.bottom > top && body.top < bottom;
  }

  pull(): void {
    this.image.setFrame(PULLED_FRAME);
  }
}
