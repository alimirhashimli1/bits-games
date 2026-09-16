import type { SpriteAssets } from '@shared/phaser/pixelSprites';

import { FIRE_ANIMATIONS, FIRE_SHEET } from './fire';
import { GORRAN_ANIMATIONS, GORRAN_SHEET } from './gorran';
import { GUARD_ANIMATIONS, GUARD_SHEET } from './guard';
import { HAWK_ANIMATIONS, HAWK_SHEET } from './hawk';
import { HERO_ANIMATIONS, HERO_SHEET } from './hero';
import { HEALTH_PIP_SHEET } from './hud';
import { MEI_ANIMATIONS, MEI_SHEET } from './mei';
import { TORCH_ANIMATIONS, TORCH_SHEET } from './torch';

/** Every sprite sheet in the game. The Boot scene registers them all once. */
export const SPRITES: readonly SpriteAssets[] = [
  { sheet: TORCH_SHEET, animations: Object.values(TORCH_ANIMATIONS) },
  { sheet: FIRE_SHEET, animations: Object.values(FIRE_ANIMATIONS) },
  { sheet: HERO_SHEET, animations: Object.values(HERO_ANIMATIONS) },
  { sheet: GUARD_SHEET, animations: Object.values(GUARD_ANIMATIONS) },
  { sheet: GORRAN_SHEET, animations: Object.values(GORRAN_ANIMATIONS) },
  { sheet: MEI_SHEET, animations: Object.values(MEI_ANIMATIONS) },
  { sheet: HAWK_SHEET, animations: Object.values(HAWK_ANIMATIONS) },
  { sheet: HEALTH_PIP_SHEET, animations: [] },
];
