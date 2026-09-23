import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The tower roof, where Magnus Vane waits at the end of arcade mode: the very top of his tower
 * in Vanmoor, so high that the city is out of sight under a sea of cloud, with only the tips of
 * the next towers breaking through it. Back to front: a black sky full of stars, the cloud sea
 * rolling below with the far spires standing in it, a stone parapet with gold crown points where
 * his people watch from, and a floor of great pale flagstones with the Iron Crown laid into them
 * in gold and a brazier burning at each end.
 *
 * It is the only arena with no city, no daylight and nobody cheering close by: there is nothing
 * up here but the two of them.
 */

const HORIZON_Y = 100;
const GROUND_Y = 140;
const FRAMES = 3;

const STARS = { scroll: 0.12, top: 0 } as const;

/** A still, black sky: stars in drifts, thicker away from the glow rising off the cloud. */
function starLayer(): PixelMap {
  const width = layerWidth(STARS.scroll);
  const bottom = HORIZON_Y + 6;
  const grid = new PixelGrid(width, bottom);
  for (let x = 0; x < width; x++) {
    for (let y = 2; y < bottom - 6; y++) {
      // A sparse scatter that thins out towards the horizon, where the cloud glow washes it out.
      const sparse = (x * 7 + y * 13) % Math.max(11, 90 - y) === 0;
      if (sparse) grid.plot(x, y, (x + y) % 3 === 0 ? 'w' : 'W');
    }
  }
  // The glow the hidden city throws up onto the underside of the sky.
  for (let row = 0; row < 6; row++) grid.fillRect(0, bottom - 6 + row, width, 1, row < 3 ? 'G' : 'g');
  return grid.toPixelMap();
}

const CLOUDS = { scroll: 0.4, top: 72, banks: 3, spireEvery: 131 } as const;

/**
 * The cloud sea seen from above: banks of cloud whose tops lump and roll, lit orange underneath
 * by the city they are hiding, with the tips of the neighbouring towers standing out of them.
 */
function cloudFrame(frame: number): PixelMap {
  const width = layerWidth(CLOUDS.scroll);
  const height = GROUND_Y - CLOUDS.top;
  const grid = new PixelGrid(width, height);
  const drift = frame * 3;

  // The spires first, so the cloud closes over their feet as it is drawn on top.
  for (let x = 34; x < width; x += CLOUDS.spireEvery) spire(grid, x, height);

  for (let bank = 0; bank < CLOUDS.banks; bank++) {
    const base = 12 + bank * 11;
    for (let x = 0; x < width; x++) {
      const roll = Math.sin((x + drift * (bank + 1)) * 0.07 + bank * 2) * 3 + Math.sin((x + drift) * 0.021) * 2.5;
      const top = Math.round(base + roll);
      grid.fillRect(x, top, 1, height - top, bank % 2 === 0 ? 'C' : 'c');
      grid.plot(x, top, 'l');
    }
  }
  // Nearest the parapet the cloud is lit from below by everything under it.
  for (let row = 0; row < 7; row++) grid.fillRect(0, height - 7 + row, width, 1, row < 3 ? 'u' : 'U');
  return grid.toPixelMap();
}

/** A neighbouring tower standing out of the cloud: a dark taper with a few lit windows and a gold point. */
function spire(grid: PixelGrid, centerX: number, height: number): void {
  const top = 3;
  for (let y = top; y < height; y++) {
    const half = 1 + Math.floor((y - top) / 8);
    grid.fillRect(centerX - half, y, half * 2 + 1, 1, 'k');
    if ((y - top) % 7 === 4) grid.plot(centerX + ((y % 14 < 7 ? -1 : 1) * half), y, 'l');
  }
  grid.fillRect(centerX, top - 3, 1, 3, 'n');
}

const PARAPET = { top: 116, height: 24, wallTop: 10, merlonEvery: 34 } as const;

/** The roof's parapet: capped stone with a gold crown point standing on every merlon. */
function parapet(): PixelMap {
  const grid = new PixelGrid(STAGE.width, PARAPET.height);
  grid.fillRect(0, PARAPET.wallTop, STAGE.width, PARAPET.height - PARAPET.wallTop, 's');
  grid.fillRect(0, PARAPET.wallTop, STAGE.width, 2, 'l');
  for (let y = PARAPET.wallTop + 6; y < PARAPET.height; y += 6) grid.fillRect(0, y, STAGE.width, 1, 'd');
  for (let x = 5; x < STAGE.width; x += PARAPET.merlonEvery) {
    grid.fillRect(x, PARAPET.wallTop - 5, 8, 5, 'S');
    grid.fillRect(x, PARAPET.wallTop - 5, 8, 1, 'l');
    // The crown point on top of it, the same gold as everything else he owns.
    for (let step = 0; step < 4; step++) grid.fillRect(x + 3 - Math.floor(step / 2), PARAPET.wallTop - 9 + step, 1 + (step % 2), 1, 'n');
  }
  return grid.toPixelMap();
}

