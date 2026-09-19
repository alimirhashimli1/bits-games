import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The festival plaza at night, Tala's home arena. Back to front: a deep blue sky, a moon and
 * stars over distant rooftops, a row of market stalls with striped awnings and glowing
 * counters, strings of paper lanterns that sway, festival-goers behind a low stone wall, and a
 * floor of stone tiles with a pillar at each end.
 */

const HORIZON_Y = 108;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;
const MOON = { x: 80, y: 26, radius: 9 } as const;

/** The moon, a scatter of stars, and the rooftops of the town beyond the square. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);
  for (let star = 0; star < 60; star++) {
    grid.plot((star * 53 + 17) % width, (star * 29 + 5) % (HORIZON_Y - 30), star % 7 === 0 ? 'W' : 'w');
  }
  fillCircle(grid, MOON.x, MOON.y, MOON.radius, 'm');
  fillCircle(grid, MOON.x + 3, MOON.y - 2, 2, 'M');

  // Rooftops: blocks with sloping, overhanging roofs.
  for (let x = 0, index = 0; x < width; index++) {
    const houseWidth = 18 + ((index * 13) % 14);
    const height = 10 + ((index * 23) % 16);
    const top = HORIZON_Y - height;
    grid.fillRect(x + 2, top, houseWidth - 4, height + 4, 'k');
    for (let step = 0; step < 4; step++) grid.fillRect(x + step, top - 4 + step, houseWidth - step * 2, 1, 'K');
    if (index % 3 === 1) grid.fillRect(x + Math.floor(houseWidth / 2) - 1, top + 4, 3, 3, 'l');
    x += houseWidth + 2;
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 66 } as const;
const STALL = { width: 56, gap: 14, height: 44, awning: 10 } as const;

/** Market stalls: posts, a glowing counter under a striped awning, and goods on the shelf behind. */
function midLayer(): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 2;

  for (let x = 6, index = 0; x < width; x += STALL.width + STALL.gap, index++) {
    const top = ground - STALL.height;
    grid.fillRect(x + 2, top + STALL.awning, STALL.width - 4, STALL.height - STALL.awning, 'd');
    grid.fillRect(x + 4, top + STALL.awning + 2, STALL.width - 8, 16, 'l');
    for (let goods = x + 6; goods < x + STALL.width - 6; goods += 5) grid.fillRect(goods, top + STALL.awning + 8, 3, 3, index % 2 ? 'r' : 'y');
    grid.fillRect(x, top + STALL.awning + 20, STALL.width, 4, 'D');
    grid.fillRect(x, top, 2, STALL.height, 'D');
    grid.fillRect(x + STALL.width - 2, top, 2, STALL.height, 'D');
    // The awning: stripes that dip into a scalloped edge.
    for (let stripe = 0; stripe < STALL.width; stripe += 4) {
      const symbol = (stripe / 4) % 2 === 0 ? (index % 2 ? 'b' : 'r') : 'W';
      grid.fillRect(x + stripe, top, 4, STALL.awning, symbol);
      grid.fillRect(x + stripe + 1, top + STALL.awning, 2, 1, symbol);
    }
  }
  grid.fillRect(0, ground, width, 2, 'D');
  return grid.toPixelMap();
}

const LANTERNS = { scroll: 0.8, top: 12, height: 44, spacing: 64, poleHeight: 40 } as const;

/**
 * Strings of paper lanterns hung between poles, sagging in the middle. On the second frame each
 * lantern hangs a pixel to one side, which reads as a sway in the night breeze.
 */
function lanternFrame(frame: number): PixelMap {
  const width = layerWidth(LANTERNS.scroll);
  const grid = new PixelGrid(width, LANTERNS.height);
  for (let pole = 0; pole < width; pole += LANTERNS.spacing * 2) grid.fillRect(pole, 0, 2, LANTERNS.height, 'D');

  for (let start = 0; start < width; start += LANTERNS.spacing) {
    const sag = (x: number): number => 2 + Math.round(10 * Math.sin((Math.PI * (x - start)) / LANTERNS.spacing));
    for (let x = start; x < start + LANTERNS.spacing && x < width; x++) grid.plot(x, sag(x), 'q');
    for (let x = start + 8, lantern = 0; x < start + LANTERNS.spacing - 4; x += 12, lantern++) {
      const sway = frame === 1 && lantern % 2 === 0 ? 1 : 0;
      const hang = sag(x) + 3;
      const color = lantern % 3 === 0 ? 'y' : 'L';
      grid.fillRect(x - 2 + sway, hang, 5, 6, color);
      grid.fillRect(x - 1 + sway, hang + 1, 3, 4, 'Y');
      grid.plot(x + sway, hang - 1, 'q');
      grid.plot(x + sway, hang + 6, 'q');
    }
  }
  return grid.toPixelMap();
}

