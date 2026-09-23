import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The airfield hangar at night, Rook's home arena. Back to front: the night sky seen through the
 * open hangar doors, a runway whose edge lights blink in a running sequence, the hangar's steel
 * walls and roof truss with lamps hanging from it, a parked propeller plane whose propeller
 * turns over, ground crew in overalls behind a striped barrier, and a painted concrete floor
 * with a stack of tyres at each end.
 */

const HORIZON_Y = 100;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.15, top: 0 } as const;
const RUNWAY = { lightEvery: 12, y: HORIZON_Y - 2 } as const;

/** The dark airfield outside: a flat horizon, the runway's edge lights running in sequence, and a control tower. */
function farFrame(frame: number): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 4;
  const grid = new PixelGrid(width, bottom);
  grid.fillRect(0, RUNWAY.y - 2, width, bottom - RUNWAY.y + 2, 'g');
  for (let x = 3, index = 0; x < width; x += RUNWAY.lightEvery, index++) {
    grid.plot(x, RUNWAY.y, index % FRAMES === frame ? 'Y' : 'y');
    grid.plot(x + 5, RUNWAY.y + 3, 'y');
  }
  // A control tower with a lit cab and a beacon on top.
  const towerX = 120;
  grid.fillRect(towerX, RUNWAY.y - 30, 5, 30, 'g');
  grid.fillRect(towerX - 4, RUNWAY.y - 38, 13, 8, 'g');
  grid.fillRect(towerX - 3, RUNWAY.y - 36, 11, 3, 'l');
  grid.plot(towerX + 2, RUNWAY.y - 40, frame === 0 ? 'R' : 'r');
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 0 } as const;
const DOORS = { every: 150, width: 90 } as const;
const TRUSS = { top: 6, depth: 14, panel: 12 } as const;
const PLANE = { x: 90 } as const;

/**
 * The inside of the hangar: corrugated steel walls with the great doors open onto the airfield,
 * a roof truss hung with lamps that sway a pixel, and a parked plane whose propeller turns.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const floorY = height - 6;

  // Corrugated walls everywhere except where the doors stand open.
  for (let x = 0; x < width; x++) {
    const inDoorway = x % DOORS.every >= 30 && x % DOORS.every < 30 + DOORS.width;
    const wallTop = inDoorway ? TRUSS.top : 0;
    const wallBottom = inDoorway ? TRUSS.top + TRUSS.depth + 8 : floorY;
    grid.fillRect(x, wallTop, 1, wallBottom - wallTop, x % 4 === 0 ? 'W' : 'w');
    // Through the doors, the tarmac runs from the horizon up to the hangar floor.
    if (inDoorway) grid.fillRect(x, HORIZON_Y + 2, 1, floorY - HORIZON_Y - 2, 'g');
  }
  grid.fillRect(0, floorY, width, height - floorY, 'd');

  // The roof truss: two chords with a zigzag of struts between them.
  grid.fillRect(0, TRUSS.top, width, 2, 'k');
  grid.fillRect(0, TRUSS.top + TRUSS.depth, width, 2, 'k');
  for (let x = 0; x < width; x += TRUSS.panel) {
    grid.line([x, TRUSS.top + 1], [x + TRUSS.panel / 2, TRUSS.top + TRUSS.depth], 1, 'k');
    grid.line([x + TRUSS.panel / 2, TRUSS.top + TRUSS.depth], [x + TRUSS.panel, TRUSS.top + 1], 1, 'k');
  }
  // Lamps on long cords, swaying.
  const sway = [0, 1, 0][frame] ?? 0;
  for (let x = 40; x < width; x += 75) {
    grid.fillRect(x, TRUSS.top + TRUSS.depth + 2, 1, 14, 'k');
    grid.fillRect(x - 4 + sway, TRUSS.top + TRUSS.depth + 16, 9, 3, 'k');
    grid.fillRect(x - 3 + sway, TRUSS.top + TRUSS.depth + 19, 7, 1, 'L');
  }
  plane(grid, PLANE.x, floorY, frame);
  return grid.toPixelMap();
}

/** A small propeller plane, nose to the right, standing on its wheels. The propeller turns over. */
function plane(grid: PixelGrid, left: number, floorY: number, frame: number): void {
  const bodyY = floorY - 26;
  // Fuselage, tapering towards the tail, with a tail fin and a tailplane.
  for (let x = 0; x < 80; x++) {
    const thickness = x < 20 ? 4 + Math.round((x / 20) * 6) : 10;
    grid.fillRect(left + x, bodyY + 10 - thickness, 1, thickness, 'p');
    grid.plot(left + x, bodyY + 10 - thickness, 'P');
  }
  grid.fillRect(left + 2, bodyY - 12, 10, 12, 'p');
  grid.fillRect(left, bodyY + 3, 18, 2, 'P');
  // The wing, seen edge on, and the cockpit canopy.
  grid.fillRect(left + 30, bodyY + 6, 44, 3, 'P');
  grid.fillRect(left + 54, bodyY - 4, 10, 4, 'c');
  // A stripe along the side, and the roundel on it.
  grid.fillRect(left + 20, bodyY + 3, 56, 1, 's');
  fillCircle(grid, left + 44, bodyY + 4, 2, 's');
  // Wheels on their struts.
  for (const x of [left + 44, left + 66]) {
    grid.fillRect(x, bodyY + 9, 1, 12, 'k');
    fillCircle(grid, x, floorY - 3, 3, 'k');
  }
  grid.fillRect(left + 4, bodyY + 10, 1, 13, 'k');
  // The nose and its propeller: long and upright, then turned, then edge on.
  const noseX = left + 80;
  grid.fillRect(noseX, bodyY + 3, 3, 5, 'k');
  const blade = [12, 7, 2][frame] ?? 2;
  grid.fillRect(noseX + 3, bodyY + 5 - blade, 1, blade * 2 + 1, 'm');
}

