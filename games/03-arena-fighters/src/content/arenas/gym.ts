import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The back-alley boxing gym, Knox's home arena: a low brick room under bare bulbs. Back to
 * front: a brick wall hung with fight bills and a wall clock, a training ring with slack ropes
 * in the corner, heavy bags and a speed bag swinging on their chains, regulars watching from
 * behind a rope on posts, and a floor of worn boards with a bucket and a stool at each end.
 */

const HORIZON_Y = 96;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.15, top: 0 } as const;
const BRICK = { width: 14, height: 6 } as const;
const BILL = { every: 74, width: 22, height: 28 } as const;

/** The brick back wall, with fight bills pasted on it and a clock. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 24;
  const grid = new PixelGrid(width, bottom);
  for (let y = 0, row = 0; y < bottom; y += BRICK.height, row++) {
    const offset = row % 2 === 0 ? 0 : BRICK.width / 2;
    for (let x = -offset; x < width; x += BRICK.width) {
      grid.fillRect(x, y, BRICK.width - 1, BRICK.height - 1, (x + row) % 3 === 0 ? 'R' : 'r');
    }
  }
  // Fight bills: a pale sheet with a dark band of lettering and two boxers blocked in.
  for (let x = 20, index = 0; x < width; x += BILL.every, index++) {
    const top = 18 + ((index * 11) % 10);
    grid.fillRect(x, top, BILL.width, BILL.height, index % 2 === 0 ? 'l' : 'L');
    grid.fillRect(x + 2, top + 3, BILL.width - 4, 4, 'k');
    grid.fillRect(x + 3, top + 11, 6, 10, 'k');
    grid.fillRect(x + BILL.width - 9, top + 11, 6, 10, 'k');
    grid.fillRect(x + 2, top + BILL.height - 5, BILL.width - 4, 2, 'k');
  }
  // A clock high on the wall.
  const clockX = 120;
  fillCircle(grid, clockX, 24, 7, 'w');
  fillCircle(grid, clockX, 24, 6, 'l');
  grid.fillRect(clockX, 20, 1, 5, 'k');
  grid.fillRect(clockX, 24, 4, 1, 'k');
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 30 } as const;
const RING = { every: 230, width: 120, height: 46 } as const;
const BAG = { every: 62, width: 11, height: 34 } as const;

/** The training ring, the heavy bags on their chains, and a speed bag: all of them swinging. */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const floorY = height - 4;
  const sway = [-1, 0, 1][frame] ?? 0;

  for (let left = 12; left < width; left += RING.every) ring(grid, left, floorY);
  // Heavy bags hanging from the ceiling, swinging a pixel each way.
  for (let x = 46, index = 0; x < width; x += BAG.every, index++) {
    if (x % RING.every < RING.width + 12) continue;
    const lean = index % 2 === 0 ? sway : -sway;
    const top = 2 + ((index * 7) % 6);
    for (let y = top; y < top + 12; y += 2) grid.plot(x + 5, y, 'c');
    const bagTop = top + 12;
    grid.fillRect(x + lean, bagTop, BAG.width, BAG.height, 'b');
    grid.fillRect(x + lean, bagTop, BAG.width, 2, 'B');
    grid.fillRect(x + lean, bagTop + 10, BAG.width, 1, 'B');
    grid.fillRect(x + lean, bagTop + BAG.height - 3, BAG.width, 3, 'B');
  }
  grid.fillRect(0, floorY, width, height - floorY, 'd');
  return grid.toPixelMap();
}

/** A training ring: a raised platform on posts, with three slack ropes strung between them. */
function ring(grid: PixelGrid, left: number, floorY: number): void {
  const deck = floorY - RING.height;
  grid.fillRect(left, deck, RING.width, 6, 'm');
  grid.fillRect(left, deck + 6, RING.width, 3, 'M');
  for (const x of [left + 2, left + RING.width - 5]) {
    grid.fillRect(x, deck - 26, 3, 26, 'p');
    grid.fillRect(x - 1, deck - 28, 5, 2, 'P');
    grid.fillRect(x, deck + 9, 3, RING.height - 9, 'M');
  }
  // Three ropes, each sagging a little more than the one above it.
  for (let rope = 0; rope < 3; rope++) {
    const top = deck - 22 + rope * 7;
    for (let x = left + 3; x < left + RING.width - 3; x++) {
      const along = (x - left - 3) / (RING.width - 6);
      grid.plot(x, top + Math.round((2 + rope) * 4 * along * (1 - along)), 'w');
    }
  }
}

