import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { LEVEL } from '../../config';
import { ART_COLORS } from '../palette';
import { outlined, radial } from './shapes';

/**
 * Brasswick's pests, 16 pixels wide and facing right, standing on the bottom of their frame.
 *
 * k outline · L/l/d gloop · S/s/D shell · b beetle · w white · Q/q brass · F/f/e flame
 */
const SIZE = LEVEL.tileSize;

/** A slime blob out of the clogged mains. Its base spreads as it waddles. */
const GLOOP_WALK: readonly [PixelMap, PixelMap] = [
  [
    '................',
    '................',
    '.....kkkkkk.....',
    '...kkLLLLLLkk...',
    '..kLLLLLLLLLLk..',
    '.kLLLLLLLLLLLLk.',
    '.kLwwLLLLLLwwLk.',
    '.kLwkLLLLLLwkLk.',
    '.kLLLLLLLLLLLLk.',
    '.kLLLLkkkkLLLLk.',
    '.kLLLLLLLLLLLLk.',
    '.kllllllllllllk.',
    '.kllllllllllllk.',
    '.kddllllllllddk.',
    '.kddddddddddddk.',
    '..kkkkkkkkkkkk..',
  ],
  [
    '................',
    '................',
    '................',
    '.....kkkkkk.....',
    '...kkLLLLLLkk...',
    '..kLLLLLLLLLLk..',
    '..kLwwLLLLwwLk..',
    '..kLwkLLLLwkLk..',
    '.kLLLLLLLLLLLLk.',
    '.kLLLLkkkkLLLLk.',
    '.kLLLLLLLLLLLLk.',
    '.kllllllllllllk.',
    'kllllllllllllllk',
    'kddllllllllllddk',
    'kddddddddddddddk',
    '.kkkkkkkkkkkkkk.',
  ],
];

/** What is left of a stomped Gloop: a puddle. */
const GLOOP_FLAT: PixelMap = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '...kkkkkkkkkk...',
  '.kLLllllllllLLk.',
  '.kddddddddddddk.',
];

/** A beetle in a copper shell. Its head and one eye poke out to the right. */
const SHELLBUG_BODY: PixelMap = [
  '................',
  '................',
  '................',
  '................',
  '.....kkkkk......',
  '...kkSSSSSkk....',
  '..kSSSSSSSSSk...',
  '..kSSsSSSsSSk...',
  '.kSSSSSSSSSSSk..',
  '.ksssssssssssk..',
  '.kssssssssssskk.',
  '.kssssssssssskbk',
  '.kDsssssssssDkbw',
  '.kkDDDDDDDDDkkbk',
  '................',
  '................',
];

/** The beetle's legs, in two walking positions. */
const SHELLBUG_LEGS: readonly [PixelMap, PixelMap] = [
  ['.kbbk.....kbbk..', '.kkk.......kkk..'],
  ['..kbbk...kbbk...', '..kkk.....kkk...'],
];

/** An empty shell, sitting on the ground. */
const SHELL: PixelMap = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '.....kkkkkk.....',
  '...kkSSSSSSkk...',
  '..kSSSSSSSSSSk..',
  '.kSSsSSSSSSsSSk.',
  '.kSSSSSSSSSSSSk.',
  'kssssssssssssssk',
  'kDssssssssssssDk',
  'kkDDDDDDDDDDDDkk',
  '.kkkkkkkkkkkkkk.',
];

/** The same shell with its markings moved along, so the two frames read as spinning. */
const SHELL_SPINNING: PixelMap = SHELL.map((row, index) =>
  index === 10 ? '.kSSSSSsSSSSsSk.' : index === 11 ? '.kSsSSSSSSSSSSk.' : row,
);

/** A Flutterbug's wings, raised and lowered. They are drawn behind the beetle. */
const WINGS: readonly [PixelMap, PixelMap] = [
  ['..kk........kk..', '.kwwk......kwwk.', '.kwwk......kwwk.', '..kwk......kwk..', '...k........k...'],
  ['................', '..kk........kk..', '.kww........wwk.', 'kwwk........kwwk', 'kwk..........kwk'],
];

/** The beetle with one of its two leg positions. */
function shellbug(step: 0 | 1): PixelMap {
  const grid = new PixelGrid(SIZE, SIZE);
  grid.stamp(SHELLBUG_BODY, 0, 0);
  grid.stamp(SHELLBUG_LEGS[step], 0, SIZE - SHELLBUG_LEGS[step].length);
  return grid.toPixelMap();
}

/** The same beetle with a pair of wings behind it. */
function flutterbug(step: 0 | 1): PixelMap {
  const grid = new PixelGrid(SIZE, SIZE);
  grid.stamp(WINGS[step], 0, 0);
  grid.stamp(shellbug(step), 0, 0);
  return grid.toPixelMap();
}

const SPARK = { corePoints: 5, coreRadius: 2.2, radius: 5.2, flicker: 0.8, edge: 1.6 } as const;

/** A flame on the end of a chain. `turn` moves its flickering edge round. */
function spark(turn: number): PixelMap {
  return outlined(
    radial((distance, angle) => {
      const flicker = SPARK.flicker * Math.cos(SPARK.corePoints * angle + turn * Math.PI);
      if (distance > SPARK.radius + flicker) return undefined;
      if (distance <= SPARK.coreRadius) return 'F';
      return distance > SPARK.radius - SPARK.edge + flicker ? 'e' : 'f';
    }),
  );
}

