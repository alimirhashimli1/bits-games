import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

/** A straw training dummy on a post, with a plank for arms. */
export const DUMMY_SHEET = {
  key: 'dummy',
  palette: {
    k: ART_COLORS.outline,
    y: ART_COLORS.straw,
    Y: ART_COLORS.strawDark,
    t: ART_COLORS.leather,
    n: ART_COLORS.plank,
  },
  frames: {
    stand: [
      '......kkkk......',
      '.....kyyyyk.....',
      '.....kyYyYk.....',
      '.....kyyyyk.....',
      '......kkkk......',
      '..kkkkkttkkkkk..',
      '..knnnnttnnnnk..',
      '..kkkkkttkkkkk..',
      '.....kyyyyk.....',
      '....kyyYyyyk....',
      '....kyyyyYyk....',
      '.....kyyyyk.....',
      '......kttk......',
      '......kttk......',
      '.....kkttkk.....',
      '....kkkkkkkk....',
    ],
  },
} as const satisfies SpriteSheetDefinition;

const SPARK_SIZE = 16;
const SPARK_MIDDLE = 7;
const SPARK_ARM = 5;

/** A four-pointed glint: thin arms round a 3×3 core, in `edge` with a `core` middle. */
function spark(edge: string, core: string): PixelMap {
  const grid = new PixelGrid(SPARK_SIZE, SPARK_SIZE);
  grid.fillRect(SPARK_MIDDLE, SPARK_MIDDLE - SPARK_ARM, 1, SPARK_ARM * 2 + 1, edge);
  grid.fillRect(SPARK_MIDDLE - SPARK_ARM, SPARK_MIDDLE, SPARK_ARM * 2 + 1, 1, edge);
  grid.fillRect(SPARK_MIDDLE - 1, SPARK_MIDDLE - 1, 3, 3, edge);
  grid.plot(SPARK_MIDDLE, SPARK_MIDDLE, core);
  return grid.toPixelMap();
}

/** The spark a full-health swing throws. Its two frames swap colours, so it twinkles as it flies. */
export const SPARK_SHEET = {
  key: 'spark',
  palette: { w: ART_COLORS.sparkWhite, c: ART_COLORS.sparkBlue },
  frames: { white: spark('w', 'c'), blue: spark('c', 'w') },
} as const satisfies SpriteSheetDefinition;

export const SPARK_ANIMATIONS = {
  fly: { key: 'spark-fly', frames: ['white', 'blue'], frameRate: 20, repeat: -1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

const FULL_HEART: PixelMap = [
  '.kk.kk..',
  'kHhkhhk.',
  'khhhhhk.',
  'khhhhhk.',
  '.khhhk..',
  '..khk...',
  '...k....',
  '........',
];
/** Columns from here on are the heart's right half. */
const HEART_RIGHT_HALF = 4;

/** The heart with its red swapped for the empty colour, in the columns `emptied` says. */
function emptied(isEmpty: (column: number) => boolean): PixelMap {
  return FULL_HEART.map((row) =>
    [...row].map((symbol, column) => (isEmpty(column) && (symbol === 'h' || symbol === 'H') ? 'e' : symbol)).join(''),
  );
}

/** The hearts in the HUD: full, half (the left half) and empty. */
export const HEART_SHEET = {
  key: 'hearts',
  palette: { k: ART_COLORS.outline, h: ART_COLORS.heart, H: ART_COLORS.heartLight, e: ART_COLORS.heartEmpty },
  frames: {
    full: FULL_HEART,
    half: emptied((column) => column >= HEART_RIGHT_HALF),
    empty: emptied(() => true),
  },
} as const satisfies SpriteSheetDefinition;
