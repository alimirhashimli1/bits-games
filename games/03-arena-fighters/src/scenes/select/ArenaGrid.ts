import type * as Phaser from 'phaser';

import { COLORS, SCREEN } from '../../config';
import { ARENA_IDS } from '../../content/arenas/arenaTypes';
import { arenaThumbnailKey, THUMBNAIL } from '../../content/sprites/arenaThumbnails';
import type { PlayerIndex } from '../../systems/matchSetup';

/** Four across and four down: the sixteen arenas, in the order they were built. */
export const ARENA_GRID = { columns: 4, rows: 4, gapX: 6, gapY: 5, top: 28 } as const;

const CURSOR_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };
/**
 * Arenas nobody is on are dimmed, so the one being looked at stands out from the other fifteen.
 * The tint multiplies, and half the stages are night scenes already, so it only takes the edge
 * off: any darker and the ruins and the tower roof would go to a dark smudge.
 */
const DIM = 0xa0a0b8;

/**
 * The arena grid: a shrunken picture of every stage, with a cursor over the one being looked at.
 * It only draws; which arena that is belongs to the scene.
 */
export class ArenaGrid {
  private readonly thumbnails: Phaser.GameObjects.Sprite[];
  private readonly cursor: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.thumbnails = ARENA_IDS.map((id, index) => {
      const { x, y } = arenaCellCenter(index);
      return scene.add.sprite(x, y, arenaThumbnailKey(id), 'stage').setTint(DIM);
    });
    this.cursor = scene.add
      .rectangle(0, 0, THUMBNAIL.width + 2, THUMBNAIL.height + 2)
      .setStrokeStyle(1, CURSOR_COLORS[0])
      .setFillStyle(0, 0);
  }

  /** Puts the cursor on an arena, in the colour of whoever is choosing, and lights that one up. */
  moveTo(index: number, picker: PlayerIndex): void {
    const { x, y } = arenaCellCenter(index);
    this.cursor.setPosition(x, y).setStrokeStyle(1, CURSOR_COLORS[picker]);
    this.thumbnails.forEach((sprite, at) => sprite.setTint(at === index ? 0xffffff : DIM));
  }
}

/** Where an arena's picture sits on screen, by its place in the list. */
export function arenaCellCenter(index: number): { readonly x: number; readonly y: number } {
  const column = index % ARENA_GRID.columns;
  const row = Math.floor(index / ARENA_GRID.columns);
  const across = ARENA_GRID.columns * THUMBNAIL.width + (ARENA_GRID.columns - 1) * ARENA_GRID.gapX;
  const left = Math.round((SCREEN.width - across) / 2);
  return {
    x: left + column * (THUMBNAIL.width + ARENA_GRID.gapX) + Math.round(THUMBNAIL.width / 2),
    y: ARENA_GRID.top + row * (THUMBNAIL.height + ARENA_GRID.gapY) + Math.round(THUMBNAIL.height / 2),
  };
}

/**
 * The arena a direction moves to. Left and right wrap round within a row and up and down within
 * a column, the same way the fighter grid moves, so the two screens feel like one control.
 */
export function movedByArena(index: number, dx: number, dy: number): number {
  const { columns, rows } = ARENA_GRID;
  const column = (((index % columns) + dx) % columns + columns) % columns;
  const row = ((Math.floor(index / columns) + dy) % rows + rows) % rows;
  return row * columns + column;
}
