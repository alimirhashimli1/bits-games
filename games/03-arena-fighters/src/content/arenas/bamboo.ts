import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The bamboo forest, Kestrel's home arena, early in the morning. Back to front: a pale misty sky
 * with the sun low behind it, blue-green mountain ridges fading into the haze, a grove of tall
 * bamboo whose tops sway in the wind while leaves drift down between the stalks, villagers in
 * straw hats behind a lashed bamboo fence, and a path of packed earth and stepping stones with a
 * stone lantern at each end of the arena.
 */

const HORIZON_Y = 108;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.12, top: 0 } as const;
const SUN = { x: 120, y: 44, radius: 11 } as const;
/** Two ridges: the far one paler and higher, the near one darker. */
const RIDGES = [
  { base: 70, height: 26, period: 57, symbol: 'r' },
  { base: 90, height: 22, period: 41, symbol: 'R' },
] as const;

/** The hazy sun and the mountain ridges, their peaks worked out from overlapping slopes. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 4;
  const grid = new PixelGrid(width, bottom);
  fillCircle(grid, SUN.x, SUN.y, SUN.radius, 'u');
  for (const ridge of RIDGES) {
    for (let x = 0; x < width; x++) {
      const phase = (x % ridge.period) / ridge.period;
      const peak = 1 - Math.abs(phase * 2 - 1);
      const ripple = Math.sin(x * 0.21) * 2;
      const top = Math.round(ridge.base - peak * ridge.height + ripple);
      grid.fillRect(x, top, 1, bottom - top, ridge.symbol);
    }
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 0 } as const;
const STALK = { spacing: 13, node: 11, width: 3 } as const;

/**
 * A grove of bamboo: stalks of three shades and heights, ringed at every node, with sprays of
 * leaves near the top. Each frame the tops lean a pixel further one way and back, and a few
 * loose leaves fall a little further down between the stalks.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const sway = [0, 1, 0][frame] ?? 0;
  for (let x = 2, index = 0; x < width; x += STALK.spacing + ((index * 7) % 6), index++) {
    const shade = ['b', 'B', 'g'][index % 3] ?? 'b';
    const top = 4 + ((index * 23) % 30);
    for (let y = top; y < height; y++) {
      // The top third leans with the wind.
      const lean = y < top + (height - top) / 3 ? sway * ((index % 2) * 2 - 1) : 0;
      grid.fillRect(x + lean, y, STALK.width, 1, shade);
      if ((y - top) % STALK.node === 0) grid.fillRect(x + lean - 1, y, STALK.width + 2, 1, 'n');
    }
    // Sprays of leaves, pointing out and down from the upper nodes.
    for (let spray = 0; spray < 3; spray++) {
      const sprayY = top + 6 + spray * STALK.node;
      const side = (index + spray) % 2 === 0 ? 1 : -1;
      for (let leaf = 0; leaf < 6; leaf++) grid.plot(x + 1 + side * (2 + leaf) + sway, sprayY + (leaf >> 1), 'l');
      for (let leaf = 0; leaf < 4; leaf++) grid.plot(x + 1 + side * (2 + leaf) + sway, sprayY + 2 + (leaf >> 1), 'L');
    }
  }
  // Loose leaves drifting down, each a little lower on every frame.
  for (let x = 20, index = 0; x < width; x += 37, index++) {
    const y = (index * 29 + frame * 4) % (height - 10);
    grid.fillRect(x + ((y >> 3) % 2), y, 2, 1, 'l');
  }
  // The undergrowth along the foot of the grove.
  for (let x = 0; x < width; x++) grid.fillRect(x, height - 6 + ((x * 5) % 3), 1, 6, 'D');
  return grid.toPixelMap();
}

const FENCE = { top: 126, height: 14, post: 36 } as const;

/** A fence of bamboo poles, two rails lashed to upright posts, for the villagers to lean on. */
function fence(): PixelMap {
  const grid = new PixelGrid(STAGE.width, FENCE.height);
  for (const railY of [1, 7]) {
    grid.fillRect(0, railY, STAGE.width, 2, 'b');
    for (let x = 0; x < STAGE.width; x += STALK.node) grid.plot(x, railY, 'n');
  }
  for (let x = 6; x < STAGE.width; x += FENCE.post) {
    grid.fillRect(x, 0, 3, FENCE.height, 'B');
    grid.fillRect(x - 1, 2, 5, 1, 't');
    grid.fillRect(x - 1, 8, 5, 1, 't');
  }
  return grid.toPixelMap();
}

