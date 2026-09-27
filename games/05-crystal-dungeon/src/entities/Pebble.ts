import * as Phaser from 'phaser';

import { DEPTHS, PEBBLE } from '../config';
import { PEBBLE_SHEET } from '../content/sprites/enemies';
import type { Rect } from '../systems/combat';
import { FACING_VECTORS, type Facing } from '../systems/facing';

/** A pebble spat by a Pebblenose. It flies straight until it hits something solid, Wren, or her shield. */
export class Pebble extends Phaser.GameObjects.Sprite {
  readonly direction: Facing;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: Facing) {
    super(scene, x, y, PEBBLE_SHEET.key, 'pebble');
    this.direction = direction;
    scene.add.existing(this);
    this.setDepth(DEPTHS.spark);
  }

  fly(deltaMs: number): void {
    const { x, y } = FACING_VECTORS[this.direction];
    const step = (PEBBLE.speed * deltaMs) / 1000;
    this.setPosition(this.x + x * step, this.y + y * step);
  }

  hitBox(): Rect {
    return { x: this.x - PEBBLE.size / 2, y: this.y - PEBBLE.size / 2, width: PEBBLE.size, height: PEBBLE.size };
  }
}
