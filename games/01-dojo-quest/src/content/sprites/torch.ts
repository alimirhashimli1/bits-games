import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

/** Wall torch, 8×16 pixels: three flickering flame shapes on the same wooden base. */
const BASE = [
  '.kkkkkk.',
  'kWWWWWwk',
  '.kWWWwk.',
  '..kwwk..',
  '...Ww...',
  '...Ww...',
  '...Ww...',
  '...kk...',
];

export const TORCH_SHEET: SpriteSheetDefinition = {
  key: 'torch',
  palette: {
    k: ART_COLORS.outline,
    w: ART_COLORS.woodDark,
    W: ART_COLORS.wood,
    r: ART_COLORS.flameRed,
    o: ART_COLORS.flameOrange,
    y: ART_COLORS.flameYellow,
    l: ART_COLORS.flameCore,
  },
  frames: {
    flameLow: [
      '...r....',
      '...rr...',
      '..rorr..',
      '..roor..',
      '.rooyor.',
      '.royyor.',
      '.roylyr.',
      '..ryyr..',
      ...BASE,
    ],
    flameLeft: [
      '....r...',
      '...rr...',
      '..rror..',
      '..roor..',
      '.royoor.',
      '.royyor.',
      '.rylyor.',
      '..ryyr..',
      ...BASE,
    ],
    flameTall: [
      '..r..r..',
      '..rr.r..',
      '..rorr..',
      '.rooor..',
      '.rooyor.',
      '.ryyyor.',
      '.roylyr.',
      '..ryyr..',
      ...BASE,
    ],
  },
};

export const TORCH_ANIMATIONS = {
  burn: {
    key: 'torch-burn',
    frames: ['flameLow', 'flameLeft', 'flameTall', 'flameLeft'],
    frameRate: 8,
    repeat: -1,
  },
} as const satisfies Record<string, PixelAnimationDefinition>;
