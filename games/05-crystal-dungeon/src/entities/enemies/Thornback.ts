import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { THORNBACK_ANIMATIONS, THORNBACK_SHEET } from '../../content/sprites/enemies';
import { chargeDirection } from '../../systems/ai/charge';
import { cellAt, chooseHeading, GridWalk, middleOf, neighbour } from '../../systems/ai/gridWalk';
import { FACING_VECTORS, type Facing } from '../../systems/facing';
import { Enemy, type EnemySenses } from './Enemy';

const STATS = ENEMIES.thornback;

/**
 * - walking: plods from tile to tile, watching for Wren.
 * - charging: she came in line with it, so it runs straight at her until something stops it.
 * - dazed: it ran into something, and stands still a moment.
 */
type ThornbackMode = 'walking' | 'charging' | 'dazed';

/** An armoured boar that plods about, and charges the moment Wren lines up with it. */
export class Thornback extends Enemy {
  private heading: Facing;
  private mode: ThornbackMode = 'walking';
  private readonly walk = new GridWalk();
  private dazedUntil = 0;
  private canChargeFrom = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, heading: Facing = 'down') {
    super(scene, x, y, THORNBACK_SHEET.key, `walk1-${heading}`, STATS);
    this.heading = heading;
  }

  protected think({ now, deltaMs, wren, isOpen, random }: EnemySenses): void {
    if (this.mode === 'dazed') {
      this.body.stop();
      if (now < this.dazedUntil) return;
      this.mode = 'walking';
      this.walk.goTo(middleOf(cellAt(this)));
    }

    if (this.mode === 'charging') {
      const { up, down, left, right } = this.body.blocked;
      if (up || down || left || right) this.getDazed(now);
      return;
    }

    const charge = now >= this.canChargeFrom ? chargeDirection(this, wren, STATS.lineTolerance) : null;
    if (charge) {
      this.mode = 'charging';
      this.heading = charge;
      const { x, y } = FACING_VECTORS[charge];
      this.body.setVelocity(x * STATS.chargeSpeed, y * STATS.chargeSpeed);
      this.play(THORNBACK_ANIMATIONS.charge[charge].key);
      return;
    }

    if (this.walk.arrived(this)) {
      const cell = cellAt(this);
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
    this.play(THORNBACK_ANIMATIONS.walk[this.heading].key, true);
  }

  private getDazed(now: number): void {
    this.mode = 'dazed';
    this.dazedUntil = now + STATS.dazedMs;
    this.canChargeFrom = now + STATS.chargeCooldownMs;
    this.body.stop();
    this.anims.pause();
  }

  /** A hit ends a charge, and it walks back onto the grid before it can charge again. */
  protected override afterKnockback(): void {
    this.mode = 'walking';
    this.walk.goTo(middleOf(cellAt(this)));
  }
}
