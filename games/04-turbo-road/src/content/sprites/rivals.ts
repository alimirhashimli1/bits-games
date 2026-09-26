import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

/**
 * A rival's sports coupé from behind: a rear wing on two struts, a helmeted driver through the
 * back window, wide tail lights and a blank plate. Each rival paints it in their own colours.
 */
export const COUPE: PixelMap = [
  '..SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS..',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '....kk...........kkkkkkkkkkkk...........kk....',
  '....kk..........kwwwwweewwwwwk..........kk....',
  '....kk.........kwwwwweeeewwwwwk.........kk....',
  '..kbbbbbbbbbbbbkwwwwweeeewwwwwkbbbbbbbbbbbbk..',
  '.kbbbbbbbbbbbbbbkkkkkkkkkkkkkkbbbbbbbbbbbbbbk.',
  'kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk',
  'khhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhk',
  'kblllllllbbbbbbbbbbbbbbbbbbbbbbbbbbbblllllllbk',
  'kblllllllbbbbbbbbbbbbbbbbbbbbbbbbbbbblllllllbk',
  'kBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBk',
  'kgggggggggggggggggppppppppppgggggggggggggggggk',
  'kBBBBBBBBBBBBBBBBBppppppppppBBBBBBBBBBBBBBBBBk',
  '.kkkkkkkkBBBBBBBBBBBBBBBBBBBBBBBBBBBBkkkkkkkk.',
  '.kkkkkkkk............................kkkkkkkk.',
  '.kkkkkkkk............................kkkkkkkk.',
  '..kkkkkk..............................kkkkkk..',
];

/** Rows from here down are the tyres, which stay put when the body leans into a lane change. */
export const COUPE_TYRE_ROW = 14;

/** A coupé's colours: `b`, `B` and `h` are the paintwork, `S` the wing and `e` the driver's helmet. */
export function coupePalette(colors: {
  readonly paint: string;
  readonly shade: string;
  readonly shine: string;
  readonly wing: string;
  readonly helmet: string;
}): Palette {
  return {
    k: '#1b1b22',
    w: '#223344',
    b: colors.paint,
    B: colors.shade,
    h: colors.shine,
    S: colors.wing,
    e: colors.helmet,
    l: '#ff3b3b',
    g: '#b8b8c8',
    p: '#f4f4f4',
  };
}
