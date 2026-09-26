import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

/**
 * The Comet GT from behind: a cherry-red roadster with the driver (dark hair) and a
 * passenger (fair hair), twin tail lights, a chrome bumper and a blank plate.
 */
export const COMET_STRAIGHT: PixelMap = [
  '.............bbbbb............yyyyy.............',
  '............bbbbbbb..........yyyyyyy............',
  '............bbbbbbb..........yyyyyyy............',
  '.............sssss............sssss.............',
  '......kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk......',
  '.....kddddddddddddddddddddddddddddddddddddk.....',
  '...khhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhk...',
  '..krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk..',
  '.krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk.',
  'krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrk',
  'krttttttttrrrrrrrrrrrrrrrrrrrrrrrrrrrrttttttttrk',
  'krttttttttrrrrrrrrrrrrrrrrrrrrrrrrrrrrttttttttrk',
  'kRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRk',
  'kggggggggggggggggggppppppppppggggggggggggggggggk',
  'kRRRRRRRRRRRRRRRRRRppppppppppRRRRRRRRRRRRRRRRRRk',
  '.kkkkkkkkRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRkkkkkkkk.',
  '.kkkkkkkk..............................kkkkkkkk.',
  '.kkkkkkkk..............................kkkkkkkk.',
  '..kkkkkk................................kkkkkk..',
];

/** Rows from here down are the tyres, which stay put when the body leans into a turn. */
export const COMET_TYRE_ROW = 15;

export const COMET_PALETTE: Palette = {
  k: '#1b1b22',
  r: '#d8242c',
  R: '#9a1420',
  h: '#ff6a5a',
  t: '#ffb020',
  g: '#b8b8c8',
  p: '#f4f4f4',
  d: '#3a1a22',
  b: '#4a2c1a',
  y: '#f2c84b',
  s: '#e8a878',
};