const CHAIN_LINK = { innerRadius: 0.9, outerRadius: 2.2 } as const;

/** One link of the chain a Spark swings on. */
function chainLink(): PixelMap {
  return radial((distance) =>
    distance <= CHAIN_LINK.innerRadius || distance > CHAIN_LINK.outerRadius ? undefined : distance > 1.6 ? 'q' : 'Q',
  );
}

/** Gloop, Shellbug, Flutterbug and Spark, 16×16. */
export const ENEMY_SHEET = {
  key: 'enemies',
  palette: {
    k: ART_COLORS.outline,
    L: ART_COLORS.gloopLight,
    l: ART_COLORS.gloop,
    d: ART_COLORS.gloopShade,
    S: ART_COLORS.shellLight,
    s: ART_COLORS.shell,
    D: ART_COLORS.shellShade,
    b: ART_COLORS.bugBody,
    w: ART_COLORS.steamLight,
    Q: ART_COLORS.brassLight,
    q: ART_COLORS.brass,
    F: ART_COLORS.flameLight,
    f: ART_COLORS.flame,
    e: ART_COLORS.flameShade,
  },
  frames: {
    gloop1: GLOOP_WALK[0],
    gloop2: GLOOP_WALK[1],
    gloopFlat: GLOOP_FLAT,
    shellbug1: shellbug(0),
    shellbug2: shellbug(1),
    shell: SHELL,
    shellSpinning: SHELL_SPINNING,
    flutterbug1: flutterbug(0),
    flutterbug2: flutterbug(1),
    spark1: spark(0),
    spark2: spark(1),
    chainLink: chainLink(),
  },
} as const satisfies SpriteSheetDefinition;

export const ENEMY_ANIMATIONS = {
  gloop: { key: 'gloop-walk', frames: ['gloop1', 'gloop2'], frameRate: 5, repeat: -1 },
  gloopFlat: { key: 'gloop-flat', frames: ['gloopFlat'], frameRate: 1 },
  shellbug: { key: 'shellbug-walk', frames: ['shellbug1', 'shellbug2'], frameRate: 6, repeat: -1 },
  shell: { key: 'shellbug-shell', frames: ['shell'], frameRate: 1 },
  shellSliding: { key: 'shellbug-sliding', frames: ['shellSpinning', 'shell'], frameRate: 14, repeat: -1 },
  flutterbug: { key: 'flutterbug-fly', frames: ['flutterbug1', 'flutterbug2'], frameRate: 8, repeat: -1 },
  spark: { key: 'spark-burn', frames: ['spark1', 'spark2'], frameRate: 10, repeat: -1 },
  chainLink: { key: 'spark-chain-link', frames: ['chainLink'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

/** The Sprout is drawn in a taller frame, so it needs a sheet of its own. */
const SPROUT_HEIGHT = 24;
const SPROUT_JAW_ROW = 9;

const SPROUT_UPPER_JAW: PixelMap = [
  '....kkkkkk......',
  '..kkRRRRRRkk....',
  '.kRRRRRRRRRRk...',
  '.kRRrRRRRrRRk...',
  '.kRRRRRRRRRRk...',
  '.kwkwkwkwkwkk...',
];

const SPROUT_LOWER_JAW: PixelMap = [
  '.kkwkwkwkwkwk...',
  '.kRRRRRRRRRRk...',
  '.kRRrRRRRrRRk...',
  '.kRRRRRRRRRRk...',
  '..kkRRRRRRkk....',
  '....kkkkkk......',
];

const SPROUT_STEM: PixelMap = [
  '.....kggk.......',
  '.....kggk.......',
  '....kkggkk......',
  '....kGggGk......',
  '.....kggk.......',
  '.....kggk.......',
  '....kGggGk......',
  '.....kggk.......',
  '.....kggk.......',
];

/** A snapping plant. `gap` is how far its jaws open. */
function sprout(gap: number): PixelMap {
  const grid = new PixelGrid(SIZE, SPROUT_HEIGHT);
  grid.stamp(SPROUT_STEM, 0, SPROUT_HEIGHT - SPROUT_STEM.length);
  grid.stamp(SPROUT_LOWER_JAW, 0, SPROUT_JAW_ROW);
  grid.stamp(SPROUT_UPPER_JAW, 0, SPROUT_JAW_ROW - SPROUT_UPPER_JAW.length - gap);
  return grid.toPixelMap();
}

/** The Sprout that rises out of a pipe, 16×24. */
export const SPROUT_SHEET = {
  key: 'sprout',
  palette: {
    k: ART_COLORS.outline,
    R: ART_COLORS.valveLight,
    r: ART_COLORS.valve,
    w: ART_COLORS.steamLight,
    G: ART_COLORS.bushLight,
    g: ART_COLORS.bush,
  },
  frames: {
    closed: sprout(0),
    open: sprout(3),
  },
} as const satisfies SpriteSheetDefinition;

export const SPROUT_ANIMATIONS = {
  snap: { key: 'sprout-snap', frames: ['open', 'closed'], frameRate: 3, repeat: -1 },
} as const satisfies Record<string, PixelAnimationDefinition>;
