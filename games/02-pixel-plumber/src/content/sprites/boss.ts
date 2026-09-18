import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';
import { outlined } from './shapes';

/**
 * The Sludge Baron, his sludge and the pressure-release lever behind him.
 *
 * k outline · L/l/d sludge · H/h hat · Q/q brass · w white · R/r red knob · S/s/D iron
 */

const BARON_SIZE = 32;
const BARON_MIDDLE = (BARON_SIZE - 1) / 2;
/** Where the top of his body is when he stands up straight, and how wide it spreads at the base. */
const BODY_TOP = 12;
const BODY_HALF_WIDTH = 13;
/** How fast his sides spread going down from the top of the body. */
const BODY_SPREAD = 1.3;

/**
 * A mound of living sludge in a battered top hat, a brass monocle over his front eye, facing
 * right. `sag` pushes everything above his base down, so two frames make him wobble. With
 * `throwing` his front arm is raised over his head with a blob of sludge in it.
 */
function baron(sag: number, throwing: boolean): PixelMap {
  const grid = new PixelGrid(BARON_SIZE, BARON_SIZE);
  const top = BODY_TOP + sag;

  // The body: lit from the top left, shaded low down and on the right.
  for (let y = top; y < BARON_SIZE; y++) {
    const halfWidth = Math.min(BODY_HALF_WIDTH, 5 + (y - top) * BODY_SPREAD);
    for (let x = 0; x < BARON_SIZE; x++) {
      const across = x - BARON_MIDDLE;
      if (Math.abs(across) > halfWidth) continue;
      const lit = y < top + 4 && across < 0;
      const low = y > BARON_SIZE - 5 || across > halfWidth - 3;
      grid.plot(x, y, lit ? 'L' : low ? 'd' : 'l');
    }
  }
  // Drips running down his sides and lumps along his base.
  for (const [x, length] of [[6, 4], [24, 5], [11, 2], [20, 3]] as const) {
    grid.fillRect(x, top + 7, 1, length, 'd');
  }
  for (const x of [3, 9, 16, 23, 28]) grid.fillRect(x, BARON_SIZE - 2, 2, 1, 'l');

  // The hat: brim, crown, a brass band and a dent in the crown.
  grid.fillRect(8, top - 2, 16, 2, 'h');
  grid.fillRect(10, top - 11, 12, 9, 'h');
  grid.fillRect(11, top - 10, 1, 7, 'H');
  grid.fillRect(10, top - 4, 12, 2, 'q');
  grid.fillRect(10, top - 4, 12, 1, 'Q');
  grid.fillRect(17, top - 11, 3, 1, 'k');

  // A plain back eye, a monocled front eye, and a wide scowl with a few teeth.
  grid.fillRect(10, top + 3, 3, 3, 'w');
  grid.plot(12, top + 4, 'k');
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const distance = Math.hypot(dx, dy);
      if (distance > 2.5 && distance <= 3.4) grid.plot(20 + dx, top + 4 + dy, 'Q');
    }
  }
  grid.fillRect(19, top + 3, 3, 3, 'w');
  grid.plot(21, top + 4, 'k');
  grid.line([23, top + 7], [26, top + 12], 1, 'q');
  grid.fillRect(11, top + 9, 12, 2, 'k');
  grid.fillRect(13, top + 9, 2, 1, 'w');
  grid.fillRect(19, top + 9, 2, 1, 'w');

  // Stubby arms: the back one hangs, the front one hangs or is raised to throw.
  grid.fillRect(1, top + 10, 3, 4, 'l');
  grid.fillRect(1, top + 13, 3, 1, 'd');
  if (throwing) {
    grid.fillRect(27, top - 4, 3, 10, 'l');
    grid.fillRect(29, top - 4, 1, 10, 'd');
    grid.fillRect(26, top - 9, 5, 5, 'L');
    grid.fillRect(28, top - 7, 3, 3, 'd');
  } else {
    grid.fillRect(28, top + 10, 3, 4, 'l');
    grid.fillRect(28, top + 13, 3, 1, 'd');
  }
  return outlined(grid.toPixelMap());
}

const BARON_PALETTE = {
  k: ART_COLORS.outline,
  L: ART_COLORS.sludgeLight,
  l: ART_COLORS.sludge,
  d: ART_COLORS.sludgeShade,
  H: ART_COLORS.hatLight,
  h: ART_COLORS.hat,
  Q: ART_COLORS.brassLight,
  q: ART_COLORS.brass,
  w: ART_COLORS.cloud,
} as const;

