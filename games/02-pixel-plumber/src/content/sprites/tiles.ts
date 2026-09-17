import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { LEVEL } from '../../config';
import { ART_COLORS } from '../palette';

const SIZE = LEVEL.tileSize;
/** Pipes, clouds and bushes are drawn two tiles wide, then cut in half. */
const DOUBLE = SIZE * 2;

/** Repeats a row pattern across one tile, starting `shift` pixels into the pattern. */
function patternRow(pattern: string, shift = 0): string {
  return Array.from({ length: SIZE }, (_, x) => pattern.charAt((x + shift) % pattern.length)).join('');
}

/** Stacks courses of stones or bricks, every other course shifted half a stone, like a real wall. */
function wall(course: readonly string[], courses: number): PixelMap {
  const halfStone = (course[0]?.length ?? 0) / 2;
  return Array.from({ length: courses }, (_, index) =>
    course.map((pattern) => patternRow(pattern, index % 2 === 0 ? 0 : halfStone)),
  ).flat();
}

const STONE_MIDDLE = 'S' + 's'.repeat(5) + 'tm';

/** Cobblestone street: two courses of 8×8 stones. */
const GROUND = wall(
  ['S'.repeat(7) + 'm', STONE_MIDDLE, STONE_MIDDLE, STONE_MIDDLE, STONE_MIDDLE, STONE_MIDDLE, 't'.repeat(7) + 'm', 'm'.repeat(8)],
  2,
);

/** Brick wall: four courses of 8×4 bricks. */
const BRICK = wall(['L'.repeat(7) + 'n', 'L' + 'r'.repeat(5) + 'en', 'L' + 'e'.repeat(6) + 'n', 'n'.repeat(8)], 4);

/** A riveted block with a light top-left edge and a dark bottom-right edge, around a 12×12 middle. */
function framedBlock(middle: PixelMap, light: string, shade: string): PixelMap {
  const outline = '.' + 'k'.repeat(SIZE - 2) + '.';
  return [
    outline,
    'k' + light.repeat(SIZE - 3) + shade + 'k',
    ...middle.map((row) => 'k' + light + row + shade + 'k'),
    'k' + shade.repeat(SIZE - 2) + 'k',
    outline,
  ];
}

const QUESTION_MARK: PixelMap = [
  'kqqqqqqqqqqk',
  'qqqqkkkkqqqq',
  'qqqkkqqkkqqq',
  'qqqkkqqkkqqq',
  'qqqqqqqkkqqq',
  'qqqqqqkkqqqq',
  'qqqqqkkqqqqq',
  'qqqqqkkqqqqq',
  'qqqqqqqqqqqq',
  'qqqqqkkqqqqq',
  'qqqqqkkqqqqq',
  'kqqqqqqqqqqk',
];

/** A `?` block after it has been hit: the same shape, emptied out. */
const USED_MIDDLE: PixelMap = QUESTION_MARK.map((row, y) =>
  y === 0 || y === QUESTION_MARK.length - 1 ? row.replaceAll('q', 'u') : 'u'.repeat(row.length),
);

/** Solid stone block used for staircases. */
function stairBlock(): PixelMap {
  const grid = new PixelGrid(SIZE, SIZE);
  grid.fillRect(0, 0, SIZE, SIZE, 'j');
  grid.fillRect(0, 0, SIZE - 1, SIZE - 1, 'H');
  grid.fillRect(1, 1, SIZE - 2, SIZE - 2, 'h');
  return grid.toPixelMap();
}

/** How far the pipe body is inset from the wider lip, on each side. */
const PIPE_BODY_INSET = 2;
const PIPE_LIP_HEIGHT = 12;

/** One row across a brass pipe, lit from the left: outline, highlight, brass, then shade. */
function pipeRow(inset: number): string {
  const width = DOUBLE - inset * 2;
  return Array.from({ length: DOUBLE }, (_, x) => {
    const offset = x - inset;
    if (offset < 0 || offset >= width) return '.';
    if (offset === 0 || offset === width - 1) return 'k';
    const across = offset / width;
    if (across < 0.12) return 'p';
    if (across < 0.3) return 'P';
    return across < 0.75 ? 'p' : 'o';
  }).join('');
}

const PIPE_TOP: PixelMap = Array.from({ length: SIZE }, (_, y) => {
  if (y === 0 || y === PIPE_LIP_HEIGHT - 1) return 'k'.repeat(DOUBLE);
  return pipeRow(y < PIPE_LIP_HEIGHT ? 0 : PIPE_BODY_INSET);
});
const PIPE_BODY: PixelMap = Array.from({ length: SIZE }, () => pipeRow(PIPE_BODY_INSET));

