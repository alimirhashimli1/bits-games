import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The monastery courtyard high in the mountains, Old Wen's home arena, at the end of the day.
 * Back to front: a golden evening sky over snow-capped peaks, strings of prayer flags fluttering
 * high between poles, the temple hall with red pillars and a tiled roof whose eaves curl up at the
 * ends, a bell tower where a bronze bell swings, incense smoke curling up from a burner, monks in
 * robes watching over a low stone wall, and flagstones with a bronze incense burner at each end.
 */

const HORIZON_Y = 100;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.12, top: 0 } as const;
const PEAK = { spacing: 70, height: 46, snow: 12 } as const;

/** Snow-capped peaks: triangles of rock whose top part is white. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 4;
  const grid = new PixelGrid(width, bottom);
  for (let centre = 20, index = 0; centre < width + PEAK.spacing; centre += PEAK.spacing, index++) {
    const height = PEAK.height - ((index * 13) % 18);
    const top = bottom - height;
    for (let y = top; y < bottom; y++) {
      const half = Math.round((y - top) * 1.3);
      grid.fillRect(centre - half, y, half * 2 + 1, 1, y < top + PEAK.snow - ((index * 5) % 4) ? 'w' : 'r');
      // The shaded right side of the peak.
      grid.fillRect(centre + 1, y, half, 1, y < top + PEAK.snow - ((index * 5) % 4) ? 'W' : 'R');
    }
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 20 } as const;
const HALL = { every: 190, width: 110, height: 44, roof: 16 } as const;
const TOWER = { offset: 140, width: 26, height: 70 } as const;
const FLAG = { every: 60, pole: 84, sag: 10, width: 5, height: 6 } as const;
const FLAG_COLOURS = ['1', '2', '3', '4', '5'] as const;

/**
 * The temple buildings. Each frame the bell swings one step further, the prayer flags flutter
 * the other way, and the incense smoke curls a little higher.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 4;
  grid.fillRect(0, ground, width, 4, 'd');

  // The flags first, strung high above the roofs, so the buildings stand in front of their poles.
  prayerFlags(grid, width, ground - FLAG.pole, frame);
  for (let left = 10; left < width; left += HALL.every) {
    hall(grid, left, ground);
    bellTower(grid, left + TOWER.offset, ground, frame);
  }
  // Incense smoke rising in a curl from a burner in front of each hall.
  for (let x = 65; x < width; x += HALL.every) {
    for (let y = ground - 12; y > ground - 60; y -= 2) {
      const curl = Math.round(Math.sin((y + frame * 4) * 0.25) * 3);
      grid.plot(x + curl, y, (y + frame) % 6 < 3 ? 'v' : 'V');
    }
    grid.fillRect(x - 4, ground - 10, 9, 10, 'z');
  }
  return grid.toPixelMap();
}

/** A temple hall: dark walls between red pillars, and a tiled roof with upturned eaves. */
function hall(grid: PixelGrid, left: number, ground: number): void {
  const top = ground - HALL.height;
  grid.fillRect(left, top, HALL.width, HALL.height, 'k');
  for (let x = left + 4; x < left + HALL.width; x += 18) grid.fillRect(x, top, 4, HALL.height, 'p');
  // Paper screens between the pillars, lit from inside.
  for (let x = left + 10; x < left + HALL.width - 10; x += 18) grid.fillRect(x, top + 10, 8, 20, 'l');
  const roofTop = top - HALL.roof;
  for (let row = 0; row < HALL.roof; row++) {
    const inset = HALL.roof - row;
    grid.fillRect(left - 6 + inset, roofTop + row, HALL.width + 12 - inset * 2, 1, row % 3 === 0 ? 'T' : 't');
  }
  // The eaves curl up at both ends.
  for (let lift = 0; lift < 4; lift++) {
    grid.plot(left - 6 - lift, top - 1 - lift, 't');
    grid.plot(left + HALL.width + 5 + lift, top - 1 - lift, 't');
  }
}

/** A bell tower: two posts, a small roof, and the bell hanging between them, swinging. */
function bellTower(grid: PixelGrid, left: number, ground: number, frame: number): void {
  const top = ground - TOWER.height;
  for (const x of [left, left + TOWER.width - 3]) grid.fillRect(x, top, 3, TOWER.height, 'p');
  grid.fillRect(left - 5, top - 4, TOWER.width + 10, 4, 't');
  grid.fillRect(left, top + 4, TOWER.width, 2, 'P');
  const swing = [-2, 0, 2][frame] ?? 0;
  const bellX = left + TOWER.width / 2 + swing;
  grid.fillRect(Math.round(bellX), top + 6, 1, 4, 'P');
  fillCircle(grid, Math.round(bellX), top + 16, 6, 'b', top + 20);
  grid.fillRect(Math.round(bellX) - 7, top + 20, 15, 2, 'B');
}

