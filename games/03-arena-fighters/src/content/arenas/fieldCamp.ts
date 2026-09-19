import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The field camp at dusk, Osal's home arena. Back to front: a hazy evening sky over dark hills,
 * rows of canvas tents with the medical tent flying a flag with a green cross that ripples in
 * the wind, supply crates and a lantern on a pole, soldiers in helmets behind a wall of
 * sandbags, and a dirt floor rutted with tyre tracks, with a stack of crates at each end.
 */

const HORIZON_Y = 108;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;

/** Rolling hills, darker the nearer they are. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);
  for (const [height, period, symbol] of [[40, 90, 'h'], [24, 60, 'H']] as const) {
    for (let x = 0; x < width; x++) {
      const top = HORIZON_Y + 4 - height + Math.round((height / 3) * Math.sin((2 * Math.PI * x) / period));
      grid.fillRect(x, top, 1, HORIZON_Y + 4 - top, symbol);
    }
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 60 } as const;
const TENT = { width: 50, height: 30, spacing: 78 } as const;
const FLAG = { width: 18, height: 12 } as const;

/**
 * Canvas tents in a row, crates, and a lantern on a pole. The medical tent's flag ripples: on
 * the second frame its fly edge lifts. The lantern's glow flickers.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 2;

  for (let x = 10, index = 0; x < width; x += TENT.spacing, index++) {
    const top = ground - TENT.height;
    for (let row = 0; row < TENT.height; row++) {
      const half = Math.round((TENT.width / 2) * ((row + 4) / (TENT.height + 4)));
      grid.fillRect(x + TENT.width / 2 - half, top + row, half * 2, 1, row % 6 === 5 ? 'T' : 't');
    }
    grid.fillRect(x + TENT.width / 2 - 4, ground - 14, 8, 14, 'd');
    if (index % 3 !== 1) continue;

    // The medical tent's flag: a white field with a green cross, rippling.
    const poleX = x + TENT.width / 2;
    const flagTop = top - 24;
    grid.fillRect(poleX, flagTop, 1, 24, 'd');
    for (let fx = 0; fx < FLAG.width; fx++) {
      const ripple = Math.round(Math.sin((fx + frame * 3) / 3) * (fx / FLAG.width) * 2);
      grid.fillRect(poleX + 1 + fx, flagTop + ripple, 1, FLAG.height, 'W');
      const crossColumn = fx >= 7 && fx <= 10;
      if (crossColumn) grid.fillRect(poleX + 1 + fx, flagTop + ripple + 2, 1, FLAG.height - 4, 'g');
      else if (fx >= 4 && fx <= 13) grid.fillRect(poleX + 1 + fx, flagTop + ripple + 5, 1, 2, 'g');
    }
  }

  // Crates and a lantern on a pole.
  for (let x = 60; x < width; x += 150) {
    grid.fillRect(x, ground - 12, 14, 12, 'c');
    grid.fillRect(x + 16, ground - 8, 10, 8, 'c');
    grid.fillRect(x + 3, ground - 16, 10, 4, 'C');
    for (const edge of [x, x + 13, x + 16, x + 25]) grid.fillRect(edge, ground - 12, 1, 12, 'C');
    const poleX = x + 34;
    grid.fillRect(poleX, ground - 34, 2, 34, 'd');
    fillCircle(grid, poleX + 1, ground - 36, 4 + frame, 'y');
    grid.fillRect(poleX - 1, ground - 38, 4, 4, 'Y');
  }
  grid.fillRect(0, ground, width, 2, 'd');
  return grid.toPixelMap();
}

const SANDBAGS = { top: 128, height: 12, bag: 12 } as const;

/** A wall of sandbags, three rows high, each row offset from the last. */
function sandbags(): PixelMap {
  const grid = new PixelGrid(STAGE.width, SANDBAGS.height);
  for (let row = 0; row < 3; row++) {
    const offset = row % 2 === 0 ? 0 : SANDBAGS.bag / 2;
    for (let x = -offset; x < STAGE.width; x += SANDBAGS.bag) {
      grid.fillRect(x + 1, row * 4, SANDBAGS.bag - 2, 4, 's');
      grid.fillRect(x + 1, row * 4 + 3, SANDBAGS.bag - 2, 1, 'S');
    }
  }
  return grid.toPixelMap();
}

const STACK = { width: 16, height: 18 } as const;

/** Dirt churned by tyres, and a stack of supply crates at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  for (const trackY of [8, 14, 26, 32]) {
    for (let x = 0; x < STAGE.width; x += 3) grid.fillRect(x, trackY, 2, 2, 'F');
  }
  for (let clod = 0; clod < 120; clod++) grid.plot((clod * 83 + 29) % STAGE.width, (clod * 17) % height, 'F');
  for (const x of [0, STAGE.width - STACK.width]) {
    grid.fillRect(x, 0, STACK.width, STACK.height, 'c');
    grid.fillRect(x, STACK.height / 2, STACK.width, 1, 'C');
    grid.fillRect(x, 0, 1, STACK.height, 'C');
    grid.fillRect(x + STACK.width - 1, 0, 1, STACK.height, 'C');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farLayer()] },
  { name: 'tents', ...MID, frames: [midFrame(0), midFrame(1)], frameRate: 2 },
  { name: 'sandbags', scroll: 1, top: SANDBAGS.top, frames: [sandbags()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

/** The soldiers' helmets are the hair colour. */
const outline = 'o';

export const FIELD_CAMP: ArenaDefinition = {
  id: 'fieldCamp',
  name: 'FIELD CAMP',
  sky: ['#2a2a44', '#363450', '#46405a', '#584a60', '#6c5664', '#806266', '#946e66', '#a47a66'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: SANDBAGS.top + SANDBAGS.height - 1,
    spots: [18, 34, 52, 68, 86, 102, 120, 136, 154, 170, 188, 204, 222, 238, 256, 272, 290, 306, 324, 340, 358, 374, 392, 408, 426, 442, 460, 476, 494],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '1', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'x', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    h: '#3a3448',
    H: '#2a2636',
    t: '#6a6a42',
    T: '#56562f',
    d: '#3a3024',
    W: '#ecece4',
    g: '#2a9a5a',
    c: '#7a6040',
    C: '#54402a',
    y: '#6a5a30',
    Y: '#ffd070',
    s: '#b8a47a',
    S: '#8a7856',
    f: '#6a5a44',
    F: '#56483a',
    1: '#5a6038',
    2: '#6a6a4a',
    x: '#d8a07a',
    X: '#8e5e40',
    z: '#3a4a2a',
    Z: '#2e3a22',
    j: '#4a4a36',
    o: '#12100e',
  },
};
