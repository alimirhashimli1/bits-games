import type * as Phaser from 'phaser';

import { ActionInput, type ActionBindings } from './actionInput';
import { addPixelText } from './pixelText';

export interface MenuItem {
  readonly label: string;
  /** What choosing the item does. Settings rows leave it out: confirm changes the value instead. */
  readonly onSelect?: () => void;
  /**
   * A setting's current value, shown in a second column. Items with one answer to left and
   * right as well, through `onChange`; items without are plain choices.
   */
  readonly value?: () => string;
  /** Called by left (-1) and right (+1). The value is read again afterwards. */
  readonly onChange?: (step: -1 | 1) => void;
}

export interface MenuOptions {
  /** Row of the first item. */
  readonly y: number;
  readonly lineHeight?: number;
  readonly color?: number;
  readonly selectedColor?: number;
  /** Which item the cursor opens on. Out-of-range values open on the first. */
  readonly startIndex?: number;
  /** Called when the highlight moves, and when an item is chosen: both are for sounds. */
  readonly onMove?: () => void;
  readonly onConfirm?: () => void;
  /** Called by Esc or B. Menus without a way back leave this out. */
  readonly onCancel?: () => void;
}

type MenuAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'cancel';

/** Menus read the keyboard and a gamepad at once, so either can drive them. */
const MENU_CONTROLS: ActionBindings<MenuAction> = {
  up: { keys: ['UP', 'W'], buttons: [12], stick: { axis: 1, direction: -1 } },
  down: { keys: ['DOWN', 'S'], buttons: [13], stick: { axis: 1, direction: 1 } },
  left: { keys: ['LEFT', 'A'], buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { keys: ['RIGHT', 'D'], buttons: [15], stick: { axis: 0, direction: 1 } },
  confirm: { keys: ['ENTER', 'SPACE'], buttons: [0] },
  cancel: { keys: ['ESC'], buttons: [1] },
};

const CURSOR = '>';
const DEFAULT_LINE_HEIGHT = 12;
/** Space between the cursor and the labels. */
const CURSOR_GAP = 10;
/** Space between a setting's name and its value. */
const VALUE_GAP = '  ';
const DEFAULT_COLOR = 0x8a8aa8;
const DEFAULT_SELECTED_COLOR = 0xffd23f;

/**
 * A list of choices with a cursor, driven by the keyboard or a gamepad.
 *
 * Labels are padded to the same width and share one left edge, so the cursor stays put
 * instead of jumping about as the highlight moves between long and short words. An item may
 * also carry a value, which makes the list a settings screen: left and right change the value
 * in place, and the row is drawn again with the new one.
 */
export class Menu {
  private readonly items: readonly MenuItem[];
  private readonly options: MenuOptions;
  private readonly input: ActionInput<MenuAction>;
  private readonly labels: Phaser.GameObjects.BitmapText[];
  private readonly cursor: Phaser.GameObjects.BitmapText;
  private readonly lineHeight: number;
  private readonly labelWidth: number;
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
    this.labelWidth = Math.max(...items.map((item) => item.label.length));
    this.index = this.opensOn(options.startIndex);

    // The widest row as the menu opens decides where the block sits; a value that grows longer
    // later runs on to the right rather than shifting every row.
    const width = Math.max(...items.map((item) => this.rowText(item).length));
    this.labels = items.map((item, row) =>
      addPixelText(scene, 0, options.y + row * this.lineHeight, this.rowText(item).padEnd(width), {
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
    if (this.input.justPressed('left')) this.change(-1, this.options.onMove);
    if (this.input.justPressed('right')) this.change(1, this.options.onMove);
    if (this.input.justPressed('confirm')) {
      // Confirm on a setting steps it forward, so a screen of settings can be used with one button.
      const item = this.items[this.index];
      if (item?.onChange) this.change(1, this.options.onConfirm);
      else {
        this.options.onConfirm?.();
        item?.onSelect?.();
      }
      return;
    }
    if (this.input.justPressed('cancel')) this.options.onCancel?.();
  }

  /** Removes the menu's own text, for scenes that swap one menu for another. */
  destroy(): void {
    this.labels.forEach((label) => label.destroy());
    this.cursor.destroy();
  }

  private opensOn(startIndex: number | undefined): number {
    if (startIndex === undefined || startIndex < 0 || startIndex >= this.items.length) return 0;
    return startIndex;
  }

  private move(step: number): void {
    const count = this.items.length;
    this.index = (this.index + step + count) % count;
    this.options.onMove?.();
    this.refresh();
  }

  /** Left or right on a setting. Items without a value ignore both. */
  private change(step: -1 | 1, sound: (() => void) | undefined): void {
    const item = this.items[this.index];
    if (!item?.onChange) return;
    item.onChange(step);
    sound?.();
    this.refresh();
  }

  private rowText(item: MenuItem): string {
    const label = item.label.padEnd(this.labelWidth);
    return item.value ? label + VALUE_GAP + item.value() : label;
  }

  private refresh(): void {
    const selected = this.options.selectedColor ?? DEFAULT_SELECTED_COLOR;
    const normal = this.options.color ?? DEFAULT_COLOR;

    this.labels.forEach((label, row) => {
      const item = this.items[row];
      if (item?.value) label.setText(this.rowText(item));
      label.setTint(row === this.index ? selected : normal);
    });
    this.cursor.setY(this.options.y + this.index * this.lineHeight);
  }
}
