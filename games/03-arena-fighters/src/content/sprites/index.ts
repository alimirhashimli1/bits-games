import type { SpriteAssets } from '@shared/phaser/pixelSprites';

import { ARENAS } from '../arenas';
import { FIGHTER_DATA } from '../fighters/fighterData';
import { createArenaSprites } from './arenaSprites';
import { createFighterSprites } from './fighterSprites';
import { PROJECTILE_SPRITES } from './projectiles';

/** Every sprite sheet in the game, turned into textures once at boot. */
export const SPRITES: readonly SpriteAssets[] = [
  ...Object.entries(FIGHTER_DATA).flatMap(([id, data]) => (data ? [createFighterSprites(id, data.art)] : [])),
  ...PROJECTILE_SPRITES,
  ...Object.values(ARENAS).flatMap((arena) => (arena ? createArenaSprites(arena) : [])),
];
