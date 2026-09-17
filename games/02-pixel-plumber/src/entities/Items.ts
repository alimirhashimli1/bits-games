import * as Phaser from 'phaser';

import { ITEMS, LEVEL } from '../config';
import { POWER_UP_ANIMATIONS, POWER_UP_SHEET } from '../content/sprites/powerUps';
import type { ItemKind } from '../systems/powerState';

/** Drawn behind the tiles while rising, so an item seems to come out of its block. */
const BEHIND_TILES_DEPTH = -1;

/** How fast each item moves sideways once it is out. The Steam Valve stays put. */
const SPEEDS: Readonly<Record<ItemKind, number>> = {
  gear: ITEMS.slideSpeed,
  wrench: ITEMS.slideSpeed,
  goldenGasket: ITEMS.gasketSpeed,
  steamValve: 0,
};

/** One item out in the level. Its body only exists once it has finished rising out of its block. */
class Item extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Phaser.Scene,
    blockCenterX: number,
    blockBottomY: number,
    readonly kind: ItemKind,
  ) {
    super(scene, blockCenterX, blockBottomY, POWER_UP_SHEET.key);
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(BEHIND_TILES_DEPTH).play(POWER_UP_ANIMATIONS[kind].key);
  }
}

/**
 * Items rising out of blocks and moving about: the Gear and 1-Up Wrench slide and turn round at
 * walls, the Golden Gasket bounces along, and the Steam Valve stays where it came out.
 */
export class Items {
  private readonly group: Phaser.Physics.Arcade.Group;

  constructor(
    private readonly scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer,
    private readonly levelHeight: number,
  ) {
    this.group = scene.physics.add.group();
    scene.physics.add.collider(this.group, layer);
  }

  /** Calls `onCollect` with the kind of each item `collector` touches, and removes the item. */
  collectWith(collector: Phaser.GameObjects.GameObject, onCollect: (kind: ItemKind) => void): void {
    this.scene.physics.add.overlap(collector, this.group, (_collector, item) => {
      if (!(item instanceof Item)) return;
      item.destroy();
      onCollect(item.kind);
    });
  }

  /** An item rises out of the top of `block`, then starts moving. */
  emerge(kind: ItemKind, block: Phaser.Tilemaps.Tile): void {
    const item = new Item(this.scene, block.getCenterX(), block.pixelY + LEVEL.tileSize, kind);
    this.scene.tweens.add({
      targets: item,
      y: block.pixelY,
      duration: ITEMS.riseMs,
      onComplete: () => this.release(item),
    });
  }

  /** Call once per frame after physics: turns sliders round at walls, bounces the gasket, and drops fallen items. */
  update(): void {
    for (const child of this.group.getChildren()) {
      if (!(child instanceof Item)) continue;
      if (child.body.top > this.levelHeight) {
        child.destroy();
        continue;
      }
      // Hitting a wall stops the body dead, so the item's own speed is used to turn it round.
      const { blocked, velocity } = child.body;
      const speed = SPEEDS[child.kind];
      if (blocked.left) velocity.x = speed;
      if (blocked.right) velocity.x = -speed;
      if (child.kind === 'goldenGasket' && blocked.down) velocity.y = -ITEMS.gasketBounceSpeed;
    }
  }

  /** Gives a risen item its body and sets it moving. */
  private release(item: Item): void {
    if (!item.active) return;
    item.setDepth(0);
    // Adding to the group creates the body and applies the group's defaults, so movement is set afterwards.
    this.group.add(item);
    item.body.setSize(ITEMS.bodyWidth, ITEMS.bodyHeight, false);
    item.body.setOffset((LEVEL.tileSize - ITEMS.bodyWidth) / 2, LEVEL.tileSize - ITEMS.bodyHeight);
    // The level's side walls turn items round too. Its bottom is open, so they can still fall into pits.
    item.body.setCollideWorldBounds(true);
    item.body.setVelocityX(SPEEDS[item.kind]);
    if (item.kind === 'goldenGasket') item.body.setVelocityY(-ITEMS.gasketBounceSpeed);
  }
}
