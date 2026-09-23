import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The power station, Nova's home arena, at night. Back to front: a deep blue-green night sky,
 * cooling towers breathing out steam that rolls upwards, a line of pylons whose cables carry a
 * spark from tower to tower and whose red warning lamps blink, a transformer yard where an arc
 * crackles between two insulators, engineers in hard hats behind a chain-link fence with
 * danger signs, and a floor of concrete slabs with a hazard-striped switch cabinet at each end.
 */

const HORIZON_Y = 104;
const GROUND_Y = 140;
const FRAMES = 3;

const FAR = { scroll: 0.15, top: 0 } as const;
const TOWER = { spacing: 110, top: 44, shorterBy: 14, waistAt: 0.7, topHalf: 13, waistHalf: 11, baseHalf: 18 } as const;

/** How wide a cooling tower is at a height, as a share of the way down it: narrow at the waist, flared at the foot. */
function towerHalfWidth(share: number): number {
  if (share < TOWER.waistAt) return TOWER.topHalf + ((TOWER.waistHalf - TOWER.topHalf) * share) / TOWER.waistAt;
  const below = (share - TOWER.waistAt) / (1 - TOWER.waistAt);
  return TOWER.waistHalf + (TOWER.baseHalf - TOWER.waistHalf) * below * below;
}

