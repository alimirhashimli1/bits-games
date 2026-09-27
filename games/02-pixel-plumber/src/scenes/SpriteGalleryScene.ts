import { SpriteGalleryScene as SharedSpriteGalleryScene, type GalleryEntry } from '@shared/phaser/spriteGalleryScene';

import { COLORS } from '../config';
import {
  BARON_ANIMATIONS,
  BARON_SHEET,
  LEVER_ANIMATIONS,
  LEVER_SHEET,
  SLUDGE_ANIMATIONS,
  SLUDGE_SHEET,
} from '../content/sprites/boss';
import { ENEMY_ANIMATIONS, ENEMY_SHEET, SPROUT_ANIMATIONS, SPROUT_SHEET } from '../content/sprites/enemies';
import { VALVE_WHEEL_ANIMATIONS, VALVE_WHEEL_SHEET } from '../content/sprites/levelEnd';
import {
  POWER_UP_ANIMATIONS,
  POWER_UP_SHEET,
  STEAM_PUFF_ANIMATIONS,
  STEAM_PUFF_SHEET,
} from '../content/sprites/powerUps';
import {
  RUSTY_BIG_ANIMATIONS,
  RUSTY_BIG_SHEET,
  RUSTY_SMALL_ANIMATIONS,
  RUSTY_SMALL_SHEET,
  RUSTY_STEAM_ANIMATIONS,
  RUSTY_STEAM_SHEET,
} from '../content/sprites/rusty';
import { SCENES } from './sceneKeys';

/** Labels are at most 8 characters so they fit inside one cell. */
const GALLERY: readonly GalleryEntry[] = [
  { label: 'S STAND', texture: RUSTY_SMALL_SHEET.key, animation: RUSTY_SMALL_ANIMATIONS.stand.key },
  { label: 'S WALK', texture: RUSTY_SMALL_SHEET.key, animation: RUSTY_SMALL_ANIMATIONS.walk.key },
  { label: 'S RUN', texture: RUSTY_SMALL_SHEET.key, animation: RUSTY_SMALL_ANIMATIONS.run.key },
  { label: 'S SKID', texture: RUSTY_SMALL_SHEET.key, animation: RUSTY_SMALL_ANIMATIONS.skid.key },
  { label: 'S JUMP', texture: RUSTY_SMALL_SHEET.key, animation: RUSTY_SMALL_ANIMATIONS.jump.key },
  { label: 'S DEFEAT', texture: RUSTY_SMALL_SHEET.key, animation: RUSTY_SMALL_ANIMATIONS.defeat.key },
  { label: 'B STAND', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.stand.key },
  { label: 'B WALK', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.walk.key },
  { label: 'B RUN', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.run.key },
  { label: 'B SKID', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.skid.key },
  { label: 'B JUMP', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.jump.key },
  { label: 'B DUCK', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.duck.key },
  { label: 'GROW', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.grow.key },
  { label: 'SHRINK', texture: RUSTY_BIG_SHEET.key, animation: RUSTY_BIG_ANIMATIONS.shrink.key },
  { label: 'ST STAND', texture: RUSTY_STEAM_SHEET.key, animation: RUSTY_STEAM_ANIMATIONS.stand.key },
  { label: 'ST RUN', texture: RUSTY_STEAM_SHEET.key, animation: RUSTY_STEAM_ANIMATIONS.run.key },
  { label: 'ST JUMP', texture: RUSTY_STEAM_SHEET.key, animation: RUSTY_STEAM_ANIMATIONS.jump.key },
  { label: 'ST DUCK', texture: RUSTY_STEAM_SHEET.key, animation: RUSTY_STEAM_ANIMATIONS.duck.key },
  { label: 'GEAR', texture: POWER_UP_SHEET.key, animation: POWER_UP_ANIMATIONS.gear.key },
  { label: 'VALVE', texture: POWER_UP_SHEET.key, animation: POWER_UP_ANIMATIONS.steamValve.key },
  { label: 'GASKET', texture: POWER_UP_SHEET.key, animation: POWER_UP_ANIMATIONS.goldenGasket.key },
  { label: 'WRENCH', texture: POWER_UP_SHEET.key, animation: POWER_UP_ANIMATIONS.wrench.key },
  { label: 'PUFF', texture: STEAM_PUFF_SHEET.key, animation: STEAM_PUFF_ANIMATIONS.fly.key },
  { label: 'GLOOP', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.gloop.key },
  { label: 'GLOOP FL', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.gloopFlat.key },
  { label: 'BUG', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.shellbug.key },
  { label: 'SHELL', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.shell.key },
  { label: 'SLIDING', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.shellSliding.key },
  { label: 'FLUTTER', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.flutterbug.key },
  { label: 'SPROUT', texture: SPROUT_SHEET.key, animation: SPROUT_ANIMATIONS.snap.key },
  { label: 'SPARK', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.spark.key },
  { label: 'CHAIN', texture: ENEMY_SHEET.key, animation: ENEMY_ANIMATIONS.chainLink.key },
  { label: 'WHEEL', texture: VALVE_WHEEL_SHEET.key, animation: VALVE_WHEEL_ANIMATIONS.turn.key },
  { label: 'BARON', texture: BARON_SHEET.key, animation: BARON_ANIMATIONS.stand.key },
  { label: 'B THROW', texture: BARON_SHEET.key, animation: BARON_ANIMATIONS.throw.key },
  { label: 'SLUDGE', texture: SLUDGE_SHEET.key, animation: SLUDGE_ANIMATIONS.fly.key },
  { label: 'LEVER', texture: LEVER_SHEET.key, animation: LEVER_ANIMATIONS.pull.key },
];

/**
 * Development tool (open with `?scene=SpriteGallery`): plays every animation in the game on
 * one screen. Enter or Space shows the next page.
 */
export class SpriteGalleryScene extends SharedSpriteGalleryScene {
  constructor() {
    super({
      key: SCENES.spriteGallery,
      entries: GALLERY,
      backgroundColor: COLORS.background,
      labelColor: COLORS.text,
      pageColor: COLORS.title,
    });
  }
}
