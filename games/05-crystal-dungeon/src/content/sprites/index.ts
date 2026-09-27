import type { SpriteAssets } from '@shared/phaser/pixelSprites';

import { DUMMY_SHEET, HEART_SHEET, SPARK_ANIMATIONS, SPARK_SHEET } from './combat';
import {
  BLUB_ANIMATIONS,
  BLUB_SHEET,
  FLITTER_ANIMATIONS,
  FLITTER_SHEET,
  PEBBLE_SHEET,
  PEBBLENOSE_ANIMATIONS,
  PEBBLENOSE_SHEET,
  THORNBACK_ANIMATIONS,
  THORNBACK_SHEET,
} from './enemies';
import { BLAST_ANIMATIONS, BLAST_SHEET, FLAME_ANIMATIONS, FLAME_SHEET } from './effects';
import { DUNGEON_ITEM_SHEET, HUD_ICON_SHEET, ITEM_SHEET, KEY_SHEET } from './items';
import { PEOPLE_ANIMATIONS, PEOPLE_SHEET } from './people';
import { GEM_SHEET, HEART_CONTAINER_SHEET, PUFF_ANIMATIONS, PUFF_SHEET } from './pickups';
import { SWORD_SHEET } from './sword';
import { TILES_SHEET } from './tiles';
import { WREN_ANIMATION_LIST, WREN_SHEET } from './wren';

/** Every sprite sheet in the game, turned into textures once at boot. */
export const SPRITES: readonly SpriteAssets[] = [
  { sheet: TILES_SHEET, animations: [] },
  { sheet: WREN_SHEET, animations: WREN_ANIMATION_LIST },
  { sheet: SWORD_SHEET, animations: [] },
  { sheet: SPARK_SHEET, animations: Object.values(SPARK_ANIMATIONS) },
  { sheet: DUMMY_SHEET, animations: [] },
  { sheet: HEART_SHEET, animations: [] },
  { sheet: BLUB_SHEET, animations: Object.values(BLUB_ANIMATIONS) },
  { sheet: PEBBLENOSE_SHEET, animations: Object.values(PEBBLENOSE_ANIMATIONS) },
  {
    sheet: THORNBACK_SHEET,
    animations: [...Object.values(THORNBACK_ANIMATIONS.walk), ...Object.values(THORNBACK_ANIMATIONS.charge)],
  },
  { sheet: FLITTER_SHEET, animations: Object.values(FLITTER_ANIMATIONS) },
  { sheet: PEBBLE_SHEET, animations: [] },
  { sheet: GEM_SHEET, animations: [] },
  { sheet: PUFF_SHEET, animations: Object.values(PUFF_ANIMATIONS) },
  { sheet: HEART_CONTAINER_SHEET, animations: [] },
  { sheet: ITEM_SHEET, animations: [] },
  { sheet: KEY_SHEET, animations: [] },
  { sheet: HUD_ICON_SHEET, animations: [] },
  { sheet: DUNGEON_ITEM_SHEET, animations: [] },
  { sheet: BLAST_SHEET, animations: Object.values(BLAST_ANIMATIONS) },
  { sheet: FLAME_SHEET, animations: Object.values(FLAME_ANIMATIONS) },
  { sheet: PEOPLE_SHEET, animations: Object.values(PEOPLE_ANIMATIONS) },
];
