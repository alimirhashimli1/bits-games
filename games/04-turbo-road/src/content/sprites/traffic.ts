import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

/**
 * Traffic seen from behind, drawn at the same pixel size as the Comet. Each shape is painted in
 * several colours by swapping its palette.
 */

export const SALOON: PixelMap = [
  '..........kkkkkkkkkkkkkkkkkkkk..........',
  '.........kwwwwwwwwwwwwwwwwwwwwk.........',
  '........kwwwwwwwwwwwwwwwwwwwwwwk........',
  '.......kwwwwwwwwwwwwwwwwwwwwwwwwk.......',
  '.....kkbbbbbbbbbbbbbbbbbbbbbbbbbbkk.....',
  '...kkbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbkk...',
  '.kkbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbkk.',
  'kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk',
  'kbllllllbbbbbbbbbbbbbbbbbbbbbbbbllllllbk',
  'kbllllllbbbbbbbbbbbbbbbbbbbbbbbbllllllbk',
  'kBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBk',
  'kggggggggggggggppppppppppggggggggggggggk',
  'kBBBBBBBBBBBBBBppppppppppBBBBBBBBBBBBBBk',
  '.kkkkkkkBBBBBBBBBBBBBBBBBBBBBBBBkkkkkkk.',
  '.kkkkkkk........................kkkkkkk.',
  '.kkkkkkk........................kkkkkkk.',
  '..kkkkk..........................kkkkk..',
];

export const TRUCK: PixelMap = [
  '.kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kSSSSSSSSSSSSSSSSSSSSSSSkkSSSSSSSSSSSSSSSSSSSSSSSk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kSSSSSSSSSSSSSSSSSSSSSSSkkSSSSSSSSSSSSSSSSSSSSSSSk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kSSSSSSSSSSSSSSSSSSSSSSSkkSSSSSSSSSSSSSSSSSSSSSSSk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kSSSSSSSSSSSSSSSSSSSSSSSkkSSSSSSSSSSSSSSSSSSSSSSSk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.kssssssssssssssssssssssskksssssssssssssssssssssssk.',
  '.khhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhk.',
  '.kllllhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhllllk.',
  '.kllllhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhllllk.',
  '.kggggggggggggggggggggggggggggggggggggggggggggggggk.',
  '...kkkkkkkkkk..........................kkkkkkkkkk...',
  '...kkkkkkkkkk..........................kkkkkkkkkk...',
  '...kkkkkkkkkk..........................kkkkkkkkkk...',
  '...kkkkkkkkkk..........................kkkkkkkkkk...',
  '...kkkkkkkkkk..........................kkkkkkkkkk...',
  '....kkkkkkkk............................kkkkkkkk....',
];

/** A saloon car's colours: `b` and `B` are the paintwork, light and shaded. */
function saloonPalette(paint: string, shade: string): Palette {
  return { k: '#1b1b22', w: '#223344', b: paint, B: shade, l: '#ff3b3b', g: '#b8b8c8', p: '#f4f4f4' };
}

/** A truck's colours: `s` is the box, `S` its ribs. */
function truckPalette(box: string, rib: string): Palette {
  return { k: '#1b1b22', s: box, S: rib, h: '#4a4a58', l: '#ff3b3b', g: '#8a8aa8' };
}

export const BLUE_SALOON = saloonPalette('#3a6fd8', '#244a9a');
export const YELLOW_SALOON = saloonPalette('#f2c230', '#b08a10');
export const WHITE_SALOON = saloonPalette('#e8e8f0', '#a8a8b8');
export const WHITE_TRUCK = truckPalette('#d8d8e0', '#b0b0c0');
export const ORANGE_TRUCK = truckPalette('#e87a2a', '#b85a1a');