/** The thin brass pole at the end of a level, and the cap on top of it. */
const POLE_ROW = '......kPpok.....';
const POLE: PixelMap = Array.from({ length: SIZE }, () => POLE_ROW);
const POLE_TOP: PixelMap = [
  '.....kkkkkk.....',
  '....kPPppook....',
  '....kPppoook....',
  '.....kkkkkk.....',
  ...Array.from({ length: SIZE - 4 }, () => POLE_ROW),
];

function cloud(): PixelMap {
  const grid = new PixelGrid(DOUBLE, SIZE);
  grid.fillRect(2, 8, 28, 6, 'w');
  grid.fillRect(6, 4, 10, 6, 'w');
  grid.fillRect(14, 1, 10, 9, 'w');
  grid.fillRect(22, 5, 7, 5, 'w');
  grid.fillRect(3, 13, 26, 1, 'c');
  return grid.toPixelMap();
}

function bush(): PixelMap {
  const grid = new PixelGrid(DOUBLE, SIZE);
  grid.fillRect(1, 9, 30, 7, 'g');
  grid.fillRect(4, 5, 10, 6, 'g');
  grid.fillRect(12, 2, 9, 8, 'g');
  grid.fillRect(20, 6, 9, 5, 'g');
  grid.fillRect(14, 3, 3, 2, 'G');
  grid.fillRect(6, 6, 3, 2, 'G');
  grid.fillRect(1, 15, 30, 1, 'f');
  return grid.toPixelMap();
}

/** Cuts a two-tile-wide drawing into its left and right tiles. */
function splitInHalf(map: PixelMap): readonly [PixelMap, PixelMap] {
  return [map.map((row) => row.slice(0, SIZE)), map.map((row) => row.slice(SIZE))];
}

const [PIPE_TOP_LEFT, PIPE_TOP_RIGHT] = splitInHalf(PIPE_TOP);
const [PIPE_BODY_LEFT, PIPE_BODY_RIGHT] = splitInHalf(PIPE_BODY);
const [CLOUD_LEFT, CLOUD_RIGHT] = splitInHalf(cloud());
const [BUSH_LEFT, BUSH_RIGHT] = splitInHalf(bush());

/**
 * Every level tile, 16×16. The order of the frames is the tile index in the tilemap,
 * so frames are only ever added at the end.
 */
export const TILES_SHEET = {
  key: 'tiles',
  palette: {
    k: ART_COLORS.outline,
    S: ART_COLORS.cobbleLight,
    s: ART_COLORS.cobble,
    t: ART_COLORS.cobbleShade,
    m: ART_COLORS.cobbleMortar,
    L: ART_COLORS.brickLight,
    r: ART_COLORS.brick,
    e: ART_COLORS.brickShade,
    n: ART_COLORS.brickMortar,
    Q: ART_COLORS.questionLight,
    q: ART_COLORS.question,
    D: ART_COLORS.questionShade,
    U: ART_COLORS.usedLight,
    u: ART_COLORS.used,
    V: ART_COLORS.usedShade,
    H: ART_COLORS.stairLight,
    h: ART_COLORS.stair,
    j: ART_COLORS.stairShade,
    P: ART_COLORS.brassLight,
    p: ART_COLORS.brass,
    o: ART_COLORS.brassShade,
    w: ART_COLORS.cloud,
    c: ART_COLORS.cloudShade,
    G: ART_COLORS.bushLight,
    g: ART_COLORS.bush,
    f: ART_COLORS.bushShade,
  },
  frames: {
    ground: GROUND,
    brick: BRICK,
    question: framedBlock(QUESTION_MARK, 'Q', 'D'),
    used: framedBlock(USED_MIDDLE, 'U', 'V'),
    stair: stairBlock(),
    pipeTopLeft: PIPE_TOP_LEFT,
    pipeTopRight: PIPE_TOP_RIGHT,
    pipeBodyLeft: PIPE_BODY_LEFT,
    pipeBodyRight: PIPE_BODY_RIGHT,
    cloudLeft: CLOUD_LEFT,
    cloudRight: CLOUD_RIGHT,
    bushLeft: BUSH_LEFT,
    bushRight: BUSH_RIGHT,
    poleTop: POLE_TOP,
    pole: POLE,
  },
} as const satisfies SpriteSheetDefinition;

export type TileFrame = keyof typeof TILES_SHEET.frames;
