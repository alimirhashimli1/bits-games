import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * City rooftops at sunset, Mahmood's home arena. Back to front: an orange-to-violet sky with
 * the sun going down behind the city, a skyline with its first lit windows, the tops of nearby
 * buildings with water tanks, aerials and washing lines whose laundry flaps in the wind, the
 * neighbours watching from behind a brick parapet, and a tarred roof with a chimney stack at
 * each end.
 */

const HORIZON_Y = 112;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;
const SUN = { x: 70, y: 76, radius: 14 } as const;

/** The setting sun and the city skyline in front of it, with a few windows lit. */
function farLayer(): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);
  fillCircle(grid, SUN.x, SUN.y, SUN.radius, 'u');
  fillCircle(grid, SUN.x, SUN.y, SUN.radius - 4, 'U');
  for (let x = 0, index = 0; x < width; index++) {
    const buildingWidth = 12 + ((index * 17) % 16);
    const height = 20 + ((index * 29) % 36);
    const top = HORIZON_Y + 4 - height;
    grid.fillRect(x, top, buildingWidth, height, 'k');
    for (let wy = top + 4; wy < HORIZON_Y; wy += 6) {
      for (let wx = x + 2; wx < x + buildingWidth - 2; wx += 4) {
        if ((wx * 3 + wy * 7 + index) % 9 === 0) grid.plot(wx, wy, 'l');
      }
    }
    x += buildingWidth + 1;
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 50 } as const;
const TANK = { width: 22, height: 18, legs: 12 } as const;
const LINE = { spacing: 110, length: 60, sag: 5 } as const;

/**
 * Nearby rooftops: water tanks on legs, aerials, and washing lines strung between poles. On the
 * second frame the laundry swings out in the wind.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const roof = height - 20;
  grid.fillRect(0, roof, width, height - roof, 'd');
  grid.fillRect(0, roof, width, 2, 'D');

  for (let x = 30; x < width; x += 96) {
    // A water tank on legs.
    const tankTop = roof - TANK.legs - TANK.height;
    grid.fillRect(x, tankTop, TANK.width, TANK.height, 't');
    for (let band = tankTop + 4; band < tankTop + TANK.height; band += 5) grid.fillRect(x, band, TANK.width, 1, 'T');
    for (let row = 0; row < 4; row++) grid.fillRect(x + row, tankTop - 4 + row, TANK.width - row * 2, 1, 'T');
    for (const leg of [x + 2, x + TANK.width - 4]) grid.fillRect(leg, roof - TANK.legs, 2, TANK.legs, 'D');
    // An aerial.
    const aerialX = x + 50;
    grid.fillRect(aerialX, roof - 34, 1, 34, 'D');
    for (const [armY, armWidth] of [[4, 11], [10, 8], [16, 5]] as const) grid.fillRect(aerialX - (armWidth >> 1), roof - 34 + armY, armWidth, 1, 'D');
  }

  // Washing lines between poles, with clothes pegged along them.
  for (let start = 60; start < width; start += LINE.spacing) {
    const lineTop = roof - 26;
    grid.fillRect(start, lineTop, 1, 26, 'D');
    grid.fillRect(start + LINE.length, lineTop, 1, 26, 'D');
    const sag = (x: number): number => lineTop + Math.round(LINE.sag * Math.sin((Math.PI * (x - start)) / LINE.length));
    for (let x = start; x <= start + LINE.length; x++) grid.plot(x, sag(x), 'q');
    for (let x = start + 6, item = 0; x < start + LINE.length - 6; x += 11, item++) {
      const swing = frame === 1 ? 2 : 0;
      const color = ['1', '2', '3', '4'][item % 4] ?? '1';
      const top = sag(x) + 1;
      grid.fillRect(x, top, 7, 3, color);
      grid.fillRect(x + 1 + swing, top + 3, 5, 5, color);
    }
  }
  return grid.toPixelMap();
}

const PARAPET = { top: 128, height: 12, brick: 10 } as const;

/** A low brick parapet along the roof's edge, capped with stone. */
function parapet(): PixelMap {
  const grid = new PixelGrid(STAGE.width, PARAPET.height);
  for (let row = 2, course = 0; row < PARAPET.height; row += 3, course++) {
    const offset = course % 2 === 0 ? 0 : PARAPET.brick / 2;
    for (let x = -offset; x < STAGE.width; x += PARAPET.brick) grid.fillRect(x, row, PARAPET.brick - 1, 2, (x + course) % 3 === 0 ? 'B' : 'b');
  }
  grid.fillRect(0, 0, STAGE.width, 2, 'n');
  return grid.toPixelMap();
}

const STACK = { width: 12, height: 22 } as const;

/** Tarred roofing speckled with gravel, and a brick chimney stack at each end. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  for (let speck = 0; speck < 260; speck++) {
    grid.plot((speck * 89 + 7) % STAGE.width, 1 + ((speck * 31) % (height - 2)), speck % 3 === 0 ? 'g' : 'F');
  }
  for (const x of [0, STAGE.width - STACK.width]) {
    grid.fillRect(x, 0, STACK.width, STACK.height, 'b');
    for (let y = 2; y < STACK.height; y += 3) grid.fillRect(x, y, STACK.width, 1, 'B');
    grid.fillRect(x, 0, STACK.width, 2, 'n');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farLayer()] },
  { name: 'roofs', ...MID, frames: [midFrame(0), midFrame(1)], frameRate: 2 },
  { name: 'parapet', scroll: 1, top: PARAPET.top, frames: [parapet()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const ROOFTOPS: ArenaDefinition = {
  id: 'rooftops',
  name: 'CITY ROOFTOPS',
  sky: ['#3a2a5a', '#5a2f62', '#7c3662', '#a2405c', '#c85450', '#e0703e', '#ee8e3a', '#f4ae4a'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: PARAPET.top + PARAPET.height - 1,
    spots: [20, 38, 60, 79, 101, 122, 140, 163, 182, 205, 226, 248, 266, 290, 310, 330, 352, 371, 394, 414, 436, 456, 478, 496],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    u: '#ffb05a',
    U: '#ffe0a0',
    k: '#2a1e38',
    l: '#ffd070',
    d: '#3a2a3e',
    D: '#261a2a',
    t: '#6a4a3a',
    T: '#4a3228',
    q: '#1a1420',
    b: '#9a4a34',
    B: '#7a3a28',
    n: '#b8a894',
    f: '#3a3438',
    F: '#2e2a2e',
    g: '#5a5458',
    1: '#e8e0c8',
    2: '#4a7ab8',
    3: '#c84a3a',
    4: '#5a9a5a',
    x: '#d8a07a',
    X: '#8e5e40',
    z: '#1a1412',
    Z: '#5a3a24',
    j: '#2a2436',
    o: '#140e18',
  },
};
