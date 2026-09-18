import { COLORS } from '../../config';
import { DEBRIS_ROOFTOP_SHEET, DEBRIS_SEWER_SHEET, DEBRIS_SHEET } from '../sprites/items';
import { TILES_ROOFTOP_SHEET, TILES_SEWER_SHEET, TILES_SHEET } from '../sprites/tiles';
import type { LevelId } from './levelOrder';

/** How a world looks: which textures its levels are drawn with, and what is behind them. */
export interface WorldTheme {
  /** The tile sheet the tilemap, and every bumped block, is drawn from. */
  readonly tilesKey: string;
  /** The pieces a broken brick bursts into, in the same brick colours. */
  readonly debrisKey: string;
  readonly background: number;
}

const STREET: WorldTheme = {
  tilesKey: TILES_SHEET.key,
  debrisKey: DEBRIS_SHEET.key,
  background: COLORS.background,
};

const SEWER: WorldTheme = {
  tilesKey: TILES_SEWER_SHEET.key,
  debrisKey: DEBRIS_SEWER_SHEET.key,
  background: COLORS.sewer,
};

const ROOFTOP: WorldTheme = {
  tilesKey: TILES_ROOFTOP_SHEET.key,
  debrisKey: DEBRIS_ROOFTOP_SHEET.key,
  background: COLORS.dusk,
};

/** The theme of each world. Worlds without one of their own run in the streets for now. */
const WORLD_THEMES: Readonly<Record<string, WorldTheme>> = {
  '1': STREET,
  '2': SEWER,
  '3': ROOFTOP,
};

/** The theme a level is drawn in, taken from the world its number starts with. */
export function worldTheme(id: LevelId): WorldTheme {
  return WORLD_THEMES[id.charAt(0)] ?? STREET;
}
