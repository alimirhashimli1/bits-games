import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { STAGE, SCREEN } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * Harbour docks at dusk, Brand's home arena. Back to front: a purple-to-orange sky, the sun
 * half set behind a city skyline, shimmering water with the sun's reflection, cranes,
 * warehouses and containers on the far quay, dockworkers behind a railing, and the plank
 * floor with iron bollards at either end.
 */

const HORIZON_Y = 110;
const QUAY_Y = 142;
const FLOOR_TOP = 140;

const FAR = { scroll: 0.15, top: 50 } as const;
/** Where the sun sits in the far layer: sinking into the sea, near the middle of the arena, in a gap in the city. */
const SUN = { x: 236, sunk: 6, radius: 18, coreRadius: 11, gap: 24 } as const;

/** The sun going down behind the city, with a few windows already lit. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const horizon = HORIZON_Y - FAR.top;
  const grid = new PixelGrid(width, horizon + 2);
  fillCircle(grid, SUN.x, horizon + SUN.sunk, SUN.radius, 'u', horizon);
  fillCircle(grid, SUN.x, horizon + SUN.sunk, SUN.coreRadius, 'U', horizon);

  for (let x = 0, index = 0; x < width; index++) {
    // The city opens up where the sun goes down into the sea.
    if (Math.abs(x - SUN.x) < SUN.gap) {
      x += 1;
      continue;
    }
    const buildingWidth = 10 + ((index * 17) % 13);
    const height = 8 + ((index * 37) % 23);
    grid.fillRect(x, horizon - height, buildingWidth, height + 2, 'k');
    for (let wy = horizon - height + 3; wy < horizon - 2; wy += 4) {
      for (let wx = x + 2; wx < x + buildingWidth - 2; wx += 3) {
        if ((wx * 7 + wy * 3 + index) % 5 === 0) grid.plot(wx, wy, 'w');
      }
    }
    x += buildingWidth + ((index * 5) % 4);
  }
  return grid.toPixelMap();
}

const WATER = { scroll: 0.35, top: HORIZON_Y, frames: 3 } as const;
/** The sun's reflection lies below where the sun appears, with the camera in the middle. */
const REFLECTION_X = 256;

/** Dark water in bands, and the sun's reflection breaking up into streaks that shift from frame to frame. */
function waterFrame(frame: number): PixelMap {
  const width = layerWidth(WATER.scroll);
  const height = QUAY_Y - HORIZON_Y;
  const grid = new PixelGrid(width, height);
  for (let y = 0; y < height; y++) grid.fillRect(0, y, width, 1, y % 4 === 0 ? 'Q' : 'q');

  for (let y = 1; y < height; y += 2) {
    const halfWidth = Math.max(1, Math.round(14 - y / 2.5));
    const jitter = ((y * 7 + frame * 5) % 5) - 2;
    grid.fillRect(REFLECTION_X - halfWidth + jitter, y, halfWidth * 2, 1, y < 10 ? 'E' : 'e');
  }
  for (let glint = 0; glint < 14; glint++) {
    grid.plot((glint * 29 + frame * 11) % width, (glint * 7 + frame * 3) % height, 'Q');
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.6, top: 50 } as const;

/** The far quay: a warehouse, a crane with its hook down, stacked containers, lamp posts and a second shed. */
function midLayer(): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = QUAY_Y - MID.top;
  const quay = height - 8;
  const grid = new PixelGrid(width, height);

  // Warehouse with a pitched roof, lit windows and a big door.
  grid.fillRect(10, 30, 110, quay - 30, 'm');
  for (let step = 1; step <= 10; step++) grid.fillRect(10 + step * 4, 30 - step, 110 - step * 8, 1, 'm');
  for (let x = 18; x < 110; x += 12) grid.fillRect(x, 44, 4, 3, (x / 12) % 3 === 0 ? 'm' : 'l');
  grid.fillRect(50, quay - 22, 20, 22, 'M');

  // Crane: tower, jib and counterweight, cab, and the hook hanging on its cable.
  grid.fillRect(170, 8, 5, quay - 8, 'm');
  for (let y = 12; y < quay; y += 8) grid.line([170, y], [174, y + 6], 1, 'M');
  grid.line([140, 10], [270, 10], 2, 'm');
  grid.fillRect(140, 10, 14, 8, 'm');
  grid.fillRect(166, 14, 12, 8, 'M');
  grid.plot(175, 17, 'l');
  grid.line([245, 11], [245, 48], 1, 'M');
  grid.fillRect(242, 48, 6, 4, 'm');

  // Containers, stacked two high, with ribbed sides.
  const containers: ReadonlyArray<readonly [x: number, y: number, symbol: string]> = [
    [290, quay - 14, 'c'],
    [328, quay - 14, 'C'],
    [300, quay - 28, 'C'],
  ];
  for (const [x, y, symbol] of containers) {
    grid.fillRect(x, y, 36, 14, symbol);
    for (let rib = x + 3; rib < x + 36; rib += 4) grid.fillRect(rib, y + 1, 1, 12, 'm');
  }

  // A second shed, and lamp posts along the quay.
  grid.fillRect(380, 40, 60, quay - 40, 'M');
  grid.fillRect(396, 52, 6, 4, 'l');
  for (const x of [140, 280]) {
    grid.fillRect(x, 40, 2, quay - 40, 'm');
    grid.fillRect(x - 1, 37, 4, 3, 'l');
  }
  grid.fillRect(0, quay, width, height - quay, 'M');
  return grid.toPixelMap();
}

