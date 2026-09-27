import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { PEBBLENOSE_ANIMATIONS, PEBBLENOSE_SHEET } from '../../content/sprites/enemies';
import { cellAt, chooseHeading, GridWalk, middleOf, neighbour } from '../../systems/ai/gridWalk';
import { FACING_VECTORS, type Facing } from '../../systems/facing';
import { Enemy, type EnemySenses } from './Enemy';

const STATS = ENEMIES.pebblenose;
/** The pebble leaves the tip of its snout, this far from its middle. */
const SNOUT_REACH = 8;

/**
 * Walks from tile to tile in straight lines, turning now and then. Sometimes it stops at a tile,
 * and halfway through the stop spits a pebble the way it faces.
 */
export class Pebblenose extends Enemy {
  private heading: Facing;
  private readonly walk = new GridWalk();
  private pausedUntil = 0;
  private spitAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, heading: Facing = 'down') {
    super(scene, x, y, PEBBLENOSE_SHEET.key, `walk1-${heading}`, STATS);
    this.heading = heading;
  }

  protected think(senses: EnemySenses): void {
    const { now, deltaMs, isOpen, random } = senses;
    if (now < this.pausedUntil) {
      this.body.stop();
      this.anims.pause();
      if (this.spitAt !== 0 && now >= this.spitAt) {
        this.spitAt = 0;
        const { x, y } = FACING_VECTORS[this.heading];
        senses.spitPebble(this.x + x * SNOUT_REACH, this.y + y * SNOUT_REACH, this.heading);
      }
      return;
    }

    if (this.walk.arrived(this)) {
      const cell = cellAt(this);
      if (random() < STATS.spitChance) {
        this.pausedUntil = now + STATS.spitPauseMs;
        this.spitAt = now + STATS.spitPauseMs / 2;
        return;
      }
      const heading = chooseHeading(this.heading, cell, isOpen, STATS.turnChance, random);
      if (!heading) {
        this.body.stop();
        return;
      }
      this.heading = heading;
      this.walk.goTo(middleOf(neighbour(cell, heading)));
    }

    const { velocity, snapTo } = this.walk.step(this, STATS.walkSpeed, deltaMs);
    if (snapTo) this.body.reset(snapTo.x, snapTo.y);
    else this.body.setVelocity(velocity.x, velocity.y);
    this.play(PEBBLENOSE_ANIMATIONS[this.heading].key, true);
  }

  /** Knocked off the grid: walk back to the middle of the tile it landed in first. */
  protected override afterKnockback(): void {
    this.walk.goTo(middleOf(cellAt(this)));
    this.pausedUntil = 0;
    this.spitAt = 0;
  }
}