/** Cooling towers against the sky, their steam rolling up a little further each frame. */
function farFrame(frame: number): PixelMap {
  const width = layerWidth(FAR.scroll);
  const bottom = HORIZON_Y + 4;
  const grid = new PixelGrid(width, bottom);
  for (let centre = 40, index = 0; centre < width + TOWER.baseHalf; centre += TOWER.spacing, index++) {
    // Every other tower stands further off, so looks shorter.
    const top = TOWER.top + (index % 2) * TOWER.shorterBy;
    // The steam first, so the tower's lip sits in front of it.
    for (let puff = 0; puff < 4; puff++) {
      const rise = puff * 9 + frame * 3;
      const radius = 5 + puff * 2;
      const drift = puff * 3 + ((index + puff) % 2);
      fillCircle(grid, centre + drift, top - 4 - rise, radius, puff % 2 === 0 ? 'v' : 'V');
    }
    const height = bottom - top;
    for (let y = top; y < bottom; y++) {
      const half = Math.round(towerHalfWidth((y - top) / height));
      grid.fillRect(centre - half, y, half * 2, 1, 'k');
      grid.fillRect(centre + half - 3, y, 3, 1, 'K');
    }
    grid.fillRect(centre - TOWER.topHalf, top, TOWER.topHalf * 2, 1, 'K');
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 20 } as const;
const PYLON = { spacing: 96, height: 70, baseHalf: 9, arm: 14 } as const;
const CABLE_SAG = 9;
const YARD = { every: 2, gap: 22, insulatorHeight: 16 } as const;

/**
 * Lattice pylons with cables sagging between their arms. A spark runs along each cable and the
 * lamps on top blink. Between every other pair of pylons, a transformer yard where an arc jumps
 * between two insulators, a different zigzag each frame, and none on the last.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 8;
  grid.fillRect(0, ground, width, height - ground, 'd');
  grid.fillRect(0, ground, width, 1, 'D');

  const top = ground - PYLON.height;
  const armY = top + 8;
  for (let x = 20, index = 0; x < width + PYLON.spacing; x += PYLON.spacing, index++) {
    // Two legs leaning in to the peak, braced with crosses.
    grid.line([x - PYLON.baseHalf, ground], [x - 1, top], 1, 'D');
    grid.line([x + PYLON.baseHalf, ground], [x + 1, top], 1, 'D');
    for (let y = top + 12; y < ground - 6; y += 12) {
      const half = Math.round((PYLON.baseHalf * (y - top)) / PYLON.height);
      const lower = Math.round((PYLON.baseHalf * (y + 12 - top)) / PYLON.height);
      grid.line([x - half, y], [x + lower, y + 12], 1, 'D');
      grid.line([x + half, y], [x - lower, y + 12], 1, 'D');
    }
    grid.fillRect(x - PYLON.arm, armY, PYLON.arm * 2 + 1, 2, 'D');
    grid.plot(x, top - 1, frame === 1 ? 'r' : 'R');

    // Cables to the next pylon, from each end of the arm, with a spark riding one of them.
    const next = x + PYLON.spacing;
    for (const end of [-PYLON.arm, PYLON.arm]) {
      for (let cx = x + end; cx <= next + end; cx++) {
        const along = (cx - x - end) / PYLON.spacing;
        grid.plot(cx, armY + 2 + Math.round(CABLE_SAG * 4 * along * (1 - along)), 'c');
      }
    }
    const sparkAlong = ((frame + index) % FRAMES + 0.5) / FRAMES;
    grid.fillRect(x + PYLON.arm + Math.round(sparkAlong * PYLON.spacing), armY + 1 + Math.round(CABLE_SAG * 4 * sparkAlong * (1 - sparkAlong)), 2, 2, 'W');

    if (index % YARD.every === 0) transformerYard(grid, x + PYLON.spacing / 2, ground, frame);
  }
  return grid.toPixelMap();
}

/** A transformer with two insulator stacks on top, and an arc between them on the lit frames. */
function transformerYard(grid: PixelGrid, centre: number, ground: number, frame: number): void {
  const boxTop = ground - 18;
  grid.fillRect(centre - 16, boxTop, 32, 18, 'm');
  for (let fin = centre - 14; fin < centre + 14; fin += 4) grid.fillRect(fin, boxTop + 3, 2, 13, 'M');
  const tops = [centre - YARD.gap / 2, centre + YARD.gap / 2];
  const insulatorTop = boxTop - YARD.insulatorHeight;
  for (const x of tops) {
    for (let y = insulatorTop; y < boxTop; y += 3) grid.fillRect(x - 2, y, 5, 2, 'i');
    grid.fillRect(x, insulatorTop, 1, YARD.insulatorHeight, 'I');
  }
  if (frame === FRAMES - 1) return;
  // The arc: a zigzag from one insulator's cap to the other's, bowing upwards.
  let previous: readonly [number, number] = [tops[0] ?? centre, insulatorTop];
  for (let x = (tops[0] ?? centre) + 3; x <= (tops[1] ?? centre); x += 3) {
    const along = (x - (tops[0] ?? centre)) / YARD.gap;
    const jag = ((x * 7 + frame * 5) % 5) - 2;
    const point = [x, insulatorTop - Math.round(6 * 4 * along * (1 - along)) + jag] as const;
    grid.line(previous, point, 1, 'W');
    previous = point;
  }
  fillCircle(grid, tops[0] ?? centre, insulatorTop, 1, 'a');
  fillCircle(grid, tops[1] ?? centre, insulatorTop, 1, 'a');
}

/** A small lightning bolt, as offsets from its top-left corner, for the danger signs. */
const BOLT: ReadonlyArray<readonly [number, number]> = [[4, 0], [3, 1], [2, 2], [3, 2], [4, 2], [5, 2], [4, 3], [3, 4], [2, 5]];

function drawBolt(grid: PixelGrid, left: number, top: number): void {
  for (const [dx, dy] of BOLT) grid.plot(left + dx, top + dy, 'k');
}

const FENCE = { top: 122, height: 18, post: 40, sign: 120 } as const;

/** A chain-link fence on steel posts, the watchers seen through the mesh, and yellow danger signs with a bolt on them. */
function fence(): PixelMap {
  const grid = new PixelGrid(STAGE.width, FENCE.height);
  for (let y = 2; y < FENCE.height; y++) {
    for (let x = 0; x < STAGE.width; x++) if ((x + y) % 4 === 0 || (x - y + 400) % 4 === 0) grid.plot(x, y, 'n');
  }
  grid.fillRect(0, 0, STAGE.width, 2, 'N');
  for (let x = 4; x < STAGE.width; x += FENCE.post) grid.fillRect(x, 0, 2, FENCE.height, 'N');
  for (let x = 60; x < STAGE.width; x += FENCE.sign) {
    grid.fillRect(x, 5, 9, 8, 'y');
    drawBolt(grid, x + 1, 6);
  }
  return grid.toPixelMap();
}

const SLAB = { width: 40, height: 13 } as const;
const CABINET = { width: 14, height: 22 } as const;

/** Concrete slabs with dark joints and the odd stain, and at each end a switch cabinet on hazard stripes. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  // The joints show between the slabs.
  grid.fillRect(0, 0, STAGE.width, height, 'g');
  for (let y = 0, row = 0; y < height; y += SLAB.height, row++) {
    const offset = row % 2 === 0 ? 0 : SLAB.width / 2;
    for (let x = -offset, slab = 0; x < STAGE.width; x += SLAB.width, slab++) {
      grid.fillRect(x, y, SLAB.width - 1, SLAB.height - 1, 'f');
      if ((slab * 5 + row * 3) % 7 === 0) grid.fillRect(x + 8 + ((slab * 11) % 20), y + 4, 5, 2, 'G');
    }
  }
  for (const x of [0, STAGE.width - CABINET.width - 4]) {
    for (let y = 0; y < height; y++) {
      for (let dx = 0; dx < CABINET.width + 4; dx++) grid.plot(x + dx, y, (dx + y) % 6 < 3 ? 'y' : 'k');
    }
    grid.fillRect(x + 2, 0, CABINET.width, CABINET.height, 'm');
    grid.fillRect(x + 2, 0, CABINET.width, 2, 'M');
    grid.fillRect(x + 5, 6, CABINET.width - 6, 8, 'y');
    drawBolt(grid, x + 6, 7);
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'towers', ...FAR, frames: [farFrame(0), farFrame(1), farFrame(2)], frameRate: 3 },
  { name: 'pylons', ...MID, frames: [midFrame(0), midFrame(1), midFrame(2)], frameRate: 8 },
  { name: 'fence', scroll: 1, top: FENCE.top, frames: [fence()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

const outline = 'o';

export const POWER_STATION: ArenaDefinition = {
  id: 'powerStation',
  name: 'POWER STATION',
  sky: ['#060c16', '#08111c', '#0a1622', '#0c1b28', '#0e212e', '#112634', '#142c3a', '#183240'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: FENCE.top + FENCE.height - 1,
    spots: [18, 36, 53, 71, 90, 106, 124, 141, 160, 177, 194, 212, 229, 247, 264, 282, 299, 317, 334, 352, 370, 387, 405, 422, 440, 457, 475, 492],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '1', skin: 'X', hair: 'w', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'x', hair: 'w', legs: 'j', outline }),
    ],
  },
  palette: {
    k: '#101820',
    K: '#223040',
    v: '#5a6a7a',
    V: '#465666',
    d: '#0c141c',
    D: '#2a3a48',
    c: '#48586a',
    R: '#ff4a3a',
    r: '#5a1a18',
    W: '#e8f8ff',
    a: '#8ad8ff',
    m: '#3a4a52',
    M: '#56666e',
    i: '#c8c0b0',
    I: '#7a7468',
    n: '#6a7a84',
    N: '#8a9aa4',
    y: '#f4c430',
    f: '#6c6e70',
    g: '#3e4044',
    G: '#5a5c60',
    1: '#e07020',
    2: '#2a5a9a',
    3: '#4a6a3a',
    x: '#e0a47c',
    X: '#9a6a48',
    // Hard hats: yellow, orange and white.
    z: '#f4c430',
    Z: '#e8702a',
    w: '#eeeeee',
    j: '#1e2228',
    o: '#06080c',
  },
};
