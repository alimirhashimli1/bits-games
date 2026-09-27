import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { FLITTER_ANIMATIONS, FLITTER_SHEET } from '../../content/sprites/enemies';
import { between } from '../../systems/ai/gridWalk';
import { Enemy, type EnemySenses } from './Enemy';

const STATS = ENEMIES.flitter;
const FULL_TURN = Math.PI * 2;

/**
 * A bat. It flies in wandering loops, its heading swinging one way and then the other, over walls
 * and water alike, bouncing off the edges of the room; then it settles for a rest.
 */
export class Flitter extends Enemy {
  private flying = false;
  private phaseEndsAt = 0;
  private heading = 0;
  private turning: -1 | 1 = 1;
  private switchTurnAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, FLITTER_SHEET.key, 'rest', STATS);
    // It flies over everything: tiles never stop it, only the edges of the room.
    Object.assign(this.body.checkCollision, { none: true, up: false, down: false, left: false, right: false });
    this.play(FLITTER_ANIMATIONS.rest.key);
  }

  protected think({ now, deltaMs, random }: EnemySenses): void {
    if (now >= this.phaseEndsAt) this.switchPhase(now, random);
    if (!this.flying) {
      this.body.stop();
      return;
    }

    if (now >= this.switchTurnAt) {
      this.turning = random() < 0.5 ? -1 : 1;
      this.switchTurnAt = now + between(STATS.turnSwitchMs, random);
    }
    const { up, down, left, right } = this.body.blocked;
    if (left || right) this.heading = Math.PI - this.heading;
    if (up || down) this.heading = -this.heading;
    this.heading += (this.turning * STATS.turnRate * deltaMs) / 1000;
    this.body.setVelocity(Math.cos(this.heading) * STATS.speed, Math.sin(this.heading) * STATS.speed);
  }

  /** From resting to flying, or back. It starts each flight in a new direction. */
  private switchPhase(now: number, random: () => number): void {
    // The first call decides whether it starts in the air or resting.
    this.flying = this.phaseEndsAt === 0 ? random() < 0.5 : !this.flying;
    this.phaseEndsAt = now + between(this.flying ? STATS.flyMs : STATS.restMs, random);
    if (this.flying) {
      this.heading = random() * FULL_TURN;
      this.play(FLITTER_ANIMATIONS.fly.key);
    } else {
      this.play(FLITTER_ANIMATIONS.rest.key);
    }
  }
}
