import type * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { ITEMS } from '../../config';

/** A short label, like "1UP", that rises from a point in the level and vanishes. */
export function floatLabel(scene: Phaser.Scene, centerX: number, bottomY: number, text: string, color: number): void {
  const label = addPixelText(scene, centerX, bottomY, text, { color });
  label.setPosition(Math.round(centerX - label.width / 2), Math.round(bottomY - label.height));
  scene.tweens.add({
    targets: label,
    y: label.y - ITEMS.labelRise,
    duration: ITEMS.labelMs,
    onComplete: () => label.destroy(),
  });
}
