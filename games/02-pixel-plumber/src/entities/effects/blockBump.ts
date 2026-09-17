import type * as Phaser from 'phaser';

import { BLOCKS, LEVEL } from '../../config';
import { TILES_SHEET } from '../../content/sprites/tiles';
import { tileFrame } from '../../systems/levelLoader';

/**
 * Pops a tile up and back down. Tiles in a tilemap cannot move, so the tile is hidden while
 * a copy of it does the moving. The tile itself stays solid the whole time.
 */
export function bumpTile(scene: Phaser.Scene, tile: Phaser.Tilemaps.Tile): void {
  const frame = tileFrame(tile.index);
  if (!frame) return;

  tile.setVisible(false);
  const copy = scene.add.image(tile.pixelX + LEVEL.tileSize / 2, tile.pixelY + LEVEL.tileSize / 2, TILES_SHEET.key, frame);
  scene.tweens.add({
    targets: copy,
    y: copy.y - BLOCKS.bumpHeight,
    duration: BLOCKS.bumpMs,
    yoyo: true,
    onComplete: () => {
      copy.destroy();
      tile.setVisible(true);
    },
  });
}
