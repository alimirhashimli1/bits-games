import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The night-market wrestling ring, Cometa's home arena: a ring set up between the food stalls
 * after dark. Back to front: a deep blue sky over the market's roofs, stalls with striped awnings
 * and griddles steaming under strings of bulbs that blink along the line, the crowd packed in
 * close, the near ropes of the ring strung in front of them, and a canvas floor with the house
 * comet painted across the middle and a corner post at each end.
 */

const HORIZON_Y = 96;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.15, top: 0 } as const;
const ROOF = { every: 46, width: 40 } as const;

/** The market's roofs and shuttered upper windows against the night. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 8;
  const grid = new PixelGrid(width, bottom);
  for (let x = 0, index = 0; x < width; x += ROOF.every, index++) {
    const height = 26 + ((index * 17) % 22);
    const top = bottom - height;
    grid.fillRect(x, top, ROOF.width, height, 'k');
    grid.fillRect(x - 2, top, ROOF.width + 4, 3, 'K');
    for (let wx = x + 5; wx < x + ROOF.width - 6; wx += 12) {
      grid.fillRect(wx, top + 8, 7, 9, (wx + index) % 3 === 0 ? 'l' : 'K');
    }
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 20 } as const;
const STALL = { every: 84, width: 62, height: 34, awning: 8 } as const;
const BULB = { every: 11, sag: 7, span: 84 } as const;

/**
 * The stalls: striped awnings over lit counters, a griddle steaming away at every other one, and
 * strings of bulbs above them whose lit bulb runs along the line, one along each frame.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 6;

  for (let left = 8, index = 0; left < width; left += STALL.every, index++) {
    const top = ground - STALL.height;
    grid.fillRect(left, top, STALL.width, STALL.height, 'd');
    grid.fillRect(left + 3, top + 12, STALL.width - 6, 12, 'l');
    // The awning, in stripes, with a scalloped edge.
    for (let x = left - 3; x < left + STALL.width + 3; x++) {
      grid.fillRect(x, top - STALL.awning, 1, STALL.awning, Math.floor((x - left) / 5) % 2 === 0 ? 'r' : 'w');
      if ((x - left) % 5 === 2) grid.plot(x, top, Math.floor((x - left) / 5) % 2 === 0 ? 'r' : 'w');
    }
    grid.fillRect(left, ground - 10, STALL.width, 3, 'D');
    // Every other stall has a griddle with steam curling off it.
    if (index % 2 === 0) {
      grid.fillRect(left + 12, ground - 16, 22, 6, 'g');
      for (let y = ground - 18; y > ground - 34; y -= 2) {
        const curl = Math.round(Math.sin((y + frame * 3) * 0.3) * 3);
        grid.plot(left + 22 + curl, y, (y + frame) % 4 < 2 ? 'v' : 'V');
      }
    }
  }

  // Strings of bulbs above the stalls, one bulb lit brightly at a time.
  const wireTop = 6;
  for (let start = 0; start < width; start += BULB.span) {
    for (let x = start; x < start + BULB.span && x < width; x++) {
      const along = (x - start) / BULB.span;
      grid.plot(x, wireTop + Math.round(BULB.sag * 4 * along * (1 - along)), 'c');
    }
    for (let x = start + 4, bulb = 0; x < start + BULB.span; x += BULB.every, bulb++) {
      const along = (x - start) / BULB.span;
      const y = wireTop + Math.round(BULB.sag * 4 * along * (1 - along)) + 1;
      grid.fillRect(x, y, 2, 2, (bulb + frame) % FRAMES === 0 ? 'W' : 'y');
    }
  }
  grid.fillRect(0, ground, width, height - ground, 'e');
  return grid.toPixelMap();
}

const ROPES = { top: 118, height: 22, gap: 7 } as const;

/** The near ropes: three lines strung across in front of the crowd, the middle one red. */
function ropes(): PixelMap {
  const grid = new PixelGrid(STAGE.width, ROPES.height);
  for (let rope = 0; rope < 3; rope++) {
    const y = 1 + rope * ROPES.gap;
    grid.fillRect(0, y, STAGE.width, 2, rope === 1 ? 'R' : 'w');
  }
  return grid.toPixelMap();
}

