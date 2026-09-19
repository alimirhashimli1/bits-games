import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { SCREEN, STAGE } from '../../config';
import { fillCircle, layerWidth } from './arenaArt';
import type { ArenaDefinition, ArenaLayer } from './arenaTypes';
import { createPerson } from './crowdPeople';

/*
 * The mountain mine, Grom's home arena: a great cavern deep under the mountain. Back to front:
 * the cave's dark depths, a rock ceiling hung with stalactites and walls seamed with ore that
 * glints, timber supports with oil lamps that flicker and an ore cart on its rails, miners in
 * helmets behind a plank barrier, and a gravel floor with a timber post at each end.
 */

const HORIZON_Y = 104;
const GROUND_Y = 140;

const FAR = { scroll: 0.15, top: 0 } as const;
const CEILING = 10;

/**
 * The rock ceiling with stalactites, the cave wall with rubble heaped along its foot, and
 * crystals in the rock. On the second frame some of the crystals catch the light.
 */
function farFrame(frame: number): PixelMap {
  const width = layerWidth(FAR.scroll);
  const grid = new PixelGrid(width, HORIZON_Y + 4);

  grid.fillRect(0, 0, width, CEILING, 'k');
  for (let x = 0, index = 0; x < width; index++) {
    const spikeWidth = 5 + ((index * 7) % 6);
    const length = 6 + ((index * 17) % 22);
    for (let row = 0; row < length; row++) {
      const half = Math.ceil((spikeWidth * (length - row)) / length / 2);
      grid.fillRect(x + Math.floor(spikeWidth / 2) - half, CEILING + row, half * 2, 1, row === 0 ? 'k' : 'K');
    }
    x += spikeWidth + 3 + ((index * 5) % 9);
  }

  // Rubble: overlapping mounds along the foot of the wall.
  for (let x = 0, index = 0; x < width; x += 22, index++) {
    const radius = 10 + ((index * 13) % 9);
    fillCircle(grid, x, HORIZON_Y + 4, radius, index % 2 === 0 ? 'K' : 'k', HORIZON_Y + 3);
  }

  // Seams of ore: little clusters of crystal in the rock.
  for (let seam = 0; seam < 26; seam++) {
    const x = (seam * 61 + 23) % width;
    const y = 30 + ((seam * 37) % (HORIZON_Y - 44));
    const glint = frame === 1 && seam % 3 === 0;
    grid.plot(x, y, glint ? 'W' : 'c');
    grid.plot(x + 1, y + 1, 'c');
    grid.plot(x - 1, y + 1, 'C');
    grid.plot(x, y + 2, 'C');
  }
  return grid.toPixelMap();
}

const MID = { scroll: 0.5, top: 40 } as const;
const SUPPORT = { spacing: 84, post: 4, beam: 5, height: 94 } as const;
const LAMP = { drop: 6, glow: 5 } as const;
const CART = { width: 26, height: 10, wheel: 3 } as const;
/** The ledge the rails run along: this far above the floor of the layer, and this thick. */
const LEDGE_RISE = 30;
const LEDGE_DEPTH = 4;

/**
 * Timber supports holding up the roof, each with an oil lamp hanging from its beam, and rails
 * along a ledge with a loaded ore cart on them. The lamps' glow grows and shrinks between the
 * two frames, which reads as a flicker.
 */
function midFrame(frame: number): PixelMap {
  const width = layerWidth(MID.scroll);
  const height = GROUND_Y - MID.top;
  const grid = new PixelGrid(width, height);
  const ground = height - 2;

  for (let x = 12, index = 0; x < width; x += SUPPORT.spacing, index++) {
    const top = ground - SUPPORT.height;
    const beamRight = x + SUPPORT.spacing - 20;
    // The lamp hangs from the middle of the beam, its glow behind the timber.
    const lampX = x + Math.floor((SUPPORT.spacing - 20) / 2);
    const lampY = top + SUPPORT.beam + LAMP.drop;
    fillCircle(grid, lampX, lampY + 2, LAMP.glow + (frame + index) % 2, 'g');
    grid.fillRect(x, top, SUPPORT.post, SUPPORT.height, 'd');
    grid.fillRect(beamRight - SUPPORT.post, top, SUPPORT.post, SUPPORT.height, 'd');
    grid.fillRect(x - 2, top, beamRight - x + 4, SUPPORT.beam, 'D');
    grid.fillRect(x + 1, top + SUPPORT.beam, 1, SUPPORT.height - SUPPORT.beam, 'D');
    grid.fillRect(lampX, top + SUPPORT.beam, 1, LAMP.drop, 'q');
    grid.fillRect(lampX - 1, lampY, 3, 4, 'l');
    grid.plot(lampX, lampY + 1, 'L');
  }

  // A rock ledge above the crowd's heads, with rails and an ore cart heaped with gold-flecked rock.
  const ledge = ground - LEDGE_RISE;
  grid.fillRect(0, ledge + 2, width, LEDGE_DEPTH, 'K');
  grid.fillRect(0, ledge + 2, width, 1, 'k');
  grid.fillRect(0, ledge - 1, width, 1, 'r');
  for (let x = 0; x < width; x += 6) grid.fillRect(x, ledge, 3, 2, 'D');
  const cartX = Math.floor(width / 2) - 40;
  const cartTop = ledge - 2 - CART.height;
  for (let row = 0; row < 4; row++) grid.fillRect(cartX + 4 + row * 2, cartTop - 4 + row, CART.width - 8 - row * 4, 1, row % 2 ? 'K' : 'k');
  grid.plot(cartX + 9, cartTop - 2, 'y');
  grid.plot(cartX + 15, cartTop - 3, 'y');
  grid.plot(cartX + 19, cartTop - 1, 'y');
  grid.fillRect(cartX, cartTop, CART.width, CART.height, 'm');
  grid.fillRect(cartX, cartTop, CART.width, 1, 'M');
  grid.fillRect(cartX + 2, cartTop + 3, CART.width - 4, 1, 'M');
  for (const wheel of [cartX + 5, cartX + CART.width - 6]) fillCircle(grid, wheel, ledge - 2, CART.wheel - 1, 'q');
  return grid.toPixelMap();
}