const WALL = { top: 130, height: 10, stone: 16 } as const;

/** A low stone wall the crowd stands behind. */
function wall(): PixelMap {
  const grid = new PixelGrid(STAGE.width, WALL.height);
  for (let row = 0, course = 0; row < WALL.height; row += 5, course++) {
    const offset = course % 2 === 0 ? 0 : WALL.stone / 2;
    for (let x = -offset, stone = 0; x < STAGE.width; x += WALL.stone, stone++) {
      grid.fillRect(x, row, WALL.stone - 1, 4, (stone + course) % 2 === 0 ? 'n' : 'N');
    }
  }
  grid.fillRect(0, 0, STAGE.width, 1, 'W');
  return grid.toPixelMap();
}

const TILE = { width: 16, height: 8 } as const;
const PILLAR = { width: 10, height: 18 } as const;

/** Square stone tiles in two shades, with a stone pillar marking each end of the arena. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  for (let y = 0; y < height; y += TILE.height) {
    for (let x = 0; x < STAGE.width; x += TILE.width) {
      grid.fillRect(x, y, TILE.width - 1, TILE.height - 1, (x / TILE.width + y / TILE.height) % 2 === 0 ? 'f' : 'F');
    }
    grid.fillRect(0, y + TILE.height - 1, STAGE.width, 1, 'g');
  }
  for (const x of [0, STAGE.width - PILLAR.width]) {
    grid.fillRect(x, 0, PILLAR.width, PILLAR.height, 'N');
    grid.fillRect(x, 0, PILLAR.width, 2, 'n');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farLayer()] },
  { name: 'stalls', ...MID, frames: [midLayer()] },
  { name: 'lanterns', scroll: LANTERNS.scroll, top: LANTERNS.top, frames: [lanternFrame(0), lanternFrame(1)], frameRate: 2 },
  { name: 'wall', scroll: 1, top: WALL.top, frames: [wall()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

/** Crowd shirts are the digits 1 to 6 in the palette. */
const outline = 'o';

export const PLAZA: ArenaDefinition = {
  id: 'plaza',
  name: 'FESTIVAL PLAZA',
  sky: ['#0b0a1f', '#10102b', '#171638', '#1e1d46', '#262454', '#302b5e', '#3b3266', '#48386b'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: WALL.top + WALL.height - 1,
    spots: [14, 30, 44, 60, 77, 92, 110, 126, 141, 158, 176, 193, 210, 226, 244, 262, 280, 296, 312, 330, 347, 363, 380, 398, 415, 430, 448, 466, 483, 498],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '6', skin: 'X', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    w: '#c9c3e6',
    W: '#fff6d8',
    m: '#f2ecc8',
    M: '#d8d0a8',
    k: '#161430',
    K: '#221d40',
    l: '#f5b85a',
    d: '#3a2a3a',
    D: '#2a1e2a',
    r: '#c8453a',
    b: '#3a6ea8',
    y: '#f2c14e',
    q: '#1a1420',
    L: '#e0503a',
    Y: '#ffd88a',
    n: '#6b6478',
    N: '#524b5e',
    f: '#7a7488',
    F: '#6a6478',
    g: '#3e3a4a',
    1: '#c8453a',
    2: '#3a6ea8',
    3: '#e8a33a',
    4: '#3f8a5a',
    5: '#a85aa0',
    6: '#e8e0c8',
    x: '#e0b08a',
    X: '#9a6a48',
    z: '#1c1410',
    Z: '#5a3a24',
    j: '#2a2436',
    o: '#0e0c18',
  },
};