const POST = { width: 10, height: 34, pad: 14 } as const;
const COMET = { headRadius: 7, tailLength: 62, tailWidth: 11 } as const;

/** The canvas: taped seams, the house comet painted across the middle, and a padded corner post at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'n');
  grid.fillRect(0, 0, STAGE.width, 1, 'N');
  for (let x = 0; x < STAGE.width; x += 64) grid.fillRect(x, 0, 1, height, 'N');
  for (let x = 0; x < STAGE.width; x++) if ((x * 7) % 23 === 0) grid.plot(x, 4 + ((x * 3) % (height - 6)), 'N');

  comet(grid, Math.round(STAGE.width / 2 + COMET.tailLength / 3), Math.round(height / 2));

  for (const x of [0, STAGE.width - POST.width]) {
    grid.fillRect(x, 0, POST.width, POST.height, 'p');
    grid.fillRect(x + 1, 0, POST.width - 2, POST.pad, 'R');
    grid.fillRect(x + 1, POST.pad, POST.width - 2, 2, 'w');
  }
  return grid.toPixelMap();
}

/**
 * The house comet painted across the canvas: a solid head with a bright core, ringed in gold,
 * with a tail streaming out behind it that narrows and breaks up into flecks as it goes. The
 * promotion is named after the fighter who wrestles here, so his comet is painted on their floor.
 */
function comet(grid: PixelGrid, headX: number, headY: number): void {
  // The tail first, so the head is painted over its thick end.
  for (let along = 0; along < COMET.tailLength; along++) {
    const x = headX - COMET.headRadius - along;
    const fade = along / COMET.tailLength;
    const halfHeight = (COMET.tailWidth / 2) * (1 - fade);
    // It lifts a little as it trails away, the way a comet's tail is swept off to one side.
    const lift = Math.round(fade * 5);
    for (let offset = -halfHeight; offset <= halfHeight; offset++) {
      const y = Math.round(headY - lift + offset);
      // The far half of the tail is broken into flecks rather than painted solid.
      if (fade > 0.45 && (x * 3 + y * 5) % 4 !== 0) continue;
      grid.plot(x, y, Math.abs(offset) < halfHeight - 1.5 ? 'r' : 'y');
    }
  }
  fillCircle(grid, headX, headY, COMET.headRadius, 'y');
  fillCircle(grid, headX, headY, COMET.headRadius - 2, 'r');
  fillCircle(grid, headX - 1, headY - 1, 2, 'W');
}

const layers: readonly ArenaLayer[] = [
  { name: 'market', ...FAR, frames: [farLayer()] },
  { name: 'stalls', ...MID, frames: Array.from({ length: FRAMES }, (_, frame) => midFrame(frame)), frameRate: 5 },
  { name: 'ropes', scroll: 1, top: ROPES.top, frames: [ropes()], inFrontOfCrowd: true },
  { name: 'canvas', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const RING: ArenaDefinition = {
  id: 'ring',
  name: 'NIGHT-MARKET RING',
  sky: ['#0a0a22', '#0e0e2a', '#121232', '#16163a', '#1a1a42', '#1f204a', '#242652', '#2a2c5a'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: ROPES.top + ROPES.height - 1,
    spots: [12, 29, 46, 63, 80, 97, 114, 131, 148, 165, 182, 199, 216, 233, 250, 267, 284, 301, 318, 335, 352, 369, 386, 403, 420, 437, 454, 471, 488],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    k: '#171734',
    K: '#232348',
    l: '#f0d890',
    d: '#3a2e3a',
    D: '#584250',
    r: '#d8342c',
    w: '#f0ece0',
    W: '#fff8c0',
    y: '#c8a038',
    c: '#4a4a5a',
    g: '#6a6a72',
    v: '#d8d4d0',
    V: '#a8a4a0',
    e: '#2a2436',
    n: '#c8c0a8',
    N: '#a89c84',
    p: '#8a8a94',
    R: '#d8342c',
    1: '#c84a3a',
    2: '#3a6ad8',
    3: '#4aa85a',
    4: '#d8a83a',
    5: '#8a4ac8',
    x: '#e0a47c',
    X: '#9a6a48',
    z: '#2a1e16',
    Z: '#5e4632',
    j: '#2a2420',
    o: '#0a0a14',
  },
};
