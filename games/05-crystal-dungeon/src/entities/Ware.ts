import * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS, DEPTHS, SHOP } from '../config';
import { ITEM_SHEET } from '../content/sprites/items';
import type { WareKind } from '../systems/shop';

/** The sprite each ware is shown with. */
const WARE_FRAMES: Readonly<Record<WareKind, keyof typeof ITEM_SHEET.frames>> = {
  brightshield: 'brightshield',
  bombRefill: 'bombs',
  potion: 'potion',
};

/** Something on show in the shop, with its price under it. Solid: walking into it asks "Buy it?". */
export class Ware extends Phaser.GameObjects.Image {
  readonly ware: WareKind;
  private readonly price: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene, x: number, y: number, ware: WareKind) {
    super(scene, x, y, ITEM_SHEET.key, WARE_FRAMES[ware]);
    this.ware = ware;
    scene.add.existing(this);
    this.setDepth(DEPTHS.enemies);
    this.price = addPixelText(scene, 0, y + SHOP.priceOffsetY, String(SHOP.prices[ware]), { color: COLORS.price }).setDepth(DEPTHS.prices);
    this.price.setX(Math.round(x - this.price.width / 2));
  }

  override destroy(fromScene?: boolean): void {
    this.price.destroy(fromScene);
    super.destroy(fromScene);
  }
}
