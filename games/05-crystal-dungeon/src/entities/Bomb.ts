import * as Phaser from 'phaser';

import { BOMB, DEPTHS } from '../config';
import { BLAST_ANIMATIONS, BLAST_SHEET } from '../content/sprites/effects';
import { ITEM_SHEET } from '../content/sprites/items';

/** A bomb Wren has set down. It blinks, faster and faster, near the end of its fuse. */
export class Bomb extends Phaser.GameObjects.Image {
  private readonly litAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number, now: number) {
    super(scene, x, y, ITEM_SHEET.key, 'bombs');
    this.litAt = now;
    scene.add.existing(this);
    this.setDepth(DEPTHS.enemies);
  }

  /** Blinks near the end. Returns true once the fuse has burnt down: time to blow up. */
  tick(now: number): boolean {
    const age = now - this.litAt;
    if (age >= BOMB.fuseMs) return true;
    const leftShare = (BOMB.fuseMs - age) / (BOMB.fuseMs - BOMB.blinkFromMs);
    const blink = BOMB.blinkMs * (BOMB.fastestBlinkShare + (1 - BOMB.fastestBlinkShare) * leftShare);
    this.setVisible(age < BOMB.blinkFromMs || Math.floor(age / blink) % 2 === 0);
    return false;
  }
}

/** The blast of a bomb going off. It plays once and removes itself. */
export function blastAt(scene: Phaser.Scene, x: number, y: number): void {
  const blast = scene.add.sprite(x, y, BLAST_SHEET.key, 'flash').setDepth(DEPTHS.explosion);
  blast.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => blast.destroy());
  blast.play(BLAST_ANIMATIONS.burst.key);
}
