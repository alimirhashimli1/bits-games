import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

/** A burning fire, 12×16 pixels, in three flickering shapes. */
export const FIRE_SHEET: SpriteSheetDefinition = {
  key: 'fire',
  palette: {
    r: ART_COLORS.flameRed,
    o: ART_COLORS.flameOrange,
    y: ART_COLORS.flameYellow,
    l: ART_COLORS.flameCore,
  },
  frames: {
    flameA: [
      '.....r......',
      '....rrr.....',
      '...rroor....',
      '...roooy....',
      '..rrooyyr...',
      '..rooyylr...',
      '.rrooyllyr..',
      '.rooyyllyr..',
      '.rooyyllyr..',
      '.rroooyyor..',
      '..rroooorr..',
      '..rrroorrr..',
      '...rrrrrr...',
      '....rrrr....',
      '.....rr.....',
      '............',
    ],
    flameB: [
      '......r.....',
      '.....rrr....',
      '....rroor...',
      '....rooyr...',
      '...rooyyor..',
      '..rrooyylr..',
      '..rooyllyr..',
      '.rrooyllyr..',
      '.rooyyllyor.',
      '.rroooyyor..',
      '..rroooorr..',
      '..rrroorrr..',
      '...rrrrrr...',
      '....rrrr....',
      '.....rr.....',
      '............',
    ],
    flameC: [
      '....rr......',
      '...rroor....',
      '...rooyr....',
      '..rrooyyr...',
      '..rooyylr...',
      '.rooyyllyr..',
      '.rooyyllyr..',
      '.rrooyyllr..',
      '.rroooyyor..',
      '..rroooorr..',
      '..rrroorrr..',
      '...rrrrrrr..',
      '...rrrrrr...',
      '....rrrr....',
      '.....rr.....',
      '............',
    ],
  },
};

export const FIRE_ANIMATIONS = {
  burn: {
    key: 'fire-burn',
    frames: ['flameA', 'flameB', 'flameC', 'flameB'],
    frameRate: 10,
    repeat: -1,
  },
} as const satisfies Record<string, PixelAnimationDefinition>;
