import { SpriteGalleryScene as SharedSpriteGalleryScene, type GalleryEntry } from '@shared/phaser/spriteGalleryScene';

import { COLORS } from '../config';
import { DUMMY_SHEET, HEART_SHEET, SPARK_ANIMATIONS, SPARK_SHEET } from '../content/sprites/combat';
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
} from '../content/sprites/enemies';
import { BLAST_ANIMATIONS, BLAST_SHEET, FLAME_ANIMATIONS, FLAME_SHEET } from '../content/sprites/effects';
import { DUNGEON_ITEM_SHEET, HUD_ICON_SHEET, ITEM_SHEET, KEY_SHEET } from '../content/sprites/items';
import { PEOPLE_ANIMATIONS, PEOPLE_SHEET } from '../content/sprites/people';
import { GEM_SHEET, HEART_CONTAINER_SHEET, PUFF_ANIMATIONS, PUFF_SHEET } from '../content/sprites/pickups';
import { SWORD_SHEET } from '../content/sprites/sword';
import { WREN_ANIMATIONS, WREN_SHEET } from '../content/sprites/wren';
import { FACINGS, type Facing } from '../systems/facing';
import { SCENES } from './sceneKeys';

const FACING_LABELS: Readonly<Record<Facing, string>> = { down: 'D', up: 'U', left: 'L', right: 'R' };

type FacingAnimations = Readonly<Record<Facing, { readonly key: string }>>;

/** One cell per facing, e.g. "WALK L". Labels are at most 8 characters so they fit inside one cell. */
function perFacing(label: string, animations: FacingAnimations, texture: string = WREN_SHEET.key): GalleryEntry[] {
  return FACINGS.map((facing) => ({ label: `${label} ${FACING_LABELS[facing]}`, texture, animation: animations[facing].key }));
}

const GALLERY: readonly GalleryEntry[] = [
  ...perFacing('IDLE', WREN_ANIMATIONS.idle),
  ...perFacing('WALK', WREN_ANIMATIONS.walk),
  ...perFacing('SWING', WREN_ANIMATIONS.swing),
  ...perFacing('ITEM', WREN_ANIMATIONS.useItem),
  { label: 'HOLD UP', texture: WREN_SHEET.key, animation: WREN_ANIMATIONS.holdUp.key },
  { label: 'HURT', texture: WREN_SHEET.key, animation: WREN_ANIMATIONS.hurt.key },
  { label: 'DEFEAT', texture: WREN_SHEET.key, animation: WREN_ANIMATIONS.defeat.key },
  ...FACINGS.map((facing) => ({ label: `SWORD ${FACING_LABELS[facing]}`, texture: SWORD_SHEET.key, frame: facing })),
  { label: 'SPARK', texture: SPARK_SHEET.key, animation: SPARK_ANIMATIONS.fly.key },
  { label: 'DUMMY', texture: DUMMY_SHEET.key, frame: 'stand' },
  { label: 'HEART', texture: HEART_SHEET.key, frame: 'full' },
  { label: 'HALF', texture: HEART_SHEET.key, frame: 'half' },
  { label: 'EMPTY', texture: HEART_SHEET.key, frame: 'empty' },
  { label: 'BLUB', texture: BLUB_SHEET.key, animation: BLUB_ANIMATIONS.wobble.key },
  ...perFacing('PEBBL', PEBBLENOSE_ANIMATIONS, PEBBLENOSE_SHEET.key),
  { label: 'PEBBLE', texture: PEBBLE_SHEET.key, frame: 'pebble' },
  ...perFacing('THORN', THORNBACK_ANIMATIONS.walk, THORNBACK_SHEET.key),
  { label: 'CHARGE R', texture: THORNBACK_SHEET.key, animation: THORNBACK_ANIMATIONS.charge.right.key },
  { label: 'FLITTER', texture: FLITTER_SHEET.key, animation: FLITTER_ANIMATIONS.fly.key },
  { label: 'F REST', texture: FLITTER_SHEET.key, animation: FLITTER_ANIMATIONS.rest.key },
  { label: 'GEM 1', texture: GEM_SHEET.key, frame: 'green' },
  { label: 'GEM 5', texture: GEM_SHEET.key, frame: 'blue' },
  { label: 'GEM 20', texture: GEM_SHEET.key, frame: 'red' },
  { label: 'PUFF', texture: PUFF_SHEET.key, animation: PUFF_ANIMATIONS.burst.key },
  { label: 'H CONTNR', texture: HEART_CONTAINER_SHEET.key, frame: 'container' },
  { label: 'MOONRANG', texture: ITEM_SHEET.key, frame: 'moonrang' },
  { label: 'BOMB', texture: ITEM_SHEET.key, frame: 'bombs' },
  { label: 'LANTERN', texture: ITEM_SHEET.key, frame: 'lantern' },
  { label: 'KEY', texture: KEY_SHEET.key, frame: 'key' },
  { label: 'HUD GEM', texture: HUD_ICON_SHEET.key, frame: 'gem' },
  { label: 'HUD KEY', texture: HUD_ICON_SHEET.key, frame: 'key' },
  { label: 'HUD BOMB', texture: HUD_ICON_SHEET.key, frame: 'bomb' },
  { label: 'SHIELD', texture: ITEM_SHEET.key, frame: 'brightshield' },
  { label: 'POTION', texture: ITEM_SHEET.key, frame: 'potion' },
  { label: 'MAP', texture: DUNGEON_ITEM_SHEET.key, frame: 'map' },
  { label: 'COMPASS', texture: DUNGEON_ITEM_SHEET.key, frame: 'compass' },
  { label: 'BOSS KEY', texture: DUNGEON_ITEM_SHEET.key, frame: 'bossKey' },
  { label: 'BLAST', texture: BLAST_SHEET.key, animation: BLAST_ANIMATIONS.burst.key },
  { label: 'FLAME', texture: FLAME_SHEET.key, animation: FLAME_ANIMATIONS.flicker.key },
  { label: 'GRAN', texture: PEOPLE_SHEET.key, animation: PEOPLE_ANIMATIONS.gran.key },
  { label: 'PIM', texture: PEOPLE_SHEET.key, animation: PEOPLE_ANIMATIONS.pim.key },
  { label: 'TOLLY', texture: PEOPLE_SHEET.key, animation: PEOPLE_ANIMATIONS.tolly.key },
  { label: 'BREE', texture: PEOPLE_SHEET.key, animation: PEOPLE_ANIMATIONS.bree.key },
  { label: 'HERMIT', texture: PEOPLE_SHEET.key, animation: PEOPLE_ANIMATIONS.hermit.key },
];

/** Development tool (open with `?scene=SpriteGallery`): plays every animation in the game. */
export class SpriteGalleryScene extends SharedSpriteGalleryScene {
  constructor() {
    super({
      key: SCENES.spriteGallery,
      entries: GALLERY,
      backgroundColor: COLORS.gallery,
      labelColor: COLORS.text,
      pageColor: COLORS.title,
    });
  }
}
