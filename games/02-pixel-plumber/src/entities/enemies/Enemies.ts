import * as Phaser from 'phaser';

import { ENEMIES, LEVEL } from '../../config';
import { resolveTouch, survivesHit, type EnemyForm } from '../../systems/enemyRules';
import type { EnemySpawn, LoadedLevel } from '../../systems/levelLoader';
import type { Rusty } from '../Rusty';
import type { SteamPuffs } from '../SteamPuffs';
import { Enemy } from './Enemy';
import { Gloop } from './Gloop';
import { Shellbug } from './Shellbug';
import { Spark } from './Spark';
import { Sprout } from './Sprout';

export interface EnemiesOptions {
  readonly level: LoadedLevel;
  readonly rusty: Rusty;
  /** An enemy caught Rusty: the scene takes a power state off him, or a life. */
  readonly onHurtRusty: () => void;
  /** An enemy was beaten or a shell kicked, at the top middle of where it was: the scene scores it. */
  readonly onBeaten: (x: number, topY: number, how: BeatKind) => void;
}

/** Beating an enemy counts towards a run of them; kicking a shell is worth the same every time. */
export type BeatKind = 'beaten' | 'kicked';

/** Do two physics bodies share any space? */
function bodiesOverlap(one: Phaser.Physics.Arcade.Body, other: Phaser.Physics.Arcade.Body): boolean {
  return one.right > other.x && one.x < other.right && one.bottom > other.y && one.y < other.bottom;
}

/** Puts one enemy where its marker says, with its feet on the bottom of the cell. */
function createEnemy(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.Group,
  { column, row, form }: EnemySpawn,
): Enemy {
  const middleX = (column + 0.5) * LEVEL.tileSize;
  const bottomY = (row + 1) * LEVEL.tileSize;
  switch (form) {
    case 'gloop':
      return new Gloop(scene, group, middleX, bottomY);
    case 'shellbug':
      return new Shellbug(scene, group, middleX, bottomY, false);
    case 'flutterbug':
      return new Shellbug(scene, group, middleX, bottomY, true);
    // The marker goes above the left half of a pipe, and the plant sits in the middle of it.
    case 'sprout':
      return new Sprout(scene, group, middleX + LEVEL.tileSize / 2, bottomY);
    // The chain is anchored in the middle of the marked cell.
    case 'spark':
      return new Spark(scene, group, middleX, bottomY - LEVEL.tileSize / 2);
  }
}

