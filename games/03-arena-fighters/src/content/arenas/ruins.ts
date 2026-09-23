import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The moonlit ruins, Sable's home arena: a temple that fell a long time ago, lit only by the
 * moon. Back to front: a night sky with a full moon and drifting cloud, the ruin's standing
 * walls and arches with a great cracked dome behind them, broken columns wrapped in ivy with
 * fireflies drifting between them, onlookers with lanterns among the stones, and a floor of
 * cracked flagstones with a toppled column at each end.
 */

const HORIZON_Y = 104;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.12, top: 0 } as const;
const MOON = { x: 96, y: 30, radius: 13 } as const;
const DOME = { x: 210, radius: 34 } as const;

/** The moon with a bank of cloud across it, and the temple's cracked dome against the sky. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 4;
  const grid = new PixelGrid(width, bottom);
  fillCircle(grid, MOON.x, MOON.y, MOON.radius, 'w');
  fillCircle(grid, MOON.x - 4, MOON.y - 3, 3, 'W');
  fillCircle(grid, MOON.x + 5, MOON.y + 4, 2, 'W');
  // A band of thin cloud drawn across the moon and away to both sides.
  for (let x = MOON.x - 40; x < MOON.x + 44; x++) {
    const y = MOON.y + 6 + Math.round(Math.sin(x * 0.12) * 2);
    grid.fillRect(x, y, 1, (x * 3) % 5 === 0 ? 2 : 1, 'c');
  }
  for (let x = 0; x < width; x += 210) {
    // The dome: a half circle on a drum, with a bite broken out of one side.
    fillCircle(grid, x + DOME.x, bottom - 18, DOME.radius, 'k', bottom - 18);
    grid.fillRect(x + DOME.x - DOME.radius, bottom - 18, DOME.radius * 2 + 1, 18, 'k');
    fillCircle(grid, x + DOME.x + DOME.radius - 6, bottom - 34, 11, '.', bottom - 20);
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 24 } as const;
const COLUMN = { every: 38, width: 11, height: 58 } as const;
const ARCH = { every: 152, width: 64, height: 46 } as const;

/**
 * Broken columns in a row, an arch still standing every few of them, ivy hanging down the stone,
 * and fireflies drifting between them: each frame they move on a little and a few blink out.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 4;

  for (let left = 10; left < width; left += ARCH.every) arch(grid, left, ground);
  for (let x = 4, index = 0; x < width; x += COLUMN.every, index++) {
    // Each column is broken off at its own height, and some have fallen further than others.
    const broken = COLUMN.height - ((index * 23) % 34);
    const top = ground - broken;
    grid.fillRect(x, top, COLUMN.width, broken, index % 2 === 0 ? 's' : 'S');
    grid.fillRect(x - 1, top, COLUMN.width + 2, 2, 'S');
    for (let y = top + 4; y < ground; y += 7) grid.fillRect(x, y, COLUMN.width, 1, 'S');
    // Ivy down one side, in little leaves.
    for (let y = top + 3, leaf = 0; y < ground; y += 3, leaf++) {
      grid.plot(x + (leaf % 2 === 0 ? -1 : COLUMN.width), y, 'v');
      if (leaf % 3 === 0) grid.plot(x + (leaf % 2 === 0 ? -2 : COLUMN.width + 1), y + 1, 'V');
    }
  }
  for (let x = 16, fly = 0; x < width; x += 43, fly++) {
    const y = 16 + ((fly * 29 + frame * 7) % (ground - 30));
    if ((fly + frame) % 4 !== 0) grid.fillRect(x + ((fly + frame) % 3), y, 1, 1, 'y');
  }
  grid.fillRect(0, ground, width, height - ground, 'd');
  return grid.toPixelMap();
}

/** An arch still standing: two piers and the round top between them. */
function arch(grid: PixelGrid, left: number, ground: number): void {
  const top = ground - ARCH.height;
  const radius = ARCH.width / 2;
  fillCircle(grid, left + radius, top + radius, radius, 'S', top + radius);
  fillCircle(grid, left + radius, top + radius, radius - 7, '.', top + radius);
  for (const x of [left, left + ARCH.width - 7]) grid.fillRect(x, top + radius, 7, ARCH.height - radius, 'S');
}

const STONES = { top: 122, height: 18 } as const;

/** A low line of fallen stones for the onlookers to stand among, with a lantern set on them. */
function stones(): PixelMap {
  const grid = new PixelGrid(STAGE.width, STONES.height);
  for (let x = 0, index = 0; x < STAGE.width; x += 17, index++) {
    const top = 4 + ((index * 5) % 4);
    grid.fillRect(x, top, 16, STONES.height - top, index % 2 === 0 ? 's' : 'S');
    grid.fillRect(x, top, 16, 1, 'l');
  }
  for (let x = 24; x < STAGE.width; x += 96) {
    grid.fillRect(x, 0, 5, 6, 'k');
    grid.fillRect(x + 1, 1, 3, 4, 'y');
  }
  return grid.toPixelMap();
}

const FALLEN = { width: 46, height: 13 } as const;

/** Cracked flagstones with moss in the joints, and a toppled column lying at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  for (let y = 0, row = 0; y < height; y += 11, row++) {
    grid.fillRect(0, y, STAGE.width, 1, 'F');
    for (let x = (row * 17) % 40; x < STAGE.width; x += 40) grid.fillRect(x, y, 1, 11, 'F');
  }
  // Cracks running across the stones, and moss in the corners.
  for (let x = 12; x < STAGE.width; x += 53) {
    for (let step = 0; step < 14; step++) grid.plot(x + step, 6 + ((x + step * 3) % 9), 'F');
    grid.fillRect(x + 20, 2 + ((x * 3) % 7), 4, 2, 'm');
  }
  for (const x of [0, STAGE.width - FALLEN.width]) {
    grid.fillRect(x, 4, FALLEN.width, FALLEN.height, 's');
    grid.fillRect(x, 4, FALLEN.width, 2, 'l');
    for (let band = x + 6; band < x + FALLEN.width; band += 9) grid.fillRect(band, 6, 1, FALLEN.height - 2, 'S');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'moon', ...FAR, frames: [farLayer()] },
  { name: 'ruin', ...MID, frames: Array.from({ length: FRAMES }, (_, frame) => midFrame(frame)), frameRate: 3 },
  { name: 'stones', scroll: 1, top: STONES.top, frames: [stones()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const RUINS: ArenaDefinition = {
  id: 'ruins',
  name: 'MOONLIT RUINS',
  sky: ['#05060f', '#070915', '#090c1c', '#0b0f23', '#0d122a', '#101632', '#131a3a', '#161e42'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: STONES.top + STONES.height - 1,
    spots: [20, 38, 57, 75, 94, 112, 131, 149, 168, 186, 205, 223, 242, 260, 279, 297, 316, 334, 353, 371, 390, 408, 427, 445, 464, 482],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '1', skin: 'X', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    w: '#f4f4e0',
    W: '#d8d8c0',
    c: '#4a5070',
    k: '#0e1020',
    s: '#6a6a78',
    S: '#4a4a58',
    l: '#8a8a98',
    v: '#3a6a3a',
    V: '#2a4e2a',
    y: '#f0e07a',
    d: '#1a1c2a',
    f: '#4a4a56',
    F: '#3a3a46',
    m: '#2e4a2e',
    1: '#2a2a44',
    2: '#3c2a44',
    3: '#24303c',
    x: '#c8a07c',
    X: '#8a6a4e',
    z: '#1e1a18',
    Z: '#4a3a30',
    j: '#1a1820',
    o: '#04040a',
  },
};
