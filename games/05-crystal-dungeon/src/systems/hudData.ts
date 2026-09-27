import type { ItemKind } from './items';
import type { Area, Cell } from './worldMap';

/**
 * The World scene publishes what the HUD shows in the game's registry, and the HUD scene redraws
 * whenever it changes, so neither scene has to hold the other.
 */
export const HUD_KEY = 'hud';

/** The mini-map: the area's grid of screens, which of them are shown, the one Wren is on, and perhaps the boss room. */
export interface MiniMap {
  readonly columns: number;
  readonly rows: number;
  /** Row by row, whether there is a screen there that the map shows. */
  readonly screens: readonly (readonly boolean[])[];
  readonly here: Cell;
  /** Marked once she has the dungeon's compass. */
  readonly boss?: Cell;
}

export interface MiniMapOptions {
  /** Which screens to show. Without it, every screen there is. */
  readonly isShown?: (column: number, row: number) => boolean;
  readonly boss?: Cell;
}

export interface HudData {
  /** In half hearts. */
  readonly health: number;
  readonly maxHealth: number;
  readonly gems: number;
  readonly keys: number;
  readonly bombs: number;
  readonly itemInHand: ItemKind | null;
  readonly miniMap: MiniMap;
}

/** The mini-map of an area, marking the screen at `here`. */
export function miniMapOf(area: Area, here: Cell, { isShown = () => true, boss }: MiniMapOptions = {}): MiniMap {
  const columns = Math.max(...area.screens.map((row) => row.length));
  return {
    columns,
    rows: area.screens.length,
    screens: area.screens.map((line, row) => Array.from({ length: columns }, (_, column) => Boolean(line[column]) && isShown(column, row))),
    here: { column: here.column, row: here.row },
    ...(boss ? { boss: { column: boss.column, row: boss.row } } : {}),
  };
}

export function isHudData(value: unknown): value is HudData {
  return typeof value === 'object' && value !== null && 'health' in value && 'miniMap' in value;
}
