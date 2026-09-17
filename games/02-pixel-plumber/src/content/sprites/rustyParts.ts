import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

/**
 * Rusty's body parts, 16 pixels wide and facing right. Frames are put together from a head,
 * a torso and legs, so a face or a boot is only ever drawn once.
 *
 * k outline · c/C cap · h beard · s skin · S shirt · o overalls · y buckle · b boots
 */

export const PART_WIDTH = 16;

export const HEADS = {
  side: [
    '....kkkkkk......',
    '...kCCCCccck....',
    '..kcccccccccckk.',
    '..khhssssksk....',
    '..khsssssssk....',
    '..khhhsssshhhk..',
    '...khhhhhhhhk...',
    '....khhhhhhk....',
  ],
  front: [
    '....kkkkkkkk....',
    '...kCCCCCCCCk...',
    '..kcccccccccck..',
    '...khsksskshk...',
    '...khsssssshk...',
    '...khhhsshhhk...',
    '....khhhhhhk....',
    '.....khhhhk.....',
  ],
} as const satisfies Record<string, PixelMap>;

/** Small Rusty torsos, 4 rows. */
export const TORSOS = {
  stand: ['...kSSooSSk.....', '..ksSoyooySsk...', '...kooooooook...', '...kooooooook...'],
  jump: ['...kSSooSSkssk..', '..kSSoyooySSk...', '...kooooooook...', '...kooooooook...'],
  skid: ['....kSSooSSk....', '....kSoyooySksk.', '....kooooooook..', '....kooooooook..'],
  armsUp: ['.ksk.kSooSk.ksk.', '.kSSkSoyyoSkSSk.', '..kkooooooookk..', '....koooooook...'],
} as const satisfies Record<string, PixelMap>;

/** Small Rusty legs, 4 rows. */
export const LEGS = {
  stand: ['...kooookoook...', '...kbbbk.kbbbk..', '..kbbbbk.kbbbbk.', '..kkkkkk.kkkkkk.'],
  stepForward: ['...kooookook....', '...kbbbkkbbbk...', '..kbbbbkkbbbbk..', '..kkkkkkkkkkkk..'],
  stride: ['..kooook.koook..', '.kbbbk....kbbbk.', 'kbbbbk....kbbbbk', 'kkkkkk....kkkkkk'],
  passing: ['....koooook.....', '....kbbbbk......', '...kbbbbbk......', '...kkkkkkk......'],
  jump: ['...kooookoook...', '..kbbbk..kbbbk..', '.kbbbbk...kbbk..', '.kkkkk.....kk...'],
  skid: ['....koooookoook.', '...kbbbk....kbbk', '..kbbbbk...kbbbk', '..kkkkkk...kkkkk'],
} as const satisfies Record<string, PixelMap>;

/** Big Rusty torsos, 12 rows: broad shoulders, arms at his sides. */
export const BIG_TORSOS = {
  stand: [
    '...kkSSSSSSkk...',
    '..kSSSoSSoSSSk..',
    '.kSSSSoSSoSSSSk.',
    '.kSSSoyooyoSSSk.',
    '.kSSkooooookSSk.',
    '.kSSkooooookSSk.',
    '.kSSkooooookSSk.',
    '.ksskooooookssk.',
    '.kkkkooooookkkk.',
    '....kooooook....',
    '....kooooook....',
    '....kooooook....',
  ],
  jump: [
    '...kkSSSSSSkk...',
    '..kSSSoSSoSSSkkk',
    '.kSSSSoSSoSSSSsk',
    '.kSSSoyooyoSSkk.',
    '.kSSkooooookk...',
    '.kSSkooooook....',
    '.kSSkooooook....',
    '.ksskooooook....',
    '.kkkkooooook....',
    '....kooooook....',
    '....kooooook....',
    '....kooooook....',
  ],
  skid: [
    '....kkSSSSSSkk..',
    '...kSSSoSSoSSSk.',
    '..kSSSSoSSoSSSSk',
    '..kSSSoyooyoSkSk',
    '..kSSkoooooksssk',
    '..kSSkoooooookkk',
    '..kSSkooooook...',
    '..ksskooooook...',
    '..kkkkooooook...',
    '.....kooooook...',
    '.....kooooook...',
    '.....kooooook...',
  ],
} as const satisfies Record<string, PixelMap>;