const STONE = { every: 30, width: 18, height: 6 } as const;
const LANTERN = { width: 14, height: 30 } as const;

/** Packed earth with moss at the edges, flat stepping stones along it, and a stone lantern at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'e');
  for (let x = 0; x < STAGE.width; x++) {
    if ((x * 7) % 5 === 0) grid.plot(x, 0, 'm');
    if ((x * 11) % 13 < 2) grid.plot(x, 1 + ((x * 3) % (height - 2)), 'E');
  }
  for (let x = 20, index = 0; x < STAGE.width; x += STONE.every, index++) {
    const y = 6 + ((index * 7) % 3) * 8;
    grid.fillRect(x, y, STONE.width, STONE.height, 's');
    grid.fillRect(x + 1, y + STONE.height - 1, STONE.width - 2, 1, 'S');
  }
  // A stone lantern at each end: a base, a post, the lit firebox, and a wide cap.
  for (const x of [0, STAGE.width - LANTERN.width]) {
    grid.fillRect(x + 3, 0, LANTERN.width - 6, 3, 'S');
    grid.fillRect(x + 5, 3, LANTERN.width - 10, 6, 's');
    grid.fillRect(x + 2, 9, LANTERN.width - 4, 2, 's');
    grid.fillRect(x + 3, 11, LANTERN.width - 6, 6, 's');
    grid.fillRect(x + 5, 12, LANTERN.width - 10, 3, 'y');
    grid.fillRect(x, 17, LANTERN.width, 3, 'S');
    grid.fillRect(x + 4, 20, LANTERN.width - 8, 2, 's');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'ridges', ...FAR, frames: [farLayer()] },
  { name: 'grove', ...MID, frames: Array.from({ length: FRAMES }, (_, frame) => midFrame(frame)), frameRate: 3 },
  { name: 'fence', scroll: 1, top: FENCE.top, frames: [fence()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const BAMBOO_FOREST: ArenaDefinition = {
  id: 'bamboo',
  name: 'BAMBOO FOREST',
  sky: ['#dce8d0', '#d6e4cc', '#d0e0c6', '#c8dac0', '#c0d4b8', '#b8ceb0', '#b0c8a8', '#a8c2a0'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: FENCE.top + FENCE.height - 1,
    spots: [14, 32, 50, 68, 85, 103, 121, 138, 156, 174, 191, 209, 227, 245, 262, 280, 298, 315, 333, 351, 368, 386, 404, 421, 439, 457, 474, 492],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    u: '#f4f0d8',
    r: '#98b4a4',
    R: '#6e9282',
    b: '#5e8a3a',
    B: '#4a7030',
    g: '#7a9e44',
    n: '#3a5a24',
    l: '#8ab44c',
    L: '#5a8a34',
    D: '#2e4a22',
    t: '#a88a58',
    e: '#7a6448',
    E: '#5e4a34',
    m: '#5a7a34',
    s: '#9a9a90',
    S: '#6e6e66',
    y: '#ffd070',
    // Villagers in straw hats, in indigo, rust, grey and green.
    1: '#3a4a7a',
    2: '#9a4a2a',
    3: '#6a6a6a',
    4: '#4a6a4a',
    x: '#e0a47c',
    X: '#a8704e',
    z: '#d8b86a',
    Z: '#2a1e16',
    j: '#2a2420',
    o: '#1a2016',
  },
};
