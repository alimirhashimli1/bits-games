import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

import {
  CABIN,
  CABIN_PALETTE,
  CACTUS,
  CACTUS_PALETTE,
  CLIFF,
  CLIFF_PALETTE,
  PINE,
  PINE_PALETTE,
} from './sceneryWild';
import {
  BOLLARD,
  BOLLARD_PALETTE,
  CRATES,
  CRATES_PALETTE,
  LAMP,
  LAMP_PALETTE,
  NEON_LAMP_PALETTE,
  NEON_SIGN,
  NEON_SIGN_PALETTE,
  TOWER,
  TOWER_PALETTE,
  WAREHOUSE,
  WAREHOUSE_PALETTE,
} from './sceneryTown';

/** Everything that can stand beside the road. */
export type SceneryKind =
  | 'palm'
  | 'rock'
  | 'bush'
  | 'hut'
  | 'signLeft'
  | 'signRight'
  | 'scrub'
  | 'redRock'
  | 'cliff'
  | 'cactus'
  | 'pine'
  | 'cabin'
  | 'lamp'
  | 'neonLamp'
  | 'bollard'
  | 'crates'
  | 'warehouse'
  | 'tower'
  | 'neonSign'
  | 'hedge'
  | 'forkSign';

/** One kind of scenery: its picture, and the colours it is drawn in. */
export interface ScenerySprite {
  readonly map: PixelMap;
  readonly palette: Palette;
  /**
   * Width of the solid part in the middle of the sprite, in its own pixels. A palm is solid only
   * at the trunk, so its crown can overhang the car. 0 means the car drives straight through.
   */
  readonly hitWidth: number;
  /** Drawn mirrored, for things that come in a left-hand and a right-hand version. */
  readonly mirrored?: boolean;
}

const PALM: PixelMap = [
  '...........gg.............',
  '......gggg.gggg..gggg.....',
  '...gggggggggggggggggggg...',
  '.gggggGGGggggggGGGgggggg..',
  'ggggGG...GgggggG...GGgggg.',
  'gGG.....GggcccgG......GGgg',
  'g......Gg.cc.ccgG......Gg.',
  '.......g..ctTtc..g......g.',
  '......g....tTt....g.......',
  '...........tTt............',
  '...........TtT............',
  '...........tTt............',
  '...........tTt............',
  '...........tTt............',
  '............TtT...........',
  '............tTt...........',
  '............tTt...........',
  '............tTt...........',
  '............TtT...........',
  '............tTt...........',
  '............tTt...........',
  '.............tTt..........',
  '.............TtT..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............TtT..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............TtT..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............TtT..........',
  '.............tTt..........',
  '.............tTt..........',
  '.............tTt..........',
  '............TtT...........',
  '............tTt...........',
  '............tTt...........',
  '............tTt...........',
  '............TtT...........',
  '............tTt...........',
  '..........ttTTtt..........',
];

const ROCK: PixelMap = [
  '......rrrrr.........',
  '....rrLLrrrrr.......',
  '...rrLLLrrrrrrr.....',
  '..rrLLrrrrrrrrrrr...',
  '.rrrrrrrrrrrrrrrrr..',
  '.rrrrrrrrrrrrrrrrrr.',
  'rrrrrrrrrrrrrrrrrrrr',
  'dddddddddddddddddddd',
];

const BUSH: PixelMap = [
  '.....gggg.......',
  '...ggggGggg.....',
  '..gggGgggggg....',
  '.ggGggggggGggg..',
  'gggggggGgggggggg',
  'GGGGGGGGGGGGGGGG',
];

const SIGN_RIGHT: PixelMap = [
  'kkkkkkkkkkkkkkkkkkkk',
  'kyyyyyyyyyyyyyyyyyyk',
  'kyykkyyyykkyyyykkyyk',
  'kyyykkyyyykkyyyykkyk',
  'kyyyykkyyyykkyyyykkk',
  'kyyyyykkyyyykkyyyykk',
  'kyyyyykkyyyykkyyyykk',
  'kyyyykkyyyykkyyyykkk',
  'kyyykkyyyykkyyyykkyk',
  'kyykkyyyykkyyyykkyyk',
  'kyyyyyyyyyyyyyyyyyyk',
  'kkkkkkkkkkkkkkkkkkkk',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
  '....pp........pp....',
];

const HUT: PixelMap = [
  '...............RR...............',
  '.............RRRRRR.............',
  '...........RRRRRRRRRR...........',
  '.........RRRRRRRRRRRRRR.........',
  '.......RRRRRRRRRRRRRRRRRR.......',
  '.....RRRRRRRRRRRRRRRRRRRRRR.....',
  '...RRRRRRRRRRRRRRRRRRRRRRRRRR...',
  '.RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR.',
  'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
  '..wwwwwwwwwwwwwwwwwwwwwwwwwwww..',
  '..wwwwwwwwwwwwwwwwwwwwwwwwwwww..',
  '..wwbbbbbbwwwwwwwwwwwwbbbbbbww..',
  '..wwbccccbwwwwwwwwwwwwbccccbww..',
  '..wwbccccbwwwwddddwwwwbccccbww..',
  '..wwbccccbwwwwddddwwwwbccccbww..',
  '..wwbbbbbbwwwwddddwwwwbbbbbbww..',
  '..wwwwwwwwwwwwddddwwwwwwwwwwww..',
  '..wwwwwwwwwwwwddddwwwwwwwwwwww..',
  '..wwwwwwwwwwwwdddkwwwwwwwwwwww..',
  '..wwwwwwwwwwwwddddwwwwwwwwwwww..',
  '..wwwwwwwwwwwwddddwwwwwwwwwwww..',
  '..ssssssssssssssssssssssssssss..',
];

