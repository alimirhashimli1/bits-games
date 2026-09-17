import type * as Phaser from 'phaser';

import { ENEMIES } from '../../config';
import { ENEMY_ANIMATIONS, ENEMY_SHEET } from '../../content/sprites/enemies';
import type { EnemyForm, EnemyState } from '../../systems/enemyRules';
import { Enemy } from './Enemy';

/**
 * A beetle in a copper shell, and the Flutterbug, which is the same beetle with wings. A stomp
 * takes a Flutterbug's wings off; a stomp on the beetle itself knocks it into its shell. The
 * shell can then be kicked, and slides until it hits a wall. Left alone, the beetle comes back out.
 */
export class Shellbug extends Enemy {
  private winged: boolean;
  private shellState: EnemyState = 'walking';
  /** Game times (`scene.time.now`): when the beetle comes back out, and until when the shell passes through Rusty. */
  private comeOutAt = 0;
  private harmlessUntil = 0;
  private nextHopAt = 0;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    feetX: number,
    feetY: number,
    winged: boolean,
  ) {
    super(scene, group, feetX, feetY, ENEMY_SHEET.key);
    this.winged = winged;
    this.setShape('shellbug');
    this.play(winged ? ENEMY_ANIMATIONS.flutterbug.key : ENEMY_ANIMATIONS.shellbug.key);
  }

  override get form(): EnemyForm {
    return this.winged ? 'flutterbug' : 'shellbug';
  }

  override get stance(): EnemyState {
    return this.shellState;
  }

  override get touchesRusty(): boolean {
    return super.touchesRusty && this.scene.time.now >= this.harmlessUntil;
  }

  /** Stomped: the beetle pulls in and the shell stays where it is. */
  enterShell(): void {
    this.shellState = 'shell';
    this.winged = false;
    this.setShape('shell');
    this.play(ENEMY_ANIMATIONS.shell.key);
    this.body.setVelocityX(0);
    this.comeOutAt = this.scene.time.now + ENEMIES.shellWakeMs;
    this.harmlessUntil = this.scene.time.now + ENEMIES.kickGraceMs;
  }

  /** Stomped while flying: the wings come off and it carries on as a Shellbug. */
  loseWings(): void {
    this.winged = false;
    this.play(ENEMY_ANIMATIONS.shellbug.key);
  }

  /** Kicked away from Rusty. It slides until something stops it. */
  kick(direction: 1 | -1): void {
    this.shellState = 'sliding';
    this.direction = direction;
    this.play(ENEMY_ANIMATIONS.shellSliding.key);
    this.body.setVelocityX(direction * ENEMIES.shellSpeed);
    this.harmlessUntil = this.scene.time.now + ENEMIES.kickGraceMs;
  }

  /** Stomped while sliding: it stops dead, and can be kicked again. */
  stopSliding(): void {
    this.enterShell();
  }

  protected move(): void {
    const now = this.scene.time.now;
    if (this.shellState === 'shell') {
      if (now >= this.comeOutAt) this.comeOut();
      return;
    }
    this.keepWalking(this.shellState === 'sliding' ? ENEMIES.shellSpeed : ENEMIES.walkSpeed);
    if (this.winged && this.body.blocked.down && now >= this.nextHopAt) {
      this.body.setVelocityY(-ENEMIES.hopSpeed);
      this.nextHopAt = now + ENEMIES.hopMs;
    }
  }

  private comeOut(): void {
    this.shellState = 'walking';
    this.setShape('shellbug');
    this.play(ENEMY_ANIMATIONS.shellbug.key);
  }
}
