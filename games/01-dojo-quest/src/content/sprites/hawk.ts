import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

/**
 * The fortress hawk, 16×10 pixels, facing right: a brown raptor with a pale belly,
 * a gold beak and gold talons. Three wing positions make one flap.
 */
export const HAWK_SHEET: SpriteSheetDefinition = {
  key: 'hawk',
  palette: {
    k: ART_COLORS.outline,
    b: ART_COLORS.hawkBody,
    B: ART_COLORS.hawkWing,
    w: ART_COLORS.hawkBelly,
    y: ART_COLORS.flameYellow,
  },
  frames: {
    wingsUp: [
      '.....kk..kk.....',
      '....kBk..kBk....',
      '....kBBkkBBk....',
      '.....kBBBBk.....',
      '...kbbbbbbbbkk..',
      '.kkbbbwwbbbbbyk.',
      '..kkbbbwwbbbkk..',
      '....kkbbbbkk....',
      '......ykyk......',
      '................',
    ],
    wingsOut: [
      '................',
      '................',
      '.kk..........kk.',
      'kBBk........kBBk',
      'kBBBkbbbbbbkBBBk',
      '.kkbbbwwbbbbbyk.',
      '..kkbbbwwbbbkk..',
      '....kkbbbbkk....',
      '......ykyk......',
      '................',
    ],
    wingsDown: [
      '................',
      '................',
      '................',
      '...kbbbbbbbbkk..',
      '.kkbbbwwbbbbbyk.',
      '..kkbbbwwbbbkk..',
      '...kBBbbbbBBk...',
      '..kBBk....kBBk..',
      '..kBk......kBk..',
      '..kk........kk..',
    ],
  },
};

export const HAWK_ANIMATIONS = {
  fly: {
    key: 'hawk-fly',
    frames: ['wingsUp', 'wingsOut', 'wingsDown', 'wingsOut'],
    frameRate: 10,
    repeat: -1,
  },
} as const satisfies Record<string, PixelAnimationDefinition>;
