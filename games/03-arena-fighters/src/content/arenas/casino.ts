import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The casino hall, Rajab's home arena. Back to front: deep red walls with gold panelling and
 * chandeliers whose crystals twinkle, a row of slot machines with blinking lights beside green
 * card tables, gamblers in their evening best behind a velvet rope on brass posts, and a red
 * carpet patterned with gold diamonds, with a marble column at each end.
 */

const HORIZON_Y = 100;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;
const PANEL = { width: 34, top: 20 } as const;

/** Gold-framed wall panels, and chandeliers that twinkle between frames. */
function farFrame(frame: number): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);
  for (let x = 4; x < width; x += PANEL.width + 6) {
    grid.fillRect(x, PANEL.top, PANEL.width, HORIZON_Y - PANEL.top, 'y');
    grid.fillRect(x + 2, PANEL.top + 2, PANEL.width - 4, HORIZON_Y - PANEL.top - 4, 'r');
  }
  for (let x = 40, index = 0; x < width; x += 90, index++) {
    grid.fillRect(x, 0, 1, 10, 'y');
    fillCircle(grid, x, 14, 6, 'y', 16);
    for (let crystal = -6; crystal <= 6; crystal += 3) {
      const lit = (crystal + index + frame * 3) % 2 === 0;
      grid.fillRect(x + crystal, 17, 1, 3, lit ? 'W' : 'Y');
    }
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 64 } as const;
const SLOT = { width: 16, height: 30, spacing: 22 } as const;
const TABLE = { width: 44, height: 8 } as const;

/**
 * Slot machines in a row, their lights blinking in turn, and green card tables between them
 * with a few cards dealt out.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 2;

  for (let x = 6, index = 0; x < width; index++) {
    if (index % 4 === 3) {
      // A card table.
      const top = ground - 14;
      grid.fillRect(x, top, TABLE.width, TABLE.height, 'G');
      grid.fillRect(x + 1, top + 1, TABLE.width - 2, TABLE.height - 3, 'g');
      for (let card = 0; card < 4; card++) grid.fillRect(x + 8 + card * 8, top + 2, 4, 3, 'W');
      grid.fillRect(x + 4, top + TABLE.height, 3, 6, 'D');
      grid.fillRect(x + TABLE.width - 7, top + TABLE.height, 3, 6, 'D');
      x += TABLE.width + 8;
      continue;
    }
    const top = ground - SLOT.height;
    grid.fillRect(x, top, SLOT.width, SLOT.height, 'm');
    grid.fillRect(x, top, SLOT.width, 3, 'y');
    grid.fillRect(x + 2, top + 8, SLOT.width - 4, 7, 'W');
    for (let reel = 0; reel < 3; reel++) grid.plot(x + 4 + reel * 4, top + 11, (reel + index) % 2 === 0 ? 'R' : 'k');
    grid.fillRect(x + SLOT.width, top + 10, 2, 8, 'k');
    for (let bulb = 0; bulb < 4; bulb++) {
      const lit = (bulb + index + frame) % 2 === 0;
      grid.plot(x + 2 + bulb * 4, top + 4, lit ? 'Y' : 'k');
    }
    x += SLOT.spacing;
  }
  return grid.toPixelMap();
}

const ROPE = { top: 126, height: 14, post: 48 } as const;

/** A velvet rope sagging between brass posts. */
function rope(): PixelMap {
  const grid = new PixelGrid(STAGE.width, ROPE.height);
  for (let x = 8; x < STAGE.width; x += ROPE.post) {
    grid.fillRect(x, 2, 3, ROPE.height - 2, 'y');
    grid.fillRect(x - 1, 0, 5, 3, 'Y');
    grid.fillRect(x - 2, ROPE.height - 2, 7, 2, 'y');
    for (let dx = 0; dx < ROPE.post; dx++) {
      grid.plot(x + 3 + dx, 3 + Math.round(4 * Math.sin((Math.PI * dx) / ROPE.post)), 'R');
    }
  }
  return grid.toPixelMap();
}

const DIAMOND = 16;
const COLUMN = { width: 12, height: 22 } as const;

/** Red carpet with a lattice of gold diamonds, and a marble column at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'c');
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < STAGE.width; x++) {
      const u = (x + y) % DIAMOND;
      const v = (x - y + DIAMOND * 64) % DIAMOND;
      if (u === 0 || v === 0) grid.plot(x, y, 'C');
    }
  }
  for (const x of [0, STAGE.width - COLUMN.width]) {
    grid.fillRect(x, 0, COLUMN.width, COLUMN.height, 'n');
    for (let fluting = 2; fluting < COLUMN.width; fluting += 3) grid.fillRect(x + fluting, 2, 1, COLUMN.height - 2, 'N');
    grid.fillRect(x, 0, COLUMN.width, 2, 'y');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farFrame(0), farFrame(1)], frameRate: 2 },
  { name: 'slots', ...MID, frames: [midFrame(0), midFrame(1)], frameRate: 3 },
  { name: 'rope', scroll: 1, top: ROPE.top, frames: [rope()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const CASINO: ArenaDefinition = {
  id: 'casino',
  name: 'CASINO HALL',
  sky: ['#1e0810', '#260a14', '#300c18', '#3a0f1c', '#44121f', '#4e1522', '#581826', '#621b2a'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: ROPE.top + ROPE.height - 1,
    spots: [22, 40, 58, 80, 98, 118, 138, 158, 176, 198, 216, 236, 258, 276, 296, 316, 336, 354, 376, 394, 414, 434, 454, 474, 494],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'Z', legs: 'j', outline }),
    ],
  },
  palette: {
    r: '#5a1020',
    y: '#c89a3a',
    Y: '#ffe08a',
    W: '#fff8e0',
    m: '#3a2a4a',
    k: '#140a10',
    R: '#d8342c',
    g: '#1f6a3a',
    G: '#6b4226',
    D: '#3a2418',
    c: '#8e1f2a',
    C: '#c89a3a',
    n: '#e6e0d6',
    N: '#bcb4a8',
    1: '#1a1a22',
    2: '#6a1a2a',
    3: '#e8e0c8',
    4: '#2a3a6a',
    5: '#4a4a52',
    x: '#e0b08a',
    X: '#9a6a48',
    z: '#1c1410',
    Z: '#c8a050',
    j: '#1a1a22',
    o: '#0c0608',
  },
};
