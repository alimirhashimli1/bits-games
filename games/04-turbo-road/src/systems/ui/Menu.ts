import { playSound } from '@shared/audio/audioEngine';
import { drawPixelText, measurePixelText } from '@shared/pixel-font/canvasPixelText';

import type { GameAction } from '../../content/controls';
import { MENU_MOVE, MENU_SELECT } from '../../content/sounds';
import { COLORS } from '../../config';
import type { ActionInput } from '../input/ActionInput';

export interface MenuItem {
  readonly label: string;
  readonly onSelect: () => void;
}

export interface MenuOptions {
  /** Row of the first item. */
  readonly y: number;
  /** Called by Esc or B. Menus without a way back leave this out. */
  readonly onCancel?: () => void;
  /** Called whenever the cursor moves onto an item, with its place in the list. */
  readonly onHighlight?: (index: number) => void;
}

const CURSOR = '>';
const LINE_HEIGHT = 12;
/** Space between the cursor and the labels. */
const CURSOR_GAP = 10;

/**
 * A list of choices with a cursor, driven by the keyboard or a gamepad, drawn like the menus
 * in the other games. Labels share one left edge, so the cursor does not jump sideways
 * as it moves between long and short words.
 */
export class Menu {
  private index = 0;
  private readonly left: number;

  constructor(
    private readonly input: ActionInput<GameAction>,
    private readonly items: readonly MenuItem[],
    private readonly options: MenuOptions,
    screenWidth: number,
  ) {
    if (items.length === 0) throw new Error('A menu needs at least one item.');
    const widest = Math.max(...items.map((item) => measurePixelText(item.label)));
    this.left = Math.round((screenWidth - widest) / 2);
  }

  /** Call once per game step. */
  update(): void {
    if (this.input.justPressed('up')) this.move(-1);
    if (this.input.justPressed('down')) this.move(1);
    if (this.input.justPressed('confirm')) {
      playSound(MENU_SELECT);
      this.items[this.index]?.onSelect();
      return;
    }
    if (this.input.justPressed('cancel')) this.options.onCancel?.();
  }

  draw(context: CanvasRenderingContext2D): void {
    this.items.forEach((item, row) => {
      const color = row === this.index ? COLORS.selected : COLORS.muted;
      drawPixelText(context, item.label, this.left, this.options.y + row * LINE_HEIGHT, { color });
    });
    const cursorY = this.options.y + this.index * LINE_HEIGHT;
    drawPixelText(context, CURSOR, this.left - CURSOR_GAP, cursorY, { color: COLORS.selected });
  }

  private move(step: number): void {
    const count = this.items.length;
    this.index = (this.index + step + count) % count;
    playSound(MENU_MOVE);
    this.options.onHighlight?.(this.index);
  }
}
