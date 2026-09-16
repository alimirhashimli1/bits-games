import * as Phaser from 'phaser';

import { RESCUE } from '../config';

const IRON = 0x6f6f82;
const IRON_SHADE = 0x44445a;
const FALLEN = 0x55556a;
const BAR_SPACING = 7;
/** Drawn in front of Mei, so she stands behind the bars. */
const DEPTH = 40;
/** How quickly the bars rattle while a blow rings through them. */
const SHAKE_STEP_MS = 40;

/**
 * The cage Mei is held in. It takes a few blows to break: each one rings through the bars,
 * and the last one brings them down and leaves the wreck lying on the floor.
 */
export class Cage {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly left: number;
  private readonly top: number;
  private readonly width: number;
  private readonly height: number;
  private hitsLeft: number;
  private shakeMs = 0;

  constructor(scene: Phaser.Scene) {
    const { left, top, width, height } = RESCUE.cage;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.hitsLeft = RESCUE.hitsToBreak;

    this.graphics = scene.add.graphics().setDepth(DEPTH);
    this.draw();
  }

  get isBroken(): boolean {
    return this.hitsLeft <= 0;
  }

  /** The bars, as something Kenji's attacks can land on. */
  area(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.left, this.top, this.width, this.height);
  }

  /** Takes one blow. Returns true when this was the blow that broke it open. */
  hit(): boolean {
    if (this.isBroken) return false;

    this.hitsLeft--;
    this.shakeMs = RESCUE.shakeMs;
    this.draw();
    return this.isBroken;
  }

  update(deltaMs: number): void {
    if (this.shakeMs <= 0) return;

    this.shakeMs -= deltaMs;
    this.draw();
  }

  private draw(): void {
    this.graphics.clear();
    if (this.isBroken) {
      this.drawWreck();
      return;
    }
    this.drawBars(this.shakeOffset());
  }

  private shakeOffset(): number {
    if (this.shakeMs <= 0) return 0;
    return Math.floor(this.shakeMs / SHAKE_STEP_MS) % 2 === 0 ? -RESCUE.shakePixels : RESCUE.shakePixels;
  }

  private drawBars(shake: number): void {
    const bottom = this.top + this.height;

    this.fill(IRON_SHADE, this.left + shake, this.top, this.width, 3);
    this.fill(IRON_SHADE, this.left + shake, bottom - 2, this.width, 2);
    for (let x = this.left + 5; x < this.left + this.width - 4; x += BAR_SPACING) {
      this.fill(IRON, x + shake, this.top, 2, this.height - 2);
    }
    // Thicker corner posts.
    this.fill(IRON, this.left + shake, this.top, 3, this.height);
    this.fill(IRON, this.left + this.width - 3 + shake, this.top, 3, this.height);
  }

  /** What is left once it gives way: the frame above, and the bars down on the floor. */
  private drawWreck(): void {
    const bottom = this.top + this.height;

    this.fill(IRON_SHADE, this.left, this.top, this.width, 3);
    this.fill(IRON, this.left, this.top, 3, 9);
    this.fill(IRON, this.left + this.width - 3, this.top, 3, 9);
    this.fill(IRON_SHADE, this.left, bottom - 3, this.width, 3);
    this.fill(FALLEN, this.left + 5, bottom - 5, this.width - 14, 2);
  }

  private fill(color: number, x: number, y: number, width: number, height: number): void {
    this.graphics.fillStyle(color).fillRect(Math.round(x), Math.round(y), width, height);
  }
}
