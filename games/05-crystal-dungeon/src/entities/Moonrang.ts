import * as Phaser from 'phaser';

import { DEPTHS, MOONRANG } from '../config';
import { ITEM_SHEET } from '../content/sprites/items';
import type { Rect } from '../systems/combat';
import { FACING_VECTORS, type Facing } from '../systems/facing';
import type { Vector } from '../systems/playerMovement';
import type { Pickup } from './Pickup';

const FULL_TURN_DEGREES = 360;

/**
 * The Moonrang in flight: out the way Wren faced, spinning, until it has gone its range or
 * something turns it back, then home to her. Pickups it has caught ride along with it.
 */
export class Moonrang extends Phaser.GameObjects.Image {
  readonly direction: Facing;
  private returning = false;
  private travelled = 0;
  private readonly carried: Pickup[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, direction: Facing) {
    super(scene, x, y, ITEM_SHEET.key, 'moonrang');
    this.direction = direction;
    scene.add.existing(this);
    this.setDepth(DEPTHS.items);
  }

  get isReturning(): boolean {
    return this.returning;
  }

  /** Heads back to Wren from here, e.g. after striking a wall or an enemy. */
  turnBack(): void {
    this.returning = true;
  }

  /** Takes a pickup along, home to Wren. */
  carry(pickup: Pickup): void {
    pickup.hold();
    this.carried.push(pickup);
  }

  isCarrying(pickup: Pickup): boolean {
    return this.carried.includes(pickup);
  }

  /**
   * Moves on by one frame's worth, towards `home` (the middle of Wren's frame) once returning.
   * Returns true when it has come back to her: the caller catches it, and the pickups it carried
   * are then lying on her, to be collected.
   */
  fly(deltaMs: number, home: Vector): boolean {
    const step = (MOONRANG.speed * deltaMs) / 1000;
    this.angle += (MOONRANG.spinTurnsPerSecond * FULL_TURN_DEGREES * deltaMs) / 1000;
    if (this.returning) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, home.x, home.y);
      if (distance <= Math.max(step, MOONRANG.catchDistance)) {
        this.setPosition(home.x, home.y);
        this.carried.forEach((pickup) => pickup.setPosition(home.x, home.y));
        return true;
      }
      this.setPosition(this.x + ((home.x - this.x) / distance) * step, this.y + ((home.y - this.y) / distance) * step);
    } else {
      const { x, y } = FACING_VECTORS[this.direction];
      this.setPosition(this.x + x * step, this.y + y * step);
      this.travelled += step;
      if (this.travelled >= MOONRANG.range) this.turnBack();
    }
    this.carried.forEach((pickup) => pickup.setPosition(this.x, this.y));
    return false;
  }

  hitBox(): Rect {
    return { x: this.x - MOONRANG.size / 2, y: this.y - MOONRANG.size / 2, width: MOONRANG.size, height: MOONRANG.size };
  }
}
