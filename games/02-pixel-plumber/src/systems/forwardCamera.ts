import type * as Phaser from 'phaser';

import { LEVEL } from '../config';

/**
 * A camera that follows Rusty to the right and never scrolls back, as in the original.
 * The level is fixed vertically: the camera's bounds already pin it to the bottom of the map.
 */
export class ForwardCamera {
  private readonly maxScrollX: number;

  constructor(
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    levelWidth: number,
  ) {
    this.maxScrollX = Math.max(0, levelWidth - camera.width);
  }

  /** The level x at the left edge of the screen. Nothing left of it can be seen or reached. */
  get leftEdge(): number {
    return this.camera.scrollX;
  }

  /**
   * Scrolls right if Rusty has moved past the lead point. The scroll is not rounded here:
   * the game renders with `roundPixels`, which rounds every object's screen position, and
   * keeping Rusty's distance from the scroll exact is what stops him wobbling by a pixel.
   */
  follow(targetX: number): void {
    const wanted = Math.min(targetX - LEVEL.cameraLeadX, this.maxScrollX);
    if (wanted > this.camera.scrollX) this.camera.scrollX = wanted;
  }
}