/** Stands in the median where the road forks, an arrow pointing down each branch. */
const FORK_SIGN: PixelMap = [
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kgggggggggggggggkkgggggggggggggggk',
  'kgggggggggggggggkkgggggggggggggggk',
  'kgggggggggggggggkkgggggggggggggggk',
  'kggggggwggggggggkkggggggggwggggggk',
  'kgggggwwggggggggkkggggggggwwgggggk',
  'kggggwwwwwwwwwggkkggwwwwwwwwwggggk',
  'kgggwwwwwwwwwwggkkggwwwwwwwwwwgggk',
  'kggggwwwwwwwwwggkkggwwwwwwwwwggggk',
  'kgggggwwggggggggkkggggggggwwgggggk',
  'kggggggwggggggggkkggggggggwggggggk',
  'kgggggggggggggggkkgggggggggggggggk',
  'kgggggggggggggggkkgggggggggggggggk',
  'kgggggggggggggggkkgggggggggggggggk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
  '......pp..................pp......',
];

const PALM_PALETTE: Palette = { g: '#2e9a3e', G: '#1f6e2c', c: '#5a3a1a', t: '#b07a40', T: '#7a4e28' };
const ROCK_PALETTE: Palette = { r: '#9a8a7a', L: '#c8b8a8', d: '#6a5a4a' };
const BUSH_PALETTE: Palette = { g: '#2f8a3c', G: '#1f6a2c' };
/** Bushes and rocks recoloured for other stages: dry scrub, red desert rock, a hedge at night. */
const SCRUB_PALETTE: Palette = { g: '#9a9a4a', G: '#6e6e32' };
const RED_ROCK_PALETTE: Palette = { r: '#c05a3a', L: '#e08a5a', d: '#7a3422' };
const HEDGE_PALETTE: Palette = { g: '#1f4a3a', G: '#143228' };
const SIGN_PALETTE: Palette = { k: '#1b1b22', y: '#ffd23f', p: '#8a8aa8' };
const FORK_SIGN_PALETTE: Palette = { k: '#1b1b22', g: '#1e7a3e', w: '#f4f4f4', p: '#8a8aa8' };
const HUT_PALETTE: Palette = {
  R: '#d8342c',
  r: '#9a1420',
  w: '#f4ecd8',
  b: '#6e4a26',
  c: '#72c4f4',
  d: '#3a8fe0',
  k: '#ffd23f',
  s: '#c8b890',
};

/**
 * A curve sign points the way the road turns: `signRight` warns of a bend to the right.
 * The fork sign stands in the middle, at offset 0, and is the only scenery drawn centred on
 * its spot. Bushes, scrub and hedges are soft: the car ploughs through them. A pine's lowest branches
 * reach the ground, so more of it is solid than of a palm.
 */
export const SCENERY_SPRITES: Readonly<Record<SceneryKind, ScenerySprite>> = {
  palm: { map: PALM, palette: PALM_PALETTE, hitWidth: 4 },
  rock: { map: ROCK, palette: ROCK_PALETTE, hitWidth: 18 },
  bush: { map: BUSH, palette: BUSH_PALETTE, hitWidth: 0 },
  hut: { map: HUT, palette: HUT_PALETTE, hitWidth: 28 },
  signRight: { map: SIGN_RIGHT, palette: SIGN_PALETTE, hitWidth: 14 },
  signLeft: { map: SIGN_RIGHT, palette: SIGN_PALETTE, hitWidth: 14, mirrored: true },
  scrub: { map: BUSH, palette: SCRUB_PALETTE, hitWidth: 0 },
  redRock: { map: ROCK, palette: RED_ROCK_PALETTE, hitWidth: 18 },
  cliff: { map: CLIFF, palette: CLIFF_PALETTE, hitWidth: 30 },
  cactus: { map: CACTUS, palette: CACTUS_PALETTE, hitWidth: 6 },
  pine: { map: PINE, palette: PINE_PALETTE, hitWidth: 14 },
  cabin: { map: CABIN, palette: CABIN_PALETTE, hitWidth: 30 },
  lamp: { map: LAMP, palette: LAMP_PALETTE, hitWidth: 2 },
  neonLamp: { map: LAMP, palette: NEON_LAMP_PALETTE, hitWidth: 2 },
  bollard: { map: BOLLARD, palette: BOLLARD_PALETTE, hitWidth: 6 },
  crates: { map: CRATES, palette: CRATES_PALETTE, hitWidth: 24 },
  warehouse: { map: WAREHOUSE, palette: WAREHOUSE_PALETTE, hitWidth: 46 },
  tower: { map: TOWER, palette: TOWER_PALETTE, hitWidth: 38 },
  neonSign: { map: NEON_SIGN, palette: NEON_SIGN_PALETTE, hitWidth: 32 },
  hedge: { map: BUSH, palette: HEDGE_PALETTE, hitWidth: 0 },
  forkSign: { map: FORK_SIGN, palette: FORK_SIGN_PALETTE, hitWidth: 34 },
};