const BRAZIER = { width: 13, height: 19, flame: 8 } as const;
const FLOOR_LINE = STAGE.floorY - GROUND_Y;
const INLAY = { halfWidth: 38, points: 5, pointHeight: 5 } as const;

/** Great pale flagstones, the Iron Crown laid into them in gold, and a brazier at each end. */
function floorFrame(frame: number): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  // Slabs far bigger than any other arena's: nothing up here was built cheaply.
  for (let y = 0, row = 0; y < height; y += 13, row++) {
    grid.fillRect(0, y, STAGE.width, 1, 'F');
    for (let x = (row * 29) % 58; x < STAGE.width; x += 58) grid.fillRect(x, y, 1, 13, 'F');
  }
  crownInlay(grid, Math.floor(STAGE.width / 2), FLOOR_LINE + 8);
  for (const x of [5, STAGE.width - BRAZIER.width - 5]) brazier(grid, x, frame);
  return grid.toPixelMap();
}

/** The crown itself, laid flat into the floor across the middle of the arena: a band and its points. */
function crownInlay(grid: PixelGrid, centerX: number, y: number): void {
  grid.fillRect(centerX - INLAY.halfWidth, y, INLAY.halfWidth * 2, 3, 'n');
  grid.fillRect(centerX - INLAY.halfWidth, y + 3, INLAY.halfWidth * 2, 1, 'N');
  const spacing = (INLAY.halfWidth * 2 - 8) / (INLAY.points - 1);
  for (let point = 0; point < INLAY.points; point++) {
    const x = Math.round(centerX - INLAY.halfWidth + 4 + point * spacing);
    for (let step = 0; step < INLAY.pointHeight; step++) {
      const width = step + 1;
      grid.fillRect(x - Math.floor(width / 2), y - INLAY.pointHeight + step, width, 1, step === 0 ? 'N' : 'n');
    }
  }
}

/** An iron bowl on a stem with a fire in it, leaning a different way in each frame. */
function brazier(grid: PixelGrid, left: number, frame: number): void {
  const base = FLOOR_LINE;
  const bowlY = base - BRAZIER.height + BRAZIER.flame;
  for (let height = 0; height < BRAZIER.flame; height++) {
    const lean = Math.round(Math.sin((height + frame * 2) * 0.8) * 1.7);
    const width = Math.max(1, BRAZIER.flame - 1 - height);
    const symbol = height < 2 ? 'w' : height < 5 ? 'y' : 'r';
    grid.fillRect(left + 6 + lean - Math.floor(width / 2), bowlY - 1 - height, width, 1, symbol);
  }
  grid.fillRect(left, bowlY, BRAZIER.width, 3, 'b');
  grid.fillRect(left + 2, bowlY + 3, BRAZIER.width - 4, 2, 'B');
  grid.fillRect(left + 5, bowlY + 5, 3, base - bowlY - 5, 'B');
  grid.fillRect(left + 2, base - 2, 9, 2, 'b');
}

const layers: readonly ArenaLayer[] = [
  { name: 'stars', ...STARS, frames: [starLayer()] },
  { name: 'clouds', scroll: CLOUDS.scroll, top: CLOUDS.top, frames: Array.from({ length: FRAMES }, (_, frame) => cloudFrame(frame)), frameRate: 2 },
  { name: 'parapet', scroll: 1, top: PARAPET.top, frames: [parapet()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: Array.from({ length: FRAMES }, (_, frame) => floorFrame(frame)), frameRate: 8, inFrontOfCrowd: true },
];

const outline = 'o';

export const TOWER_ROOF: ArenaDefinition = {
  id: 'towerRoof',
  name: 'TOWER ROOF',
  sky: ['#020209', '#04040e', '#060615', '#08081c', '#0b0a24', '#0e0d2c', '#131034', '#19143c'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: PARAPET.top + PARAPET.height - 2,
    // His own people, in his colours, spaced out and standing still: this is not a crowd that shouts.
    spots: [26, 60, 94, 128, 162, 196, 230, 264, 298, 332, 366, 400, 434, 468],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: '2', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: '1', legs: 'j', outline }),
      createPerson({ shirt: '1', skin: 'X', hair: '3', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: '2', legs: 'j', outline }),
    ],
  },
  palette: {
    w: '#ffffff',
    W: '#9aa0c0',
    g: '#6a4a3a',
    G: '#3a2a2e',
    c: '#4a4a68',
    C: '#3a3a54',
    l: '#8a8aa8',
    u: '#8a5a44',
    U: '#5a3a34',
    k: '#0a0a14',
    n: '#f0cc60',
    N: '#a07c28',
    s: '#8a8698',
    S: '#6a6678',
    d: '#4a4658',
    f: '#b0acb8',
    F: '#8e8a98',
    b: '#2a2632',
    B: '#1a1620',
    y: '#ffb03a',
    r: '#e4572e',
    1: '#2a2440',
    2: '#6a1a2a',
    3: '#3a3050',
    x: '#c8a07c',
    X: '#8a6a4e',
    j: '#1a1824',
    o: '#05050c',
  },
};
