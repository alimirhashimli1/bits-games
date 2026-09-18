import type { SpriteAssets } from '@shared/phaser/pixelSprites';

import { ENEMY_ANIMATIONS, ENEMY_SHEET, SPROUT_ANIMATIONS, SPROUT_SHEET } from './enemies';
import { COIN_ANIMATIONS, COIN_SHEET, DEBRIS_ROOFTOP_SHEET, DEBRIS_SEWER_SHEET, DEBRIS_SHEET } from './items';
import { VALVE_WHEEL_ANIMATIONS, VALVE_WHEEL_SHEET } from './levelEnd';
import { PLATFORM_SHEET } from './platforms';
import { POWER_UP_ANIMATIONS, POWER_UP_SHEET, STEAM_PUFF_ANIMATIONS, STEAM_PUFF_SHEET } from './powerUps';
import {
  RUSTY_BIG_ANIMATIONS,
  RUSTY_BIG_SHEET,
  RUSTY_SMALL_ANIMATIONS,
  RUSTY_SMALL_SHEET,
  RUSTY_STEAM_ANIMATIONS,
  RUSTY_STEAM_SHEET,
} from './rusty';
import { TILES_ROOFTOP_SHEET, TILES_SEWER_SHEET, TILES_SHEET } from './tiles';

/** Every sprite sheet in the game. The Boot scene registers them all once. */
export const SPRITES: readonly SpriteAssets[] = [
  { sheet: TILES_SHEET, animations: [] },
  { sheet: TILES_SEWER_SHEET, animations: [] },
  { sheet: TILES_ROOFTOP_SHEET, animations: [] },
  { sheet: COIN_SHEET, animations: Object.values(COIN_ANIMATIONS) },
  { sheet: DEBRIS_SHEET, animations: [] },
  { sheet: DEBRIS_SEWER_SHEET, animations: [] },
  { sheet: DEBRIS_ROOFTOP_SHEET, animations: [] },
  { sheet: PLATFORM_SHEET, animations: [] },
  { sheet: POWER_UP_SHEET, animations: Object.values(POWER_UP_ANIMATIONS) },
  { sheet: STEAM_PUFF_SHEET, animations: Object.values(STEAM_PUFF_ANIMATIONS) },
  { sheet: RUSTY_SMALL_SHEET, animations: Object.values(RUSTY_SMALL_ANIMATIONS) },
  { sheet: RUSTY_BIG_SHEET, animations: Object.values(RUSTY_BIG_ANIMATIONS) },
  { sheet: RUSTY_STEAM_SHEET, animations: Object.values(RUSTY_STEAM_ANIMATIONS) },
  { sheet: ENEMY_SHEET, animations: Object.values(ENEMY_ANIMATIONS) },
  { sheet: SPROUT_SHEET, animations: Object.values(SPROUT_ANIMATIONS) },
  { sheet: VALVE_WHEEL_SHEET, animations: Object.values(VALVE_WHEEL_ANIMATIONS) },
];