/** Every enemy in the level: what they do, what beats them, and what they do to Rusty. */
export class Enemies {
  private readonly group: Phaser.Physics.Arcade.Group;
  private readonly level: LoadedLevel;
  private readonly rusty: Rusty;
  private readonly onHurtRusty: () => void;
  private readonly onBeaten: (x: number, topY: number, how: BeatKind) => void;
  /** The game time of Rusty's last bounce off an enemy, so a pile of them is stomped in one go. */
  private bouncedAt = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly scene: Phaser.Scene,
    { level, rusty, onHurtRusty, onBeaten }: EnemiesOptions,
  ) {
    this.level = level;
    this.rusty = rusty;
    this.onHurtRusty = onHurtRusty;
    this.onBeaten = onBeaten;

    this.group = scene.physics.add.group();
    scene.physics.add.collider(
      this.group,
      level.layer,
      undefined,
      (enemy) => enemy instanceof Enemy && enemy.walksOnTiles,
    );
    for (const spawn of level.enemies) createEnemy(scene, this.group, spawn);

    scene.physics.add.overlap(rusty, this.group, (_rusty, enemy) => {
      if (enemy instanceof Enemy) this.touch(enemy);
    });
  }

  /** Development key: puts one more enemy in the level, in the cell given. */
  drop(form: EnemyForm, column: number, row: number): void {
    createEnemy(this.scene, this.group, { column, row, form });
  }

  /** Steam puffs beat the enemies they hit, and burst against them. */
  defeatWithPuffs(puffs: SteamPuffs): void {
    puffs.burstAgainst(this.group, (target) => {
      if (target instanceof Enemy && !survivesHit(target.form)) this.beat(target, () => target.knockOver());
    });
  }

  /** Call once per frame after physics: wakes enemies, moves them, and clears away the fallen. */
  update(camera: Phaser.Cameras.Scene2D.Camera, deltaMs: number): void {
    const view = camera.worldView;
    for (const enemy of this.list()) {
      // Gone for good: fallen into a pit, or walked off behind a screen that never scrolls back.
      if (enemy.body.top > this.level.heightInPixels || enemy.body.right < view.x) enemy.destroy();
    }
    // Listed again, because a destroyed enemy has no body left to ask about.
    const enemies = this.list();
    for (const enemy of enemies) enemy.advance(view.right, this.rusty.x, deltaMs);
    this.chainShells(enemies);
  }

  /** Everything stops while Rusty loses a life, as it did on the original console. */
  freeze(): void {
    for (const enemy of this.list()) enemy.body.setEnable(false);
  }

  /** A sliding shell bowls over everything it catches up with, which is how one kick clears a row. */
  private chainShells(enemies: readonly Enemy[]): void {
    for (const shell of enemies) {
      if (shell.stance !== 'sliding' || shell.isDefeated) continue;
      for (const caught of enemies) {
        if (caught === shell || caught.isDefeated || !caught.isAwake || survivesHit(caught.form)) continue;
        if (bodiesOverlap(shell.body, caught.body)) this.beat(caught, () => caught.knockOver());
      }
    }
  }

  /** Rusty and an enemy are touching: the rules say what that does to which of them. */
  private touch(enemy: Enemy): void {
    if (!enemy.touchesRusty) return;
    const fromAbove = this.isStomp(enemy);
    const outcome = resolveTouch({
      form: enemy.form,
      state: enemy.stance,
      fromAbove,
      invincible: this.rusty.hasGasket,
    });

    switch (outcome) {
      case 'nothing':
        return;
      case 'hurtRusty':
        this.onHurtRusty();
        return;
      case 'knockOver':
        this.beat(enemy, () => enemy.knockOver());
        return;
      case 'flatten':
        this.beat(enemy, () => enemy.flatten());
        break;
      case 'shell':
        if (enemy instanceof Shellbug) this.beat(enemy, () => enemy.enterShell());
        break;
      case 'loseWings':
        if (enemy instanceof Shellbug) this.beat(enemy, () => enemy.loseWings());
        break;
      case 'stopShell':
        if (enemy instanceof Shellbug) enemy.stopSliding();
        break;
      case 'kick':
        if (enemy instanceof Shellbug) this.beat(enemy, () => enemy.kick(this.kickDirection(enemy)), 'kicked');
        // A shell kicked while running past it does not throw Rusty into the air.
        if (!fromAbove) return;
        break;
    }
    this.rusty.body.setVelocityY(-ENEMIES.stompBounceSpeed);
    this.bouncedAt = this.scene.time.now;
  }

  /** Does something to an enemy that is worth points, and tells the scene where it happened. */
  private beat(enemy: Enemy, blow: () => void, how: BeatKind = 'beaten'): void {
    const { x } = enemy;
    const topY = enemy.body.top;
    blow();
    this.onBeaten(x, topY, how);
  }

  /**
   * A shell is kicked away from Rusty. When he is standing right over it, which way that is
   * would come down to a pixel or two, so it goes the way he is facing instead.
   */
  private kickDirection(shell: Enemy): 1 | -1 {
    const sideways = shell.x - this.rusty.x;
    if (Math.abs(sideways) < ENEMIES.kickFacingDistance) return this.rusty.facing;
    return sideways < 0 ? -1 : 1;
  }

  /**
   * Rusty stomps when he is on his way down and his feet reach the top of the enemy. Bouncing
   * off the first one he lands on stops him falling, so everything he came down on in the same
   * frame counts as stomped too, rather than the rest of the pile hurting him.
   */
  private isStomp(enemy: Enemy): boolean {
    const body = this.rusty.body;
    const comingDown = body.velocity.y > 0 || this.bouncedAt === this.scene.time.now;
    return comingDown && body.bottom - enemy.body.top <= ENEMIES.stompDepth;
  }

  private list(): Enemy[] {
    return this.group.getChildren().filter((child): child is Enemy => child instanceof Enemy);
  }
}
