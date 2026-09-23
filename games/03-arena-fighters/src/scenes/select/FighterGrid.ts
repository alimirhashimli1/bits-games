import type * as Phaser from 'phaser';

import { COLORS, SCREEN } from '../../config';
import { FIGHTER_IDS } from '../../content/roster';
import { portraitSheetKey, PORTRAIT_FRAME, RANDOM_PORTRAIT_KEY } from '../../content/sprites/portraits';
import type { PlayerIndex } from '../../systems/matchSetup';

/**
 * Four across and four down: the fifteen fighters in roster order, then the random box. A cell is
 * the portrait with a pixel of margin and a pixel of frame around it, and a pixel of gap to the
 * next one, so the boxes read as sixteen separate plates rather than one block of faces.
 */
export const GRID = { columns: 4, rows: 4, cellWidth: 34, cellHeight: 32, top: 26 } as const;

/** The framed plate inside a cell, which the cursor traces exactly. */
const BOX = { width: PORTRAIT_FRAME.width + 2, height: PORTRAIT_FRAME.height + 2 } as const;

/** The last cell, which has the computer choose. It is one past the roster, so the grid is full. */
export const RANDOM_CELL = FIGHTER_IDS.length;

const CURSOR_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };
/** Player 2's cursor sits inside player 1's, so both are visible on the same portrait. */
const CURSOR_INSET: Readonly<Record<PlayerIndex, number>> = { 0: 0, 1: 2 };

/**
 * The portrait grid: every fighter from the belt up in a framed box, the random box after them,
 * and a cursor per player drawn over it. It only draws — which box each player is on, and whether
 * they have settled on it, is the scene's.
 */
export class FighterGrid {
  private readonly cursors: Readonly<Record<PlayerIndex, Phaser.GameObjects.Rectangle>>;

  constructor(scene: Phaser.Scene) {
    for (let index = 0; index <= RANDOM_CELL; index += 1) {
      const { x, y } = cellCenter(index);
      scene.add.rectangle(x, y, BOX.width, BOX.height, COLORS.hudFrame).setStrokeStyle(1, COLORS.muted);
      scene.add.sprite(x, y, portraitKey(index), 'face');
    }
    this.cursors = {
      0: this.createCursor(scene, 0),
      1: this.createCursor(scene, 1),
    };
  }

  /**
   * Puts a player's cursor on a box. A player still choosing has an outline; one who has
   * settled gets a filled box behind their portrait, so a glance says who is ready.
   */
  moveTo(player: PlayerIndex, index: number, locked: boolean, visible = true): void {
    const { x, y } = cellCenter(index);
    const cursor = this.cursors[player];
    cursor.setPosition(x, y).setVisible(visible);
    cursor.setFillStyle(CURSOR_COLORS[player], locked ? 0.35 : 0);
  }

  private createCursor(scene: Phaser.Scene, player: PlayerIndex): Phaser.GameObjects.Rectangle {
    const inset = CURSOR_INSET[player] * 2;
    return scene.add
      .rectangle(0, 0, BOX.width - inset, BOX.height - inset)
      .setStrokeStyle(1, CURSOR_COLORS[player])
      .setFillStyle(CURSOR_COLORS[player], 0);
  }
}

/** Which picture a cell shows: a fighter's portrait, or the question mark on the random box. */
function portraitKey(index: number): string {
  const id = FIGHTER_IDS[index];
  return id === undefined ? RANDOM_PORTRAIT_KEY : portraitSheetKey(id);
}

/** Where a box sits on screen, by its place in the grid. */
export function cellCenter(index: number): { readonly x: number; readonly y: number } {
  const column = index % GRID.columns;
  const row = Math.floor(index / GRID.columns);
  const left = (SCREEN.width - GRID.columns * GRID.cellWidth) / 2;
  return {
    x: Math.round(left + column * GRID.cellWidth + GRID.cellWidth / 2),
    y: GRID.top + row * GRID.cellHeight + Math.round(GRID.cellHeight / 2),
  };
}

/**
 * The box a direction moves to. Left and right wrap round within a row and up and down within a
 * column, so the cursor never sticks at an edge. The last cell of the grid is the random box, so
 * every cell has something in it; a sixteenth fighter would fill it and need a row more.
 */
export function movedBy(index: number, dx: number, dy: number): number {
  const column = (((index % GRID.columns) + dx) % GRID.columns + GRID.columns) % GRID.columns;
  const row = ((Math.floor(index / GRID.columns) + dy) % GRID.rows + GRID.rows) % GRID.rows;
  return Math.min(row * GRID.columns + column, RANDOM_CELL);
}