const RAILING = { top: 128, height: 14, postSpacing: 24 } as const;

/** The railing the crowd leans on, drawn in front of them. */
function railing(): PixelMap {
  const grid = new PixelGrid(STAGE.width, RAILING.height);
  grid.fillRect(0, 2, STAGE.width, 2, 'r');
  grid.fillRect(0, 8, STAGE.width, 2, 'r');
  grid.fillRect(0, 2, STAGE.width, 1, 'R');
  for (let x = 0; x < STAGE.width; x += RAILING.postSpacing) grid.fillRect(x, 0, 2, RAILING.height, 'r');
  return grid.toPixelMap();
}

const PLANK = { height: 6, length: 40 } as const;
const BOLLARD = { width: 8, height: 14, inset: 2 } as const;

/** Rows of planks with staggered seams, nails at the ends, and an iron bollard at each end of the arena. */
function floor(): PixelMap {
  const height = SCREEN.height - FLOOR_TOP;
  const grid = new PixelGrid(STAGE.width, height);
  const woods = ['p', 'd', 'P'] as const;

  for (let row = 0; row * PLANK.height < height; row++) {
    const y = row * PLANK.height;
    const offset = (row * 13) % PLANK.length;
    for (let x = -offset, board = 0; x < STAGE.width; x += PLANK.length, board++) {
      grid.fillRect(x, y, PLANK.length, PLANK.height - 1, woods[(row + board) % woods.length] ?? 'p');
      grid.fillRect(x, y, 1, PLANK.height - 1, 'g');
      grid.plot(x + 2, y + 1, 'n');
      grid.plot(x + 2, y + 3, 'n');
    }
    grid.fillRect(0, y + PLANK.height - 1, STAGE.width, 1, 'g');
  }

  for (const x of [BOLLARD.inset, STAGE.width - BOLLARD.inset - BOLLARD.width]) {
    grid.fillRect(x, 6, BOLLARD.width, BOLLARD.height, 'i');
    grid.fillRect(x - 1, 4, BOLLARD.width + 2, 3, 'I');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farLayer()] },
  { name: 'water', scroll: WATER.scroll, top: WATER.top, frames: Array.from({ length: WATER.frames }, (_, frame) => waterFrame(frame)), frameRate: 4 },
  { name: 'mid', ...MID, frames: [midLayer()] },
  { name: 'railing', scroll: 1, top: RAILING.top, frames: [railing()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: FLOOR_TOP, frames: [floor()], inFrontOfCrowd: true },
];

/** Crowd shirts are the digits 1 to 6 in the palette. */
const outline = 'o';

export const DOCKS: ArenaDefinition = {
  id: 'docks',
  name: 'HARBOUR DOCKS',
  sky: ['#1d1233', '#2c1745', '#46205a', '#6b2a62', '#96365f', '#c4485a', '#e8704f', '#f5a05a'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: RAILING.top + RAILING.height - 1,
    spots: [18, 33, 47, 64, 79, 95, 118, 133, 150, 166, 190, 205, 221, 240, 256, 272, 290, 305, 326, 342, 358, 375, 392, 410, 426, 444, 462, 478, 494],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'y', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'y', legs: 'J', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'y', legs: 'J', outline }),
      createPerson({ shirt: '6', skin: 'X', hair: 'y', legs: 'j', outline }),
    ],
  },
  palette: {
    k: '#2a1838',
    w: '#f5c26b',
    u: '#ffb35c',
    U: '#ffe9a8',
    q: '#3a2a5a',
    Q: '#4f3a70',
    e: '#e8704f',
    E: '#f5a05a',
    m: '#231530',
    M: '#3a2548',
    l: '#f5c26b',
    c: '#5a2a3a',
    C: '#2f3b52',
    r: '#4a2e1e',
    R: '#6b452c',
    p: '#7a4a2e',
    P: '#5e3822',
    d: '#8d5a38',
    g: '#2e1a12',
    n: '#c9b89a',
    i: '#2a2a38',
    I: '#44445a',
    1: '#b8433a',
    2: '#3f6e8c',
    3: '#c9a24a',
    4: '#5d7a3a',
    5: '#8a4f8f',
    6: '#d9d2c0',
    x: '#d9a07a',
    X: '#8a5a3c',
    y: '#2a1a14',
    z: '#6b4a2a',
    j: '#2a2a3a',
    J: '#3d3226',
    o: '#140f1c',
  },
};