const BARRIER = { top: 126, height: 14, post: 30, stripe: 6 } as const;

/** A barrier rail in yellow and black stripes on short posts, for the crew to stand behind. */
function barrier(): PixelMap {
  const grid = new PixelGrid(STAGE.width, BARRIER.height);
  for (let x = 0; x < STAGE.width; x++) grid.fillRect(x, 2, 1, 4, Math.floor((x + 2) / BARRIER.stripe) % 2 === 0 ? 'y' : 'k');
  for (let x = 8; x < STAGE.width; x += BARRIER.post) grid.fillRect(x, 0, 3, BARRIER.height, 'W');
  return grid.toPixelMap();
}

const TYRES = { width: 18, height: 26, tyre: 7 } as const;

/** Painted concrete with a yellow guide line and skid marks, and a stack of tyres at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  grid.fillRect(0, 0, STAGE.width, 1, 'F');
  for (let x = 0; x < STAGE.width; x += 14) grid.fillRect(x, 16, 8, 2, 'y');
  for (let x = 30; x < STAGE.width; x += 90) grid.fillRect(x, 26 + ((x * 3) % 6), 24, 1, 'F');
  for (const x of [0, STAGE.width - TYRES.width]) {
    for (let y = 0; y < TYRES.height; y += TYRES.tyre) {
      grid.fillRect(x, y, TYRES.width, TYRES.tyre - 1, 'k');
      grid.fillRect(x + 2, y + 2, TYRES.width - 4, 1, 'K');
    }
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'airfield', ...FAR, frames: Array.from({ length: FRAMES }, (_, frame) => farFrame(frame)), frameRate: 4 },
  { name: 'hangar', ...MID, frames: Array.from({ length: FRAMES }, (_, frame) => midFrame(frame)), frameRate: 10 },
  { name: 'barrier', scroll: 1, top: BARRIER.top, frames: [barrier()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const HANGAR: ArenaDefinition = {
  id: 'hangar',
  name: 'AIRFIELD HANGAR',
  sky: ['#060812', '#080b18', '#0a0e1e', '#0c1124', '#0e142a', '#101830', '#131c36', '#16203c'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: BARRIER.top + BARRIER.height - 1,
    spots: [16, 34, 51, 69, 87, 104, 122, 140, 157, 175, 193, 210, 228, 246, 263, 281, 299, 316, 334, 352, 369, 387, 405, 422, 440, 458, 475, 493],
    people: [
      // Ground crew in overalls, some in ear defenders.
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: '1', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: '2', outline }),
      createPerson({ shirt: '1', skin: 'X', hair: 'Z', legs: '1', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: '3', outline }),
    ],
  },
  palette: {
    g: '#141820',
    y: '#f4c430',
    Y: '#fff4b0',
    l: '#f4dca0',
    R: '#ff4a3a',
    r: '#5a1a18',
    w: '#4a525c',
    W: '#5e6670',
    k: '#1c1e24',
    K: '#34363e',
    L: '#fff0c0',
    d: '#3a3e44',
    p: '#8a9a6a',
    P: '#6a7a4e',
    c: '#a8d0e0',
    s: '#e8e4d8',
    m: '#c8ccd4',
    f: '#5a5e62',
    F: '#484c50',
    1: '#e07020',
    2: '#3a5a8a',
    3: '#6a6e3a',
    x: '#e0a47c',
    X: '#9a6a48',
    z: '#2a1e16',
    Z: '#c83a2a',
    o: '#08080c',
  },
};
