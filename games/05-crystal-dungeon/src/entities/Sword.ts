import * as Phaser from 'phaser';

import { DEPTHS, SWORD } from '../config';
import { SWORD_SHEET } from '../content/sprites/sword';
import { rectAround, type Rect } from '../systems/combat';
import type { Facing } from '../systems/facing';

/**
 * Wren's sword: a sprite held out beside her during the thrust of a swing, and hidden the rest of
 * the time. It has no physics body; what it hits is decided by its reach, a plain rectangle.
 */
export class Sword extends Phaser.GameObjects.Sprite {
  private facing: Facing | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, SWORD_SHEET.key, 'up');
    scene.add.existing(this);
    this.setVisible(false);
  }

  /** Holds it out the way she faces, from her frame's middle at (x, y). */
  holdOut(facing: Facing, x: number, y: number): void {
    this.facing = facing;
    this.setFrame(facing).setVisible(true);
    this.setDepth(facing === 'up' ? DEPTHS.swordBehind : DEPTHS.swordInFront);
    this.follow(x, y);
  }

  putAway(): void {
    this.facing = null;
    this.setVisible(false);
  }

  /** Keeps it in her hands as she moves. */
  follow(x: number, y: number): void {
    if (!this.facing) return;
    const offset = SWORD.spriteOffset[this.facing];
    this.setPosition(x + offset.x, y + offset.y);
  }

  /** What it can hit, from her frame's middle at (x, y), or null while it is put away. */
  reach(x: number, y: number): Rect | null {
    return this.facing ? rectAround(x, y, SWORD.reach[this.facing]) : null;
  }
}