/** Ropes of little flags in five colours, sagging between poles, flicking one way then the other. */
function prayerFlags(grid: PixelGrid, width: number, top: number, frame: number): void {
  for (let x = 0; x < width; x += FLAG.every) grid.fillRect(x, top, 2, FLAG.pole, 'P');
  for (let x = 0, index = 0; x < width; x += FLAG.width + 2, index++) {
    const along = (x % FLAG.every) / FLAG.every;
    const y = top + 2 + Math.round(FLAG.sag * 4 * along * (1 - along));
    grid.plot(x, y, 'P');
    const flick = (index + frame) % 2;
    grid.fillRect(x + 1 + flick, y + 1, FLAG.width - 1, FLAG.height - flick, FLAG_COLOURS[index % FLAG_COLOURS.length] ?? '1');
  }
}

const WALL = { top: 124, height: 16 } as const;

/** A low wall of grey stone blocks, with a coping of rounded stones along its top. */
function wall(): PixelMap {
  const grid = new PixelGrid(STAGE.width, WALL.height);
  grid.fillRect(0, 3, STAGE.width, WALL.height - 3, 's');
  for (let y = 3, row = 0; y < WALL.height; y += 5, row++) {
    grid.fillRect(0, y, STAGE.width, 1, 'S');
    for (let x = row % 2 === 0 ? 0 : 8; x < STAGE.width; x += 16) grid.fillRect(x, y, 1, 5, 'S');
  }
  for (let x = 0; x < STAGE.width; x += 6) grid.fillRect(x, 0, 5, 3, 'c');
  return grid.toPixelMap();
}

const FLAGSTONE = { width: 26, height: 10 } as const;
const BURNER = { width: 16, height: 18 } as const;

/** Worn flagstones with dark joints, and a bronze incense burner on legs at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'j');
  for (let y = 0, row = 0; y < height; y += FLAGSTONE.height, row++) {
    const offset = (row * 9) % FLAGSTONE.width;
    for (let x = -offset, stone = 0; x < STAGE.width; x += FLAGSTONE.width, stone++) {
      grid.fillRect(x, y, FLAGSTONE.width - 1, FLAGSTONE.height - 1, (stone + row) % 3 === 0 ? 'F' : 'f');
    }
  }
  for (const x of [0, STAGE.width - BURNER.width]) {
    grid.fillRect(x + 2, 4, BURNER.width - 4, 9, 'b');
    grid.fillRect(x, 2, BURNER.width, 3, 'B');
    grid.fillRect(x + 5, 6, BURNER.width - 10, 2, 'y');
    for (const leg of [x + 3, x + BURNER.width - 5]) grid.fillRect(leg, 13, 2, BURNER.height - 13, 'B');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'peaks', ...FAR, frames: [farLayer()] },
  { name: 'temple', ...MID, frames: Array.from({ length: FRAMES }, (_, frame) => midFrame(frame)), frameRate: 3 },
  { name: 'wall', scroll: 1, top: WALL.top, frames: [wall()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const MONASTERY: ArenaDefinition = {
  id: 'monastery',
  name: 'MONASTERY COURTYARD',
  sky: ['#4a4a78', '#6a5a82', '#8a6a84', '#aa7a7e', '#c88a74', '#e09c68', '#f0b060', '#f8c460'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: WALL.top + WALL.height - 1,
    spots: [16, 34, 52, 70, 88, 106, 124, 142, 160, 178, 196, 214, 232, 250, 268, 286, 304, 322, 340, 358, 376, 394, 412, 430, 448, 466, 484],
    people: [
      // Monks, shaven-headed, in saffron and maroon robes.
      createPerson({ shirt: '6', skin: 'x', hair: 'x', legs: '6', outline }),
      createPerson({ shirt: '7', skin: 'X', hair: 'X', legs: '7', outline }),
      createPerson({ shirt: '6', skin: 'X', hair: 'X', legs: '6', outline }),
      createPerson({ shirt: '7', skin: 'x', hair: 'x', legs: '7', outline }),
    ],
  },
  palette: {
    w: '#f4f4f8',
    W: '#c4c8d8',
    r: '#6a6a88',
    R: '#4e4e6a',
    d: '#3a2e2a',
    k: '#2a2024',
    p: '#a8281e',
    P: '#5a2a1a',
    l: '#f4dca0',
    t: '#3a4a5a',
    T: '#56687a',
    b: '#b07a2a',
    B: '#7a5018',
    v: '#e8e4e0',
    V: '#b8b4b0',
    z: '#5a4a3a',
    s: '#8a8680',
    S: '#6a6660',
    c: '#a8a49c',
    j: '#4a4640',
    f: '#8e8a80',
    F: '#7e7a70',
    y: '#ffb040',
    1: '#3a6ad8',
    2: '#f4f4f4',
    3: '#d8342c',
    4: '#3aa84a',
    5: '#f4c430',
    6: '#d88a2a',
    7: '#7a2a2a',
    x: '#d8a47c',
    X: '#a0704e',
    o: '#1a1416',
  },
};
