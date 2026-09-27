import * as Phaser from 'phaser';

import { DEPTHS } from '../config';
import { PUFF_ANIMATIONS, PUFF_SHEET } from '../content/sprites/pickups';

/** The puff of smoke a defeated enemy leaves. It plays once and removes itself. */
export function puffAt(scene: Phaser.Scene, x: number, y: number): void {
  const puff = scene.add.sprite(x, y, PUFF_SHEET.key, 'small').setDepth(DEPTHS.spark);
  puff.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => puff.destroy());
  puff.play(PUFF_ANIMATIONS.burst.key);
}