const BARRIER = { top: 128, height: 12, post: 40 } as const;

/** Rough planks nailed across posts: the barrier the miners lean on. */
function barrier(): PixelMap {
  const grid = new PixelGrid(STAGE.width, BARRIER.height);
  for (const [row, symbol] of [[1, 'n'], [6, 'N']] as const) {
    grid.fillRect(0, row, STAGE.width, 4, symbol);
    for (let x = 7; x < STAGE.width; x += 11) grid.plot(x, row + 1 + (x % 2), 'D');
  }
  for (let x = 4; x < STAGE.width; x += BARRIER.post) grid.fillRect(x, 0, 4, BARRIER.height, 'd');
  return grid.toPixelMap();
}

const POST = { width: 8, height: 20 } as const;

/** Packed earth scattered with gravel, and a timber post marking each end of the arena. */
function floor(): PixelMap {
  const height = SCREEN.height - GROUND_Y;
  const grid = new PixelGrid(STAGE.width, height);
  grid.fillRect(0, 0, STAGE.width, height, 'f');
  grid.fillRect(0, 0, STAGE.width, 1, 'F');
  for (let stone = 0; stone < 220; stone++) {
    const x = (stone * 71 + 13) % STAGE.width;
    const y = 2 + ((stone * 29) % (height - 3));
    grid.fillRect(x, y, 1 + (stone % 3 === 0 ? 1 : 0), 1, stone % 4 === 0 ? 'p' : 'F');
  }
  for (const x of [0, STAGE.width - POST.width]) {
    grid.fillRect(x, 0, POST.width, POST.height, 'd');
    grid.fillRect(x, 0, POST.width, 2, 'D');
    grid.fillRect(x + 2, 4, 1, POST.height - 6, 'D');
  }
  return grid.toPixelMap();
}

const layers: readonly ArenaLayer[] = [
  { name: 'far', ...FAR, frames: [farFrame(0), farFrame(1)], frameRate: 1 },
  { name: 'supports', ...MID, frames: [midFrame(0), midFrame(1)], frameRate: 3 },
  { name: 'barrier', scroll: 1, top: BARRIER.top, frames: [barrier()], inFrontOfCrowd: true },
  { name: 'floor', scroll: 1, top: GROUND_Y, frames: [floor()], inFrontOfCrowd: true },
];

/** Crowd shirts are the digits 1 to 6 in the palette, and every miner wears a helmet. */
const outline = 'o';

export const MINE: ArenaDefinition = {
  id: 'mine',
  name: 'MOUNTAIN MINE',
  sky: ['#0a0806', '#0f0b08', '#15100b', '#1b140e', '#221911', '#2a1f15', '#332519', '#3c2b1c'],
  horizonY: HORIZON_Y,
  layers,
  crowd: {
    scroll: 1,
    footY: BARRIER.top + BARRIER.height - 1,
    spots: [16, 32, 47, 63, 80, 96, 113, 128, 145, 161, 178, 194, 211, 228, 244, 260, 277, 293, 310, 327, 343, 360, 377, 393, 410, 426, 443, 460, 476, 494],
    people: [
      createPerson({ shirt: '1', skin: 'x', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '2', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '3', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '4', skin: 'X', hair: 'z', legs: 'j', outline }),
      createPerson({ shirt: '5', skin: 'x', hair: 'Z', legs: 'j', outline }),
      createPerson({ shirt: '6', skin: 'X', hair: 'z', legs: 'j', outline }),
    ],
  },
  palette: {
    k: '#1c1612',
    K: '#2a211a',
    c: '#4fa3a8',
    C: '#2f6e74',
    W: '#e8fbff',
    g: '#4a3420',
    d: '#6b4a2c',
    D: '#48311d',
    q: '#18120e',
    l: '#f2b54a',
    L: '#fff0b0',
    r: '#8a8f99',
    m: '#5a5f6a',
    M: '#7c828e',
    y: '#e8c040',
    n: '#7a5634',
    N: '#5e4128',
    f: '#4a3a2c',
    F: '#3a2d22',
    p: '#6a5a4a',
    1: '#6a7a8a',
    2: '#8a5a3a',
    3: '#5a6a3a',
    4: '#7a3a32',
    5: '#4a4a5a',
    6: '#9a8a6a',
    x: '#d8a07a',
    X: '#8e5e40',
    z: '#e8c040',
    Z: '#d87a2a',
    j: '#2a2420',
    o: '#0c0a08',
  },
};
