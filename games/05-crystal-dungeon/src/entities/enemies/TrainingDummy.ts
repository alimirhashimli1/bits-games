import type * as Phaser from 'phaser';

import { DUMMY } from '../../config';
import { DUMMY_SHEET } from '../../content/sprites/combat';
import { Enemy } from './Enemy';

/**
 * A straw dummy for testing combat: it stands still, is knocked back and flashes red when hit,
 * goes after a few hits, and hurts Wren if she walks into it.
 */
export class TrainingDummy extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, DUMMY_SHEET.key, 'stand', DUMMY);
  }

  /** It only ever stands still. */
  protected think(): void {
    this.body.stop();
  }
}
