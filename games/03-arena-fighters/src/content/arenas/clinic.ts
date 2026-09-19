import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The clinic street at night, Azar's home arena. Back to front: a dark blue sky over the
 * city's towers, the clinic itself with rows of lit windows and a glowing green cross over the
 * door, an ambulance parked outside whose roof lights flash, onlookers behind metal crowd
 * barriers, and a paved street with a lamp post at each end.
 */

const HORIZON_Y = 104;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;

/** Distant towers with a scatter of lit windows, and a few stars. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);
  for (let star = 0; star < 30; star++) grid.plot((star * 67 + 11) % width, (star * 23 + 3) % 40, 'w');
  for (let x = 0, index = 0; x < width; index++) {
    const towerWidth = 14 + ((index * 13) % 12);
    const height = 34 + ((index * 31) % 40);
    const top = HORIZON_Y + 4 - height;
    grid.fillRect(x, top, towerWidth, height, 'k');
    for (let wy = top + 3; wy < HORIZON_Y; wy += 5) {
      for (let wx = x + 2; wx < x + towerWidth - 2; wx += 3) {
        if ((wx * 5 + wy * 3 + index) % 7 === 0) grid.plot(wx, wy, 'l');
      }
    }
    x += towerWidth + 3;
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 30 } as const;
const CLINIC = { x: 90, width: 170, height: 86 } as const;
const AMBULANCE = { x: 280, width: 50, height: 20 } as const;

/**
 * The clinic, its windows lit, with a green cross over the door, and an ambulance outside.
 * On the second frame the ambulance's roof lights swap sides and the cross glows brighter.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 2;

  // The clinic.
  const top = ground - CLINIC.height;
  grid.fillRect(CLINIC.x, top, CLINIC.width, CLINIC.height, 'b');
  grid.fillRect(CLINIC.x - 2, top, CLINIC.width + 4, 3, 'B');
  for (let wy = top + 8; wy < ground - 26; wy += 14) {
    for (let wx = CLINIC.x + 8; wx < CLINIC.x + CLINIC.width - 12; wx += 16) {
      grid.fillRect(wx, wy, 10, 8, (wx + wy) % 3 === 0 ? 'k' : 'l');
      grid.fillRect(wx + 4, wy, 1, 8, 'B');
    }
  }
  const doorX = CLINIC.x + CLINIC.width / 2 - 10;
  grid.fillRect(doorX, ground - 22, 20, 22, 'L');
  grid.fillRect(doorX + 9, ground - 22, 2, 22, 'B');
  // The green cross sign.
  const crossColor = frame === 1 ? 'G' : 'g';
  grid.fillRect(doorX + 6, ground - 38, 8, 14, crossColor);
  grid.fillRect(doorX + 3, ground - 34, 14, 6, crossColor);

  // The ambulance, with flashing roof lights.
  const vanTop = ground - AMBULANCE.height - 3;
  grid.fillRect(AMBULANCE.x, vanTop, AMBULANCE.width, AMBULANCE.height, 'W');
  grid.fillRect(AMBULANCE.x + AMBULANCE.width - 12, vanTop + 3, 10, 7, 'k');
  grid.fillRect(AMBULANCE.x, vanTop + 12, AMBULANCE.width, 3, 'g');
  grid.fillRect(AMBULANCE.x + 10, vanTop + 3, 8, 8, 'g');
  grid.fillRect(AMBULANCE.x + 12, vanTop + 5, 4, 4, 'W');
  grid.fillRect(AMBULANCE.x + 4, vanTop - 3, 5, 3, frame === 0 ? 'R' : 'r');
  grid.fillRect(AMBULANCE.x + 12, vanTop - 3, 5, 3, frame === 1 ? 'U' : 'u');
  for (const wheel of [AMBULANCE.x + 8, AMBULANCE.x + AMBULANCE.width - 10]) grid.fillRect(wheel, ground - 4, 7, 4, 'k');

  grid.fillRect(0, ground, width, 2, 'B');
  return grid.toPixelMap();
}

const BARRIER = { top: 128, height: 12, section: 40 } as const;

/** Metal crowd barriers, section after section. */
function barrier(): PixelMap {
  const grid = new PixelGrid(STAGE.width, BARRIER.height);
  for (let x = 2; x < STAGE.width; x += BARRIER.section) {
    grid.fillRect(x, 0, BARRIER.section - 4, 2, 'n');
    grid.fillRect(x, 9, BARRIER.section - 4, 2, 'n');
    grid.fillRect(x, 0, 2, BARRIER.height, 'n');
    grid.fillRect(x + BARRIER.section - 6, 0, 2, BARRIER.height, 'n');
    for (let bar = x + 5; bar < x + BARRIER.section - 6; bar += 4) grid.fillRect(bar, 2, 1, 7, 'N');
  }
  return grid.toPixelMap();
}

const SLAB = { width: 24, height: 10 } as const;
const LAMP = { width: 4, height: 24 } as const;

/** Paving slabs, and a street lamp at each end of the arena. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  for (let y = 0, row = 0; y < height; y += SLAB.height, row++) {
    const offset = row % 2 === 0 ? 0 : SLAB.width / 2;
    for (let x = -offset; x < STAGE.width; x += SLAB.width) grid.fillRect(x, y, SLAB.width - 1, SLAB.height - 1, (x / SLAB.width + row) % 2 === 0 ? 'f' : 'F');
  }
  for (const x of [4, STAGE.width - 4 - LAMP.width]) {
    grid.fillRect(x, 0, LAMP.width, LAMP.height, 'k');
    grid.fillRect(x - 3, 0, LAMP.width + 6, 3, 'L');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farLayer()] },
  { name: 'clinic', ...MID, frames: [midFrame(0), midFrame(1)], frameRate: 3 },
  { name: 'barrier', scroll: 1, top: BARRIER.top, frames: [barrier()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const CLINIC_STREET: ArenaDefinition = {
  id: 'clinic',
  name: 'CLINIC STREET',
  sky: ['#060a1a', '#0a1022', '#0e162c', '#121c36', '#172240', '#1c294a', '#223054', '#28385e'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: BARRIER.top + BARRIER.height - 1,
    spots: [18, 36, 55, 72, 90, 110, 128, 146, 165, 184, 202, 220, 240, 258, 276, 296, 314, 332, 352, 370, 388, 408, 426, 444, 464, 482, 498],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'Z', legs: 'j', outline }),
    ],
  },
  palette: {
    w: '#c8d0f0',
    k: '#0a0e1c',
    l: '#f0d890',
    L: '#fff0c0',
    b: '#5a6478',
    B: '#3e4658',
    g: '#2a9a5a',
    G: '#6aefa0',
    W: '#e8ecf0',
    r: '#6a1a1a',
    R: '#ff4a3a',
    u: '#1a2a6a',
    U: '#5a9aff',
    n: '#a8b0bc',
    N: '#7c8490',
    f: '#4a4e58',
    F: '#40444e',
    1: '#3a6aa8',
    2: '#e8e0c8',
    3: '#8a3a4a',
    4: '#3a7a5a',
    5: '#6a5a8a',
    x: '#e0b08a',
    X: '#8e5e40',
    z: '#1c1410',
    Z: '#6a4a2a',
    j: '#1e2230',
    o: '#06080e',
  },
};
