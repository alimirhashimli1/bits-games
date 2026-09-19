import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The iron foundry, Kanan's home arena: a smoky hall lit red by molten metal. Back to front:
 * soot-dark air, tall chimneys and furnace mouths that glow and pulse, a great crucible pouring
 * a stream of molten iron into a channel, with chains hanging from the gantry above, foundry
 * workers behind an iron railing, and a floor of riveted iron plates with a furnace-door
 * pillar at each end.
 */

const HORIZON_Y = 104;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;

/** Chimneys and furnaces against the smoke; their mouths glow brighter on the second frame. */
function farFrame(frame: number): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);
  for (let x = 4, index = 0; x < width; index++) {
    const chimneyWidth = 8 + ((index * 5) % 6);
    const top = 14 + ((index * 19) % 30);
    grid.fillRect(x, top, chimneyWidth, HORIZON_Y + 4 - top, 'k');
    grid.fillRect(x - 1, top, chimneyWidth + 2, 2, 'K');
    // A furnace block at the foot of every other chimney, its mouth glowing.
    if (index % 2 === 0) {
      grid.fillRect(x - 6, HORIZON_Y - 22, chimneyWidth + 12, 26, 'k');
      grid.fillRect(x - 2, HORIZON_Y - 14, chimneyWidth + 4, 8, frame === 1 ? 'Y' : 'r');
      grid.fillRect(x, HORIZON_Y - 12, chimneyWidth, 4, frame === 1 ? 'W' : 'y');
    }
    x += chimneyWidth + 18 + ((index * 11) % 14);
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 20 } as const;
const GANTRY_Y = 6;
const CRUCIBLE = { x: 150, y: 30, radius: 12 } as const;

/**
 * The gantry with chains hanging from it, a tipped crucible pouring a stream of molten iron
 * into a glowing channel below. The stream's bright core wavers from frame to frame.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 2;

  grid.fillRect(0, GANTRY_Y, width, 4, 'D');
  for (let x = 0; x < width; x += 36) grid.fillRect(x, GANTRY_Y + 4, 3, ground - GANTRY_Y - 4, 'd');
  // Chains of alternating links, of different lengths.
  for (let x = 20, index = 0; x < width; x += 29, index++) {
    const length = 14 + ((index * 13) % 24);
    for (let y = GANTRY_Y + 4; y < GANTRY_Y + 4 + length; y += 2) grid.plot(x + (y % 4 === 0 ? 0 : 1), y, 'c');
    grid.fillRect(x - 1, GANTRY_Y + 4 + length, 4, 3, 'c');
  }

  // The crucible, the pour, and the channel it runs along.
  fillCircle(grid, CRUCIBLE.x, CRUCIBLE.y, CRUCIBLE.radius, 'D', CRUCIBLE.y + 8);
  grid.fillRect(CRUCIBLE.x - 10, CRUCIBLE.y - 12, 20, 3, 'd');
  grid.fillRect(CRUCIBLE.x + 8, CRUCIBLE.y - 4, 6, 3, 'y');
  const channelY = ground - 16;
  for (let y = CRUCIBLE.y - 1; y < channelY; y++) {
    const sway = (y + frame) % 3 === 0 ? 1 : 0;
    grid.fillRect(CRUCIBLE.x + 12 + sway, y, 3, 1, 'r');
    grid.plot(CRUCIBLE.x + 13 + sway, y, frame === 1 ? 'W' : 'Y');
  }
  grid.fillRect(0, channelY, width, 4, 'D');
  grid.fillRect(0, channelY + 1, width, 2, 'r');
  for (let x = frame; x < width; x += 5) grid.plot(x, channelY + 1, 'Y');
  return grid.toPixelMap();
}

const RAILING = { top: 128, height: 12, post: 32 } as const;

/** An iron railing: two rails on posts, the workers leaning on it. */
function railing(): PixelMap {
  const grid = new PixelGrid(STAGE.width, RAILING.height);
  grid.fillRect(0, 0, STAGE.width, 2, 'n');
  grid.fillRect(0, 6, STAGE.width, 2, 'N');
  for (let x = 6; x < STAGE.width; x += RAILING.post) grid.fillRect(x, 0, 3, RAILING.height, 'N');
  return grid.toPixelMap();
}

const PLATE = { width: 32, height: 10 } as const;
const PILLAR = { width: 12, height: 20 } as const;

/** Riveted iron floor plates, and at each end a furnace door with a glowing slot. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  for (let y = 0, row = 0; y < height; y += PLATE.height, row++) {
    const offset = row % 2 === 0 ? 0 : PLATE.width / 2;
    for (let x = -offset; x < STAGE.width; x += PLATE.width) {
      grid.fillRect(x, y, PLATE.width - 1, PLATE.height - 1, 'f');
      for (const [dx, dy] of [[2, 2], [PLATE.width - 4, 2], [2, PLATE.height - 4], [PLATE.width - 4, PLATE.height - 4]] as const) {
        grid.plot(x + dx, y + dy, 'g');
      }
    }
  }
  for (const x of [0, STAGE.width - PILLAR.width]) {
    grid.fillRect(x, 0, PILLAR.width, PILLAR.height, 'k');
    grid.fillRect(x + 2, 6, PILLAR.width - 4, 3, 'r');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farFrame(0), farFrame(1)], frameRate: 2 },
  { name: 'pour', ...MID, frames: [midFrame(0), midFrame(1)], frameRate: 5 },
  { name: 'railing', scroll: 1, top: RAILING.top, frames: [railing()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const FOUNDRY: ArenaDefinition = {
  id: 'foundry',
  name: 'IRON FOUNDRY',
  sky: ['#120a0a', '#180c0c', '#200f0d', '#2a130f', '#351811', '#421d13', '#512314', '#602916'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: RAILING.top + RAILING.height - 1,
    spots: [16, 34, 50, 67, 85, 101, 118, 136, 152, 170, 187, 204, 221, 238, 256, 272, 290, 306, 324, 341, 358, 376, 392, 410, 427, 444, 461, 478, 495],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'Z', legs: 'j', outline }),
    ],
  },
  palette: {
    k: '#1c1412',
    K: '#2c1e1a',
    d: '#3a2a24',
    D: '#261a16',
    c: '#6a5e58',
    r: '#c8401c',
    y: '#f08c28',
    Y: '#ffc850',
    W: '#fff4c8',
    n: '#5a5058',
    N: '#3c343c',
    f: '#4a4448',
    g: '#2a2428',
    1: '#3a4a5a',
    2: '#7a4a2a',
    3: '#5a5a3a',
    4: '#4a3a4a',
    5: '#8a7a5a',
    x: '#e0a47c',
    X: '#9a6a48',
    z: '#2a1e16',
    Z: '#a83a1a',
    j: '#221c1e',
    o: '#0c0808',
  },
};
