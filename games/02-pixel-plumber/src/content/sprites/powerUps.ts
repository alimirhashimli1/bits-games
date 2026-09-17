import { PixelGrid, rotateCounterClockwise } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { LEVEL } from '../../config';
import { ART_COLORS } from '../palette';
import { outlined, OUTLINE, radial, shaded } from './shapes';

const SIZE = LEVEL.tileSize;

const GEAR_TEETH = 8;
const GEAR = { holeRadius: 2, bodyRadius: 4, toothRadius: 6.8, toothWidth: 0.45 } as const;

/** A brass gear. `turn` turns it half a tooth, so two frames make it roll. */
function gear(turn: number): PixelMap {
  return outlined(
    radial((distance, angle) => {
      if (distance <= GEAR.holeRadius) return undefined;
      const onTooth = Math.cos(GEAR_TEETH * angle + turn * Math.PI) > GEAR.toothWidth;
      if (distance > GEAR.toothRadius || (distance > GEAR.bodyRadius && !onTooth)) return undefined;
      return shaded(angle, 'Q', 'q', 'D');
    }),
  );
}

const GASKET = { innerRadius: 2.8, outerRadius: 6.5, boltRadius: 4.7, boltSize: 0.8, shineWidth: 0.08, shineDepth: 1.5 } as const;
const GASKET_BOLTS = 4;

/** A golden ring gasket with four bolt holes, and a glint at `shineAngle` that moves round it. */
function gasket(shineAngle: number): PixelMap {
  const boltAngles = Array.from({ length: GASKET_BOLTS }, (_, index) => ((index + 0.5) * 2 * Math.PI) / GASKET_BOLTS);
  return outlined(
    radial((distance, angle) => {
      if (distance <= GASKET.innerRadius || distance > GASKET.outerRadius) return undefined;
      const onBolt = boltAngles.some(
        (boltAngle) =>
          Math.hypot(
            distance * Math.cos(angle) - GASKET.boltRadius * Math.cos(boltAngle),
            distance * Math.sin(angle) - GASKET.boltRadius * Math.sin(boltAngle),
          ) < GASKET.boltSize,
      );
      if (onBolt) return OUTLINE;
      const onRim = distance > GASKET.outerRadius - GASKET.shineDepth;
      if (onRim && Math.cos(angle - shineAngle) > 1 - GASKET.shineWidth) return 'W';
      return shaded(angle, 'Q', 'q', 'D');
    }),
  );
}

const WRENCH_HANDLE = { from: [4, 11], to: [9, 6], thickness: 3 } as const;
const WRENCH_GRIP = { from: [3, 12], to: [5, 10], thickness: 3 } as const;

/** A steel wrench, lying corner to corner, with a green grip. Green means an extra life. */
function wrench(): PixelMap {
  const grid = new PixelGrid(SIZE, SIZE);
  grid.line(WRENCH_HANDLE.from, WRENCH_HANDLE.to, WRENCH_HANDLE.thickness, 'n');
  grid.line(WRENCH_GRIP.from, WRENCH_GRIP.to, WRENCH_GRIP.thickness, 'g');
  grid.stamp(['.GG', 'Gg.', 'g..'], 3, 10);
  // The head: a ring of steel with the jaw opening towards the top right.
  grid.stamp(['..LLL..', '.Lnnnn.', 'Lnn..n.', 'Ln....', 'Lnn....', '.nnn...', '..n....'], 8, 1);
  return outlined(grid.toPixelMap());
}