const ROPE = { top: 124, height: 16, post: 44 } as const;

/** A velvet rope on posts, for the regulars to lean over. */
function barrier(): PixelMap {
  const grid = new PixelGrid(STAGE.width, ROPE.height);
  for (let x = 6; x < STAGE.width; x += ROPE.post) {
    grid.fillRect(x, 2, 3, ROPE.height - 2, 'P');
    grid.fillRect(x - 1, 0, 5, 3, 'y');
  }
  for (let x = 0; x < STAGE.width; x++) {
    const along = (x % ROPE.post) / ROPE.post;
    grid.plot(x, 4 + Math.round(3 * 4 * along * (1 - along)), 'v');
  }
  return grid.toPixelMap();
}

const BOARD = { width: 34, height: 9 } as const;
const STOOL = { width: 12, height: 14 } as const;

/** Worn floorboards with a scuffed circle in the middle, a corner stool and a water bucket at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  for (let y = 0, row = 0; y < height; y += BOARD.height, row++) {
    grid.fillRect(0, y, STAGE.width, 1, 'F');
    for (let x = (row * 13) % BOARD.width; x < STAGE.width; x += BOARD.width) grid.fillRect(x, y, 1, BOARD.height, 'F');
  }
  for (let x = 0; x < STAGE.width; x += 3) grid.plot(x + ((x * 7) % 3), 12 + ((x * 5) % 9), 'F');
  for (const [x, flip] of [[2, 1], [STAGE.width - STOOL.width - 2, -1]] as const) {
    // A stool: a seat on splayed legs, with a bucket beside it.
    grid.fillRect(x, 4, STOOL.width, 3, 'p');
    grid.fillRect(x + 1, 7, 2, 10, 'P');
    grid.fillRect(x + STOOL.width - 3, 7, 2, 10, 'P');
    const bucketX = flip === 1 ? x + STOOL.width + 3 : x - 9;
    grid.fillRect(bucketX, 8, 8, 9, 'm');
    grid.fillRect(bucketX, 8, 8, 2, 'M');
    grid.fillRect(bucketX + 1, 10, 6, 2, 'w');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'wall', ...FAR, frames: [farLayer()] },
  { name: 'gym', ...MID, frames: Array.from({ length: FRAMES }, (_, frame) => midFrame(frame)), frameRate: 4 },
  { name: 'rope', scroll: 1, top: ROPE.top, frames: [barrier()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const GYM: ArenaDefinition = {
  id: 'gym',
  name: 'BOXING GYM',
  sky: ['#2a1e1a', '#33241e', '#3c2a22', '#453026', '#4e362a', '#573c2e', '#604232', '#694836'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: ROPE.top + ROPE.height - 1,
    spots: [18, 36, 54, 72, 90, 108, 126, 144, 162, 180, 198, 216, 234, 252, 270, 288, 306, 324, 342, 360, 378, 396, 414, 432, 450, 468, 486],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    r: '#7a4a3a',
    R: '#663c2e',
    l: '#e8dcc0',
    L: '#d8c8a8',
    k: '#2a201c',
    w: '#f0ece0',
    c: '#8a8a94',
    b: '#5a3a24',
    B: '#3e2718',
    d: '#3a2a22',
    m: '#6a6a72',
    M: '#4a4a52',
    p: '#8a5a34',
    P: '#5e3c22',
    v: '#a82a3a',
    y: '#c8a038',
    f: '#8a6a4a',
    F: '#6e5238',
    1: '#3a4a6a',
    2: '#7a3a2a',
    3: '#4a4a4a',
    4: '#6a5a3a',
    x: '#e0a47c',
    X: '#8a5a3a',
    z: '#2a1e16',
    Z: '#5e4632',
    j: '#2a2420',
    o: '#141010',
  },
};
