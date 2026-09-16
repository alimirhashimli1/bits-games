import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

export const PIP_FRAME = { full: 'full', empty: 'empty' } as const;

/** Width of one pip in pixels. */
export const PIP_WIDTH = 5;

/** Health pips (Karateka-style triangles), drawn white so each health bar can tint them. */
export const HEALTH_PIP_SHEET: SpriteSheetDefinition = {
  key: 'health-pip',
  palette: { '#': '#ffffff' },
  frames: {
    [PIP_FRAME.full]: ['..#..', '.###.', '.###.', '#####', '#####'],
    [PIP_FRAME.empty]: ['..#..', '.#.#.', '.#.#.', '#...#', '#####'],
  },
};
