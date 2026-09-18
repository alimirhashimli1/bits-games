import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';

import { BOSS, LEVEL, RUSTY } from '../config';
import { SOUNDS } from '../content/sounds';
import { BARON_ANIMATIONS, BARON_SHEET, SLUDGE_ANIMATIONS, SLUDGE_SHEET } from '../content/sprites/boss';
import { BaronPattern, sludgeSpeedX } from '../systems/baronPattern';
import type { Cell } from '../systems/levelLoader';
import type { Rusty } from './Rusty';

const SPLAT_FRAME = 'splat';

/** A blob of sludge: it flies in an arc and splats on whatever it lands on. */
class SludgeBlob extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  splatted = false;
}

export interface SludgeBaronOptions {
  readonly cell: Cell;
  readonly layer: Phaser.Tilemaps.TilemapLayer;
  readonly rusty: Rusty;
  /** He or one of his blobs caught Rusty: the scene takes a power state off him, or a life. */
  readonly onHurtRusty: () => void;
  /** Enough steam beat him, at the top middle of where he was: the scene scores it. */
  readonly onBeaten: (x: number, topY: number) => void;
}

/**
 * The Sludge Baron. He paces a short stretch of his grates facing Rusty, hops often and high,
 * and lobs blobs of sludge at him. He cannot be stomped, and touching him or his sludge hurts.
 * Rusty beats him by getting past him to the lever, or by wearing him down with steam: enough
 * puffs and he flips over and falls out of the hall.
 */
