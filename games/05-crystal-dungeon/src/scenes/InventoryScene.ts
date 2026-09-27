import * as Phaser from 'phaser';

import { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';

import { COLORS, INVENTORY, INVENTORY_CONTROLS } from '../config';
import { ITEM_SHEET } from '../content/sprites/items';
import { ITEM_KINDS, type ItemKind } from '../systems/items';
import { SCENES } from './sceneKeys';

const DIM_ALPHA = 0.9;
const HEADING_Y = 40;
const HINT_Y = 150;

/** What each item is called on the inventory screen. */
const ITEM_NAMES: Readonly<Record<ItemKind, string>> = {
  moonrang: 'MOONRANG',
  bombs: 'BOMBS',
  lantern: 'LANTERN',
};

/** What the World hands the inventory: what Wren owns, and how to put an item in her hand. */
export interface InventorySceneData {
  readonly items: readonly ItemKind[];
  readonly itemInHand: ItemKind | null;
  readonly bombs: number;
  readonly maxBombs: number;
  /** Called as the cursor moves: the item under it is in her hand straight away. */
  readonly onChoose: (item: ItemKind) => void;
}

/**
 * The inventory, laid over the frozen world: the items Wren owns in a row, in the order they are
 * always listed. Left and right move the cursor, and the item under it is the one in her hand.
 * The dungeon map joins it with the final menus.
 */
export class InventoryScene extends Phaser.Scene {
  // Assigned in init() and create(), which Phaser always runs before update().
  private owner!: InventorySceneData;
  private controls!: ActionInput<keyof typeof INVENTORY_CONTROLS>;
  private owned: ItemKind[] = [];
  private index = 0;
  private cursor: Phaser.GameObjects.Graphics | null = null;
  private nameLabel: Phaser.GameObjects.BitmapText | null = null;
  /** The button that opened the inventory may still be down on the first frame, so it is skipped. */
  private primed = false;

  constructor() {
    super(SCENES.inventory);
  }

  init(data: InventorySceneData): void {
    this.owner = data;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, COLORS.dim, DIM_ALPHA).setOrigin(0, 0);
    addCenteredPixelText(this, HEADING_Y, 'INVENTORY', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, HINT_Y, 'LEFT / RIGHT TO CHOOSE, ENTER TO CLOSE', { color: COLORS.muted });

    this.owned = ITEM_KINDS.filter((item) => this.owner.items.includes(item));
    this.index = Math.max(0, this.owner.itemInHand ? this.owned.indexOf(this.owner.itemInHand) : 0);
    this.cursor = null;
    this.nameLabel = null;

    if (this.owned.length === 0) {
      addCenteredPixelText(this, INVENTORY.nameY, 'NO ITEMS YET', { color: COLORS.text });
    } else {
      this.drawSlots();
      this.nameLabel = addCenteredPixelText(this, INVENTORY.nameY, '', { color: COLORS.text });
      if (this.owner.maxBombs > 0) {
        addCenteredPixelText(this, INVENTORY.bombsY, `BOMBS ${this.owner.bombs} / ${this.owner.maxBombs}`, { color: COLORS.muted });
      }
      this.select(this.index);
    }

    this.controls = new ActionInput(this, INVENTORY_CONTROLS);
    this.primed = false;
  }

  override update(): void {
    this.controls.update();
    if (!this.primed) {
      this.primed = true;
      return;
    }
    if (this.owned.length > 0) {
      if (this.controls.justPressed('left')) this.select(this.index - 1);
      if (this.controls.justPressed('right')) this.select(this.index + 1);
    }
    if (this.controls.justPressed('close')) {
      this.scene.stop();
      this.scene.resume(SCENES.world);
    }
  }

  /** A framed slot per item owned, centred in a row, each with the item's sprite. */
  private drawSlots(): void {
    const slots = this.add.graphics().lineStyle(1, COLORS.inventorySlot);
    this.owned.forEach((item, slot) => {
      const { x, y } = this.slotMiddle(slot);
      slots.strokeRect(x - INVENTORY.slotSize / 2 + 0.5, y - INVENTORY.slotSize / 2 + 0.5, INVENTORY.slotSize - 1, INVENTORY.slotSize - 1);
      this.add.image(x, y, ITEM_SHEET.key, item);
    });
  }

  private slotMiddle(slot: number): { readonly x: number; readonly y: number } {
    const step = INVENTORY.slotSize + INVENTORY.slotGap;
    const rowWidth = this.owned.length * step - INVENTORY.slotGap;
    const left = (this.scale.width - rowWidth) / 2;
    return { x: Math.round(left + slot * step + INVENTORY.slotSize / 2), y: INVENTORY.slotsY };
  }

  /** Moves the cursor (wrapping round) and puts that item in her hand. */
  private select(index: number): void {
    const count = this.owned.length;
    this.index = ((index % count) + count) % count;
    const item = this.owned[this.index];
    if (!item) return;
    this.owner.onChoose(item);

    const { x, y } = this.slotMiddle(this.index);
    const half = INVENTORY.slotSize / 2 + 1;
    this.cursor?.destroy();
    this.cursor = this.add
      .graphics()
      .lineStyle(1, COLORS.inventoryCursor)
      .strokeRect(x - half + 0.5, y - half + 0.5, half * 2 - 1, half * 2 - 1);
    if (this.nameLabel) setCenteredPixelText(this.nameLabel, ITEM_NAMES[item]);
  }
}