/** The Sludge Baron, 32×32, standing on the bottom of his frame and facing right. */
export const BARON_SHEET = {
  key: 'sludge-baron',
  palette: BARON_PALETTE,
  frames: {
    stand1: baron(0, false),
    stand2: baron(1, false),
    throw: baron(0, true),
  },
} as const satisfies SpriteSheetDefinition;

export const BARON_ANIMATIONS = {
  stand: { key: 'sludge-baron-stand', frames: ['stand1', 'stand2'], frameRate: 4, repeat: -1 },
  throw: { key: 'sludge-baron-throw', frames: ['throw'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

/** A blob of sludge in flight, 8×8, and what it leaves when it lands. */
export const SLUDGE_SHEET = {
  key: 'sludge-blob',
  palette: BARON_PALETTE,
  frames: {
    blob1: ['..kkkk..', '.kLLLLk.', 'kLwLLLlk', 'kLLLLllk', 'kLLllldk', 'kllllddk', '.kdddkk.', '..kkk...'],
    blob2: ['...kkk..', '..kLLLk.', '.kLwLLk.', 'kLLLLllk', 'kLLllldk', 'klllddk.', '.kdddk..', '..kkk...'],
    splat: ['........', '........', '........', '........', '.k....k.', 'kLk..kLk', 'kllkklld', 'kkkkkkkk'],
  },
} as const satisfies SpriteSheetDefinition;

export const SLUDGE_ANIMATIONS = {
  fly: { key: 'sludge-blob-fly', frames: ['blob1', 'blob2'], frameRate: 8, repeat: -1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

const LEVER_WIDTH = 16;
const LEVER_HEIGHT = 32;
/** The top of the housing, and where the handle pivots on it. */
const HOUSING_TOP = 20;
const PIVOT: readonly [number, number] = [8, HOUSING_TOP];

/**
 * The pressure-release lever: an iron housing with a gauge, and a handle that stands up to the
 * left until it is pulled over to the right.
 */
function lever(pulled: boolean): PixelMap {
  const grid = new PixelGrid(LEVER_WIDTH, LEVER_HEIGHT);
  const knob: readonly [number, number] = pulled ? [13, 8] : [3, 8];
  grid.line(PIVOT, knob, 2, 's');
  grid.fillRect(knob[0] - 2, knob[1] - 2, 4, 4, 'r');
  grid.fillRect(knob[0] - 2, knob[1] - 2, 2, 1, 'R');

  grid.fillRect(1, HOUSING_TOP, LEVER_WIDTH - 2, LEVER_HEIGHT - HOUSING_TOP, 's');
  grid.fillRect(1, HOUSING_TOP, LEVER_WIDTH - 2, 1, 'S');
  grid.fillRect(1, LEVER_HEIGHT - 2, LEVER_WIDTH - 2, 2, 'D');
  grid.fillRect(PIVOT[0] - 1, PIVOT[1] - 1, 3, 3, 'q');
  // The gauge: its needle is in the red until the pressure is let out.
  grid.fillRect(5, 23, 6, 5, 'w');
  grid.line([8, 27], pulled ? [5, 25] : [10, 24], 1, pulled ? 'k' : 'r');
  return outlined(grid.toPixelMap());
}

/** The lever at the back of the Baron's hall, 16×32, standing on the bottom of its frame. */
export const LEVER_SHEET = {
  key: 'pressure-lever',
  palette: {
    k: ART_COLORS.outline,
    S: ART_COLORS.rivetLight,
    s: ART_COLORS.rivet,
    D: ART_COLORS.rivetShade,
    R: ART_COLORS.valveLight,
    r: ART_COLORS.valve,
    q: ART_COLORS.brass,
    w: ART_COLORS.cloud,
  },
  frames: {
    up: lever(false),
    pulled: lever(true),
  },
} as const satisfies SpriteSheetDefinition;

/** In the level the lever is set to one frame or the other; the gallery shows it being pulled. */
export const LEVER_ANIMATIONS = {
  pull: { key: 'pressure-lever-pull', frames: ['up', 'pulled'], frameRate: 2 },
} as const satisfies Record<string, PixelAnimationDefinition>;
