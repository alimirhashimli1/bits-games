import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { BLUB_ANIMATIONS, BLUB_SHEET } from '../../content/sprites/enemies';
import { between } from '../../systems/ai/gridWalk';
import { walkVelocity } from '../../systems/playerMovement';
import { Enemy, type EnemySenses } from './Enemy';

const STATS = ENEMIES.blub;
/** Wren counts as straight ahead of it on an axis when she is this close to its row or column. */
const AIM_DEAD_ZONE = 4;

/** A jelly that wobbles in place, then hops a short way towards Wren, in any of eight directions. */
export class Blub extends Enemy {
  private hoppingUntil = 0;
  private nextHopAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, BLUB_SHEET.key, 'squat', STATS);
    this.play(BLUB_ANIMATIONS.wobble.key);
  }

  protected think({ now, wren, random }: EnemySenses): void {
    if (now < this.hoppingUntil) return;
    if (this.nextHopAt === 0) this.nextHopAt = now + between(STATS.restMs, random);

    if (now < this.nextHopAt) {
      this.body.stop();
      this.play(BLUB_ANIMATIONS.wobble.key, true);
      return;
    }

    const aim = (difference: number): number => (Math.abs(difference) <= AIM_DEAD_ZONE ? 0 : Math.sign(difference));
    const velocity = walkVelocity({ x: aim(wren.x - this.x), y: aim(wren.y - this.y) }, STATS.hopSpeed);
    this.body.setVelocity(velocity.x, velocity.y);
    this.play(BLUB_ANIMATIONS.hop.key);
    this.hoppingUntil = now + STATS.hopMs;
    this.nextHopAt = this.hoppingUntil + between(STATS.restMs, random);
  }

  protected override afterKnockback(): void {
    this.hoppingUntil = 0;
  }
}