/** Big Rusty legs, 12 rows. */
export const BIG_LEGS = {
  stand: [
    '....kooooook....',
    '....kookkook....',
    '....kookkook....',
    '....kookkook....',
    '....kookkook....',
    '....kookkook....',
    '....kookkook....',
    '...kbbbkkbbbk...',
    '...kbbbkkbbbk...',
    '..kbbbbkkbbbbk..',
    '..kbbbbkkbbbbk..',
    '..kkkkkkkkkkkk..',
  ],
  stepForward: [
    '....kooooook....',
    '....kookkook....',
    '...kook..kook...',
    '...kook..kook...',
    '..kook....kook..',
    '..kook....kook..',
    '..kook....kook..',
    '.kbbbk...kbbbk..',
    '.kbbbk...kbbbk..',
    '.kbbbbk..kbbbbk.',
    '.kbbbbk..kbbbbk.',
    '.kkkkkk..kkkkkk.',
  ],
  stride: [
    '....kooooook....',
    '...koookkoook...',
    '...kook..kook...',
    '..kook....kook..',
    '..kook....kook..',
    '.kook......kook.',
    '.kook......kook.',
    'kbbbk......kbbbk',
    'kbbbk......kbbbk',
    'kbbbbk....kbbbbk',
    'kbbbbk....kbbbbk',
    'kkkkkk....kkkkkk',
  ],
  passing: [
    '....kooooook....',
    '....kookkook....',
    '....kookkook....',
    '....kook.kook...',
    '....kook.kbbbk..',
    '....kook.kbbbk..',
    '....kook.kkkkk..',
    '...kbbbk........',
    '...kbbbk........',
    '...kbbbbk.......',
    '...kbbbbk.......',
    '...kkkkkk.......',
  ],
  jump: [
    '....kooooook....',
    '....kookkoookk..',
    '...kook..kooook.',
    '...kook...kbbbbk',
    '..kook....kbbbbk',
    '..kook....kkkkkk',
    '.kook...........',
    '.kbbbk..........',
    'kbbbbk..........',
    'kkkkkk..........',
    '................',
    '................',
  ],
  skid: [
    '.....kooooook...',
    '.....kookkook...',
    '....kook..kook..',
    '....kook...kook.',
    '...kook....kook.',
    '...kook.....kook',
    '...kook.....kook',
    '..kbbbk....kbbbk',
    '..kbbbk....kbbbk',
    '.kbbbbk...kbbbbk',
    '.kbbbbk...kbbbbk',
    '.kkkkkk...kkkkkk',
  ],
} as const satisfies Record<string, PixelMap>;

/** Big Rusty ducking: the shoulders of his torso over a wide crouch. */
export const BIG_CROUCH: PixelMap = [
  '.ksskooooookssk.',
  '.kbbbbkookbbbbk.',
  'kbbbbbkookbbbbbk',
  'kkkkkkkkkkkkkkkk',
];

/** How many times each of the 4 rows is repeated to make a taller part. */
export type RowStretch = readonly [number, number, number, number];

/** The in-between size shown while growing and shrinking: small parts stretched to 8 rows each. */
export const MID_STRETCH = { torso: [2, 2, 2, 2], legs: [3, 2, 2, 1] } as const satisfies Record<string, RowStretch>;

/** Repeats each row of a 4-row part, e.g. `[2, 1, 1, 1]` doubles the first row. */
export function stretchRows(part: PixelMap, stretch: RowStretch): PixelMap {
  return part.flatMap((row, index) => new Array<string>(stretch[index] ?? 1).fill(row));
}

/** Stacks parts from the top down, then pins the result to the bottom of a `height`-row frame. */
export function stackParts(height: number, parts: readonly PixelMap[]): PixelMap {
  const grid = new PixelGrid(PART_WIDTH, height);
  const totalHeight = parts.reduce((sum, part) => sum + part.length, 0);
  let top = height - totalHeight;
  for (const part of parts) {
    grid.stamp(part, 0, top);
    top += part.length;
  }
  return grid.toPixelMap();
}
