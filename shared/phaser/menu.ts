import type * as Phaser from 'phaser';

import { ActionInput, type ActionBindings } from './actionInput';
import { addPixelText } from './pixelText';

export interface MenuItem {
  readonly label: string;
  readonly onSelect: () => void;
}

export interface MenuOptions {
  /** Row of the first item. */
  readonly y: number;
  readonly lineHeight?: number;
  readonly color?: number;
  readonly selectedColor?: number;
  /** Called when the highlight moves, and when an item is chosen: both are for sounds. */
  readonly onMove?: () => void;
  readonly onConfirm?: () => void;
  /** Called by Esc or B. Menus without a way back leave this out. */
  readonly onCancel?: () => void;
}

type MenuAction = 'up' | 'down' | 'confirm' | 'cancel';

/** Menus read the keyboard and a gamepad at once, so either can drive them. */
const MENU_CONTROLS: ActionBindings<MenuAction> = {
  up: { keys: ['UP', 'W'], buttons: [12], stick: { axis: 1, direction: -1 } },
  down: { keys: ['DOWN', 'S'], buttons: [13], stick: { axis: 1, direction: 1 } },
  confirm: { keys: ['ENTER', 'SPACE'], buttons: [0] },
  cancel: { keys: ['ESC'], buttons: [1] },
};

const CURSOR = '>';
const DEFAULT_LINE_HEIGHT = 12;
/** Space between the cursor and the labels. */
const CURSOR_GAP = 10;
const DEFAULT_COLOR = 0x8a8aa8;
const DEFAULT_SELECTED_COLOR = 0xffd23f;

/**
 * A list of choices with a cursor, driven by the keyboard or a gamepad.
 *
 * Labels are padded to the same width and share one left edge, so the cursor stays put
 * instead of jumping about as the highlight moves between long and short words.
 */
export class Menu {
  private readonly items: readonly MenuItem[];
  private readonly options: MenuOptions;
  private readonly input: ActionInput<MenuAction>;
  private readonly labels: Phaser.GameObjects.BitmapText[];
  private readonly cursor: Phaser.GameObjects.BitmapText;
  private readonly lineHeight: number;
  /**
   * A menu is usually opened by a key press, and that key is often still down on the first
   * frame. Without skipping it, the menu would act on the press that opened it.
   */
  private primed = false;
  private index = 0;

  constructor(scene: Phaser.Scene, items: readonly MenuItem[], options: MenuOptions) {
    if (items.length === 0) throw new Error('A menu needs at least one item.');

    this.items = items;
    this.options = options;
    this.lineHeight = options.lineHeight ?? DEFAULT_LINE_HEIGHT;
    this.input = new ActionInput(scene, MENU_CONTROLS);

    const width = Math.max(...items.map((item) => item.label.length));
    this.labels = items.map((item, row) =>
      addPixelText(scene, 0, options.y + row * this.lineHeight, item.label.padEnd(width), {
        color: options.color ?? DEFAULT_COLOR,
      }),
    );

    const left = Math.round((scene.scale.width - (this.labels[0]?.width ?? 0)) / 2);
    this.labels.forEach((label) => label.setX(left));
    this.cursor = addPixelText(scene, left - CURSOR_GAP, options.y, CURSOR, {
      color: options.selectedColor ?? DEFAULT_SELECTED_COLOR,
    });

    this.refresh();
  }

  /** Call once per frame. */
  update(): void {
    this.input.update();
    if (!this.primed) {
      this.primed = true;
      return;
    }

    if (this.input.justPressed('up')) this.move(-1);
    if (this.input.justPressed('down')) this.move(1);
    if (this.input.justPressed('confirm')) {
      this.options.onConfirm?.();
      this.items[this.index]?.onSelect();
      return;
    }
    if (this.input.justPressed('cancel')) this.options.onCancel?.();
  }

  /** Removes the menu's own text, for scenes that swap one menu for another. */
  destroy(): void {
    this.labels.forEach((label) => label.destroy());
    this.cursor.destroy();
  }

  private move(step: number): void {
    const count = this.items.length;
    this.index = (this.index + step + count) % count;
    this.options.onMove?.();
    this.refresh();
  }

  private refresh(): void {
    const selected = this.options.selectedColor ?? DEFAULT_SELECTED_COLOR;
    const normal = this.options.color ?? DEFAULT_COLOR;

    this.labels.forEach((label, row) => label.setTint(row === this.index ? selected : normal));
    this.cursor.setY(this.options.y + this.index * this.lineHeight);
  }
}
