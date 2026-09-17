import type * as Phaser from 'phaser';

import { BLOCKS, LEVEL } from '../../config';
import { DEBRIS_SHEET } from '../../content/sprites/items';

const QUARTER = LEVEL.tileSize / 4;

/** Where each of the four pieces starts inside the brick, which way it flies, and whether it is thrown high. */
const PIECES = [
  { offsetX: -QUARTER, offsetY: -QUARTER, direction: -1, high: true },
  { offsetX: QUARTER, offsetY: -QUARTER, direction: 1, high: true },
  { offsetX: -QUARTER, offsetY: QUARTER, direction: -1, high: false },
  { offsetX: QUARTER, offsetY: QUARTER, direction: 1, high: false },
] as const;

/** Bursts a broken brick into four pieces that fall through everything under gravity. */
export function burstBrick(scene: Phaser.Scene, centerX: number, centerY: number): void {
  for (const { offsetX, offsetY, direction, high } of PIECES) {
    const piece = scene.physics.add.image(centerX + offsetX, centerY + offsetY, DEBRIS_SHEET.key);
    piece.setVelocity(
      direction * BLOCKS.debrisSpreadSpeed,
      -(high ? BLOCKS.debrisHighLaunchSpeed : BLOCKS.debrisLowLaunchSpeed),
    );
    piece.setFlipX(direction < 0);
    scene.time.delayedCall(BLOCKS.debrisLifetimeMs, () => piece.destroy());
  }
}