export class SludgeBaron extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  /** Steam puffs burst against anything in here: the Baron himself. */
  readonly puffTargets: Phaser.Physics.Arcade.Group;
  private readonly blobs: Phaser.Physics.Arcade.Group;
  private readonly pattern = new BaronPattern();
  private readonly homeX: number;
  private readonly rusty: Rusty;
  private direction: 1 | -1 = -1;
  private awake = false;
  /** Set once the lever is pulled, or while Rusty is losing a life: he stops doing anything. */
  private stopped = false;
  private windUp: Phaser.Time.TimerEvent | undefined;
  private puffHits = 0;
  private beaten = false;
  private readonly onBeaten: (x: number, topY: number) => void;

  constructor(scene: Phaser.Scene, { cell, layer, rusty, onHurtRusty, onBeaten }: SludgeBaronOptions) {
    const feetX = (cell.column + 0.5) * LEVEL.tileSize;
    super(scene, feetX, (cell.row + 1) * LEVEL.tileSize, BARON_SHEET.key);
    this.homeX = feetX;
    this.rusty = rusty;
    this.onBeaten = onBeaten;
    scene.add.existing(this);
    this.puffTargets = scene.physics.add.group();
    this.puffTargets.add(this);
    this.setOrigin(0.5, 1);
    const { width, height, offsetX, offsetY } = BOSS.body;
    this.body.setSize(width, height, false);
    this.body.setOffset(offsetX, offsetY);
    this.body.setEnable(false);
    this.play(BARON_ANIMATIONS.stand.key);

    this.blobs = scene.physics.add.group();
    scene.physics.add.collider(this, layer);
    scene.physics.add.collider(this.blobs, layer, (blob) => {
      if (blob instanceof SludgeBlob) this.splat(blob);
    });
    const hurt = () => {
      if (!this.stopped && !rusty.hasGasket) onHurtRusty();
    };
    scene.physics.add.overlap(rusty, this, hurt);
    scene.physics.add.overlap(rusty, this.blobs, (_rusty, blob) => {
      if (!(blob instanceof SludgeBlob) || blob.splatted) return;
      blob.destroy();
      hurt();
    });
  }

  /** False until his middle comes on screen, and again once he is beaten; the boss music plays between. */
  get isAwake(): boolean {
    return this.awake && !this.beaten;
  }

  /** Call once per frame after physics. He waits until he is on screen, then goes about his business. */
  advance(camera: Phaser.Cameras.Scene2D.Camera, deltaMs: number): void {
    this.clearAwayBlobs(camera);
    if (this.stopped) return;
    if (!this.awake) {
      if (camera.worldView.right < this.x + BOSS.wakeMargin) return;
      this.awake = true;
      this.body.setEnable(true);
    }
    this.pace();
    // He always faces Rusty; his frames face right.
    this.setFlipX(this.rusty.x < this.x);
    for (const action of this.pattern.update(deltaMs)) {
      if (action === 'hop' && this.body.blocked.down) this.body.setVelocityY(-BOSS.hopSpeed);
      if (action === 'throw' && !this.windUp) this.startThrow();
    }
  }

  /** Everything stops while Rusty loses a life. */
  freeze(): void {
    this.standDown();
    this.body.setEnable(false);
    for (const blob of this.blobList()) blob.body.setEnable(false);
  }

  /**
   * A steam puff hit him. He flashes, and the last of `BOSS.puffHitsToBeat` beats him: he flips
   * over, is thrown up and falls out of the hall, touching nothing on the way.
   */
  takePuff(): void {
    if (this.stopped || this.beaten) return;
    this.puffHits += 1;
    playSound(this.puffHits < BOSS.puffHitsToBeat ? SOUNDS.baronHit : SOUNDS.baronBeaten);
    this.setTint(BOSS.hitTint);
    this.scene.time.delayedCall(BOSS.hitFlashMs, () => {
      if (!this.beaten) this.clearTint();
    });
    if (this.puffHits < BOSS.puffHitsToBeat) return;

    this.beaten = true;
    this.onBeaten(this.x, this.body.top);
    this.standDown();
    for (const blob of this.blobList()) blob.destroy();
    this.setFlipY(true);
    this.body.checkCollision.none = true;
    this.body.setVelocity(0, -BOSS.beatenJumpSpeed);
  }

  /** The lever is pulled and the grates under him are gone: he drops through, still scowling. */
  flush(): void {
    // Already beaten by steam and gone.
    if (this.beaten) return;
    this.standDown();
    for (const blob of this.blobList()) blob.destroy();
    this.body.setEnable(true);
    this.body.setVelocityX(0);
  }

  private standDown(): void {
    this.stopped = true;
    this.windUp?.remove();
    this.windUp = undefined;
    this.play(BARON_ANIMATIONS.stand.key);
  }

  /** Back and forth within his stretch of the hall, turning at either end of it or at a wall. */
  private pace(): void {
    const { blocked } = this.body;
    if (this.x <= this.homeX - BOSS.paceRange || blocked.left) this.direction = 1;
    else if (this.x >= this.homeX + BOSS.paceRange || blocked.right) this.direction = -1;
    this.body.setVelocityX(this.direction * BOSS.paceSpeed);
  }

  /** He raises a blob over his head, and a moment later lobs it at where Rusty is then. */
  private startThrow(): void {
    this.play(BARON_ANIMATIONS.throw.key);
    this.windUp = this.scene.time.delayedCall(BOSS.windUpMs, () => {
      this.windUp = undefined;
      if (this.stopped) return;
      this.play(BARON_ANIMATIONS.stand.key);
      this.throwBlob();
    });
  }

  private throwBlob(): void {
    playSound(SOUNDS.baronThrow);
    const facing = this.flipX ? -1 : 1;
    const handX = this.x + facing * BOSS.handAhead;
    const blob = new SludgeBlob(this.scene, handX, this.y - BOSS.handHeight, SLUDGE_SHEET.key);
    this.scene.add.existing(blob);
    // Adding to the group creates the body, so its size and speed are set afterwards.
    this.blobs.add(blob);
    blob.play(SLUDGE_ANIMATIONS.fly.key);
    blob.body.setSize(BOSS.sludgeBodySize, BOSS.sludgeBodySize, true);
    // Aimed to come down on Rusty's feet, allowing for the drop from the Baron's hand to them.
    const drop = this.rusty.y - blob.y;
    blob.body.setVelocity(sludgeSpeedX(this.rusty.x - handX, drop, RUSTY.gravity), -BOSS.sludgeLaunchSpeed);
  }

  /** A landed blob stops, lies flat for a moment and is gone. */
  private splat(blob: SludgeBlob): void {
    if (blob.splatted) return;
    blob.splatted = true;
    blob.body.setEnable(false);
    blob.stop();
    blob.setFrame(SPLAT_FRAME);
    this.scene.time.delayedCall(BOSS.splatMs, () => blob.destroy());
  }

  /** Blobs that fall out of the level or off the screen are removed. */
  private clearAwayBlobs(camera: Phaser.Cameras.Scene2D.Camera): void {
    for (const blob of this.blobList()) {
      if (!Phaser.Geom.Rectangle.Overlaps(camera.worldView, blob.getBounds())) blob.destroy();
    }
  }

  private blobList(): SludgeBlob[] {
    return this.blobs.getChildren().filter((child): child is SludgeBlob => child instanceof SludgeBlob);
  }
}
