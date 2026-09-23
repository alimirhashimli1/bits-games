import type * as Phaser from 'phaser';

import { registerSprites, type SpriteAssets } from '@shared/phaser/pixelSprites';

import { ARENAS } from '../arenas';
import { FIGHTER_DATA } from '../fighters/fighterData';
import type { FighterId } from '../roster';
import { altPalette } from './altPalette';
import { createArenaSprites } from './arenaSprites';
import { createArenaThumbnail } from './arenaThumbnails';
import { createFighterSprites, fighterSheetKey } from './fighterSprites';
import { createPortraitSprites, createRandomPortrait } from './portraits';
import { PROJECTILE_SPRITES } from './projectiles';

const FIGHTERS_BUILT = Object.entries(FIGHTER_DATA).flatMap(([id, data]) => (data ? [[id, data] as const] : []));

/** Every sprite sheet the game always needs, turned into textures once at boot. */
export const SPRITES: readonly SpriteAssets[] = [
  ...FIGHTERS_BUILT.map(([id, data]) => createFighterSprites(fighterSheetKey(id, false), data.art)),
  ...FIGHTERS_BUILT.map(([id, data]) => createPortraitSprites(id, data.art)),
  createRandomPortrait(),
  ...PROJECTILE_SPRITES,
  ...Object.values(ARENAS).flatMap((arena) => (arena ? createArenaSprites(arena) : [])),
  // One shrunken picture of each arena for the versus arena select. They are tiny, and painting
  // them from the arenas themselves means no second set of pictures to keep in step.
  ...Object.values(ARENAS).flatMap((arena) => (arena ? [createArenaThumbnail(arena)] : [])),
];

/**
 * Makes sure one fighter's alternate-colour sheet exists, which only a mirror match needs.
 *
 * A fighter's sheet is every pose they have at 64×64, so a second copy of all sixteen would be
 * a great many textures drawn at boot for something most matches never show. They are built here
 * instead, when a player's cursor first lands on the fighter the other player has already taken.
 * Registering a sheet twice does nothing, so this is safe to call on any frame.
 */
export function ensureAltFighterSprites(scene: Phaser.Scene, id: FighterId): void {
  const data = FIGHTER_DATA[id];
  if (!data || scene.textures.exists(fighterSheetKey(id, true))) return;
  const art = { ...data.art, palette: altPalette(data.art.palette) };
  registerSprites(scene, [createFighterSprites(fighterSheetKey(id, true), art)]);
}
