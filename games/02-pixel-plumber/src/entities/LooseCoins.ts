import * as Phaser from 'phaser';

import { BLOCKS, LEVEL } from '../config';
import { COIN_ANIMATIONS, COIN_SHEET } from '../content/sprites/items';
import type { Cell } from '../systems/levelLoader';

/** The coins placed in a level, spinning where they are until Rusty touches them. */
export class LooseCoins {
  readonly group: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene, cells: readonly Cell[]) {
    this.group = scene.physics.add.staticGroup();
    for (const { column, row } of cells) {
      const x = (column + 0.5) * LEVEL.tileSize;
      const y = (row + 0.5) * LEVEL.tileSize;
      const coin = this.group.create(x, y, COIN_SHEET.key) as Phaser.Physics.Arcade.Sprite;
      coin.play(COIN_ANIMATIONS.spin.key);
      coin.body?.setSize(BLOCKS.coinBodyWidth, BLOCKS.coinBodyHeight);
    }
  }

  /** Calls `onCollect` once for each coin `collector` touches, and removes the coin. */
  collectWith(scene: Phaser.Scene, collector: Phaser.GameObjects.GameObject, onCollect: () => void): void {
    scene.physics.add.overlap(collector, this.group, (_collector, coin) => {
      if (!(coin instanceof Phaser.Physics.Arcade.Sprite)) return;
      coin.destroy();
      onCollect();
    });
  }
}