/** A brass valve with a red hand wheel, puffing steam from one side or the other. */
function steamValve(puffOnLeft: boolean): PixelMap {
  const puff = puffOnLeft ? ['ww..........', 'Www.........'] : ['..........ww', '.........wwW'];
  const grid = new PixelGrid(SIZE, SIZE);
  grid.stamp(
    [
      '................',
      '.....kkkkkk.....',
      '...kkRRRRRRkk...',
      '..kRRrkkkkrRRk..',
      '..krrrrkkrrrrk..',
      '...kkrrrrrrkk...',
      '.....kkkkkk.....',
      '.......kk.......',
      '......kQQk......',
      '..kkkkQqqqkkkk..',
      '..kQQQqqqqqqDk..',
      '..kqqqqqqqqqDk..',
      '..kkkkqqqDkkkk..',
      '......kqDDk.....',
      '.......kk.......',
      '................',
    ],
    0,
    0,
  );
  grid.stamp(puff, 2, 7);
  return grid.toPixelMap();
}

/** Gear, Steam Valve, Golden Gasket and 1-Up Wrench, 16×16. */
export const POWER_UP_SHEET = {
  key: 'power-ups',
  palette: {
    k: ART_COLORS.outline,
    Q: ART_COLORS.brassLight,
    q: ART_COLORS.brass,
    D: ART_COLORS.brassShade,
    W: ART_COLORS.steamLight,
    R: ART_COLORS.valveLight,
    r: ART_COLORS.valve,
    w: ART_COLORS.steam,
    L: ART_COLORS.steelLight,
    n: ART_COLORS.steel,
    G: ART_COLORS.gripLight,
    g: ART_COLORS.grip,
  },
  frames: {
    gear1: gear(0),
    gear2: gear(1),
    steamValve1: steamValve(true),
    steamValve2: steamValve(false),
    goldenGasket1: gasket((-3 * Math.PI) / 4),
    goldenGasket2: gasket(Math.PI / 4),
    wrench: wrench(),
  },
} as const satisfies SpriteSheetDefinition;

/** Every item's animation, so an item can be shown by its kind alone. */
export const POWER_UP_ANIMATIONS = {
  gear: { key: 'gear-roll', frames: ['gear1', 'gear2'], frameRate: 8, repeat: -1 },
  steamValve: { key: 'steam-valve-puff', frames: ['steamValve1', 'steamValve2'], frameRate: 4, repeat: -1 },
  goldenGasket: { key: 'golden-gasket-shine', frames: ['goldenGasket1', 'goldenGasket2'], frameRate: 6, repeat: -1 },
  wrench: { key: 'wrench', frames: ['wrench'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

const PUFF: PixelMap = ['..kkkk..', '.kwwwWk.', 'kwWwwwwk', 'kwwwwwWk', 'kwwwwwwk', 'kSwwwwSk', '.kSwwSk.', '..kkkk..'];

/** The puff turned a quarter, a half and three quarters of the way round. */
const PUFF_QUARTER = rotateCounterClockwise(PUFF);
const PUFF_HALF = rotateCounterClockwise(PUFF_QUARTER);
const PUFF_THREE_QUARTERS = rotateCounterClockwise(PUFF_HALF);

/** Steam Rusty's puff, 8×8, tumbling as it flies, and the burst when it hits a wall. */
export const STEAM_PUFF_SHEET = {
  key: 'steam-puff',
  palette: {
    k: ART_COLORS.outline,
    W: ART_COLORS.steamLight,
    w: ART_COLORS.steam,
    S: ART_COLORS.steamShade,
  },
  frames: {
    puff1: PUFF,
    puff2: PUFF_QUARTER,
    puff3: PUFF_HALF,
    puff4: PUFF_THREE_QUARTERS,
    burst: ['W..w..W.', '.w.S.w..', '..wWw...', 'wSWWWSw.', '..wWw...', '.w.S.w..', 'W..w..W.', '........'],
  },
} as const satisfies SpriteSheetDefinition;

export const STEAM_PUFF_ANIMATIONS = {
  fly: { key: 'steam-puff-fly', frames: ['puff1', 'puff4', 'puff3', 'puff2'], frameRate: 16, repeat: -1 },
  burst: { key: 'steam-puff-burst', frames: ['burst'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;
