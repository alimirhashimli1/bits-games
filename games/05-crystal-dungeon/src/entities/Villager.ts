import * as Phaser from 'phaser';

import { DEPTHS } from '../config';
import { PEOPLE, type PersonId } from '../content/people';
import { PEOPLE_ANIMATIONS, PEOPLE_SHEET } from '../content/sprites/people';

/**
 * Someone standing in a village, blinking now and then. Solid, so Wren bumps into them, which
 * is how she starts talking to them.
 */
export class Villager extends Phaser.GameObjects.Sprite {
  readonly who: PersonId;

  constructor(scene: Phaser.Scene, x: number, y: number, who: PersonId) {
    const look = PEOPLE[who].look;
    super(scene, x, y, PEOPLE_SHEET.key, look);
    this.who = who;
    scene.add.existing(this);
    this.setDepth(DEPTHS.enemies);
    this.play(PEOPLE_ANIMATIONS[look].key);
  }
}
