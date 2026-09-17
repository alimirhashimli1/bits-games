import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';
import {
  BIG_CROUCH,
  BIG_LEGS,
  BIG_TORSOS,
  HEADS,
  LEGS,
  MID_STRETCH,
  stackParts,
  stretchRows,
  TORSOS,
} from './rustyParts';

const SMALL_HEIGHT = 16;
const BIG_HEIGHT = 32;

const RUSTY_PALETTE = {
  k: ART_COLORS.outline,
  c: ART_COLORS.rustyCap,
  C: ART_COLORS.rustyCapLight,
  h: ART_COLORS.rustyBeard,
  s: ART_COLORS.rustySkin,
  S: ART_COLORS.rustyShirt,
  o: ART_COLORS.rustyOveralls,
  y: ART_COLORS.brassLight,
  b: ART_COLORS.rustyBoots,
} as const;

/** Big Rusty's torso rows kept above the crouch when he ducks: shoulders and buckles. */
const DUCK_TORSO_ROWS = 4;

function small(head: keyof typeof HEADS, torso: keyof typeof TORSOS, legs: keyof typeof LEGS) {
  return stackParts(SMALL_HEIGHT, [HEADS[head], TORSOS[torso], LEGS[legs]]);
}

function big(torso: keyof typeof BIG_TORSOS, legs: keyof typeof BIG_LEGS) {
  return stackParts(BIG_HEIGHT, [HEADS.side, BIG_TORSOS[torso], BIG_LEGS[legs]]);
}

/** Small Rusty, 16×16, facing right. */
export const RUSTY_SMALL_SHEET = {
  key: 'rusty-small',
  palette: RUSTY_PALETTE,
  frames: {
    stand: small('side', 'stand', 'stand'),
    walk1: small('side', 'stand', 'stepForward'),
    walk2: small('side', 'stand', 'stride'),
    walk3: small('side', 'stand', 'passing'),
    skid: small('side', 'skid', 'skid'),
    jump: small('side', 'jump', 'jump'),
    defeat: small('front', 'armsUp', 'stand'),
  },
} as const satisfies SpriteSheetDefinition;

/**
 * Big Rusty, 16×32, facing right. It also holds small and in-between Rusty pinned to
 * the bottom of a tall frame, so growing and shrinking can flicker between sizes in one animation.
 */
export const RUSTY_BIG_SHEET = {
  key: 'rusty-big',
  palette: RUSTY_PALETTE,
  frames: {
    stand: big('stand', 'stand'),
    walk1: big('stand', 'stepForward'),
    walk2: big('stand', 'stride'),
    walk3: big('stand', 'passing'),
    skid: big('skid', 'skid'),
    jump: big('jump', 'jump'),
    duck: stackParts(BIG_HEIGHT, [HEADS.side, BIG_TORSOS.stand.slice(0, DUCK_TORSO_ROWS), BIG_CROUCH]),
    growSmall: stackParts(BIG_HEIGHT, [small('side', 'stand', 'stand')]),
    growMid: stackParts(BIG_HEIGHT, [
      HEADS.side,
      stretchRows(TORSOS.stand, MID_STRETCH.torso),
      stretchRows(LEGS.stand, MID_STRETCH.legs),
    ]),
  },
} as const satisfies SpriteSheetDefinition;

/** Steam Rusty: big Rusty's frames in a white shirt and red overalls. */
export const RUSTY_STEAM_SHEET = {
  key: 'rusty-steam',
  palette: { ...RUSTY_PALETTE, S: ART_COLORS.steamShirt, o: ART_COLORS.steamOveralls },
  frames: RUSTY_BIG_SHEET.frames,
} as const satisfies SpriteSheetDefinition;

const WALK_FRAMES = ['walk1', 'walk2', 'walk3'] as const;
const WALK_FRAME_RATE = 10;
const RUN_FRAME_RATE = 18;
const GROW_FRAME_RATE = 10;
const LOOP = -1;

export const RUSTY_SMALL_ANIMATIONS = {
  stand: { key: 'rusty-small-stand', frames: ['stand'], frameRate: 1 },
  walk: { key: 'rusty-small-walk', frames: WALK_FRAMES, frameRate: WALK_FRAME_RATE, repeat: LOOP },
  run: { key: 'rusty-small-run', frames: WALK_FRAMES, frameRate: RUN_FRAME_RATE, repeat: LOOP },
  skid: { key: 'rusty-small-skid', frames: ['skid'], frameRate: 1 },
  jump: { key: 'rusty-small-jump', frames: ['jump'], frameRate: 1 },
  defeat: { key: 'rusty-small-defeat', frames: ['defeat'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

/** The poses big and steam Rusty share, with animation keys starting with the sheet's key. */
function bigPoseAnimations<Key extends string>(sheetKey: Key) {
  return {
    stand: { key: `${sheetKey}-stand`, frames: ['stand'], frameRate: 1 },
    walk: { key: `${sheetKey}-walk`, frames: WALK_FRAMES, frameRate: WALK_FRAME_RATE, repeat: LOOP },
    run: { key: `${sheetKey}-run`, frames: WALK_FRAMES, frameRate: RUN_FRAME_RATE, repeat: LOOP },
    skid: { key: `${sheetKey}-skid`, frames: ['skid'], frameRate: 1 },
    jump: { key: `${sheetKey}-jump`, frames: ['jump'], frameRate: 1 },
    duck: { key: `${sheetKey}-duck`, frames: ['duck'], frameRate: 1 },
  } as const satisfies Record<string, PixelAnimationDefinition>;
}

export const RUSTY_BIG_ANIMATIONS = {
  ...bigPoseAnimations(RUSTY_BIG_SHEET.key),
  /** Flickers between sizes, as the original console did, instead of scaling smoothly. */
  grow: {
    key: 'rusty-grow',
    frames: ['growSmall', 'growMid', 'growSmall', 'growMid', 'stand', 'growMid', 'stand'],
    frameRate: GROW_FRAME_RATE,
  },
  shrink: {
    key: 'rusty-shrink',
    frames: ['stand', 'growMid', 'stand', 'growMid', 'growSmall', 'growMid', 'growSmall'],
    frameRate: GROW_FRAME_RATE,
  },
} as const satisfies Record<string, PixelAnimationDefinition>;

export const RUSTY_STEAM_ANIMATIONS = bigPoseAnimations(RUSTY_STEAM_SHEET.key);
