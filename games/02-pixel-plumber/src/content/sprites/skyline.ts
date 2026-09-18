import { PixelGrid, type Point } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { SCREEN } from '../../config';
import { ART_COLORS } from '../palette';

/**
 * Brasswick at night, for the ending: a row of buildings in silhouette with dark windows, and
 * street lamps. The windows are listed as well, so the ending can light them one by one.
 *
 * b building · e roof edge · w dark window · p lamp post · o lamp off · L/l lamp lit
 */

export const SKYLINE_WIDTH = SCREEN.width;
/** Tall enough for the pumping station's stack above its roof. */
export const SKYLINE_HEIGHT = 92;
export const WINDOW_WIDTH = 3;
export const WINDOW_HEIGHT = 4;
const WINDOW_STEP_X = 7;
const WINDOW_STEP_Y = 9;
const WINDOW_MARGIN = 4;

type Roof = 'flat' | 'peak' | 'chimney' | 'stack';

interface Building {
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly roof: Roof;
}

/** Left to right across the screen. The tall stack is the old pumping station. */
const BUILDINGS: readonly Building[] = [
  { left: 0, width: 30, height: 38, roof: 'peak' },
  { left: 30, width: 26, height: 52, roof: 'chimney' },
  { left: 56, width: 34, height: 30, roof: 'flat' },
  { left: 90, width: 24, height: 46, roof: 'peak' },
  { left: 114, width: 40, height: 60, roof: 'stack' },
  { left: 154, width: 28, height: 36, roof: 'chimney' },
  { left: 182, width: 36, height: 48, roof: 'flat' },
  { left: 218, width: 22, height: 32, roof: 'peak' },
  { left: 240, width: 32, height: 54, roof: 'chimney' },
  { left: 272, width: 26, height: 40, roof: 'flat' },
  { left: 298, width: 22, height: 50, roof: 'peak' },
];

/** The top of a building's wall, in the skyline's own pixels. */
function wallTop({ height }: Building): number {
  return SKYLINE_HEIGHT - height;
}

function drawBuilding(grid: PixelGrid, building: Building): void {
  const { left, width, roof } = building;
  const top = wallTop(building);
  grid.fillRect(left, top, width, SKYLINE_HEIGHT - top, 'b');
  grid.fillRect(left, top, width, 1, 'e');
  switch (roof) {
    case 'peak':
      // A roof rising to a ridge in the middle, a pixel narrower on each side per row.
      for (let row = 1; row <= width / 2; row++) grid.fillRect(left + row, top - row, width - row * 2, 1, 'e');
      break;
    case 'chimney':
      grid.fillRect(left + width - 8, top - 7, 4, 7, 'b');
      grid.fillRect(left + width - 9, top - 8, 6, 1, 'e');
      break;
    case 'stack':
      grid.fillRect(left + width / 2 - 3, top - 26, 6, 26, 'b');
      grid.fillRect(left + width / 2 - 4, top - 27, 8, 2, 'e');
      break;
    case 'flat':
      grid.fillRect(left + 2, top - 2, width - 4, 2, 'e');
      break;
  }
}

/** Where each building's windows are: a grid inset from its walls and top, clear of the street. */
function buildingWindows(building: Building): Point[] {
  const windows: Point[] = [];
  const top = wallTop(building) + WINDOW_MARGIN;
  const bottom = SKYLINE_HEIGHT - WINDOW_MARGIN - WINDOW_HEIGHT;
  const columns = Math.floor((building.width - WINDOW_MARGIN * 2 + WINDOW_STEP_X - WINDOW_WIDTH) / WINDOW_STEP_X);
  // Centred across the wall.
  const used = (columns - 1) * WINDOW_STEP_X + WINDOW_WIDTH;
  const left = building.left + Math.floor((building.width - used) / 2);
  for (let y = top; y <= bottom; y += WINDOW_STEP_Y) {
    for (let column = 0; column < columns; column++) windows.push([left + column * WINDOW_STEP_X, y]);
  }
  return windows;
}

/** Every window in the skyline, by its top-left pixel. */
export const SKYLINE_WINDOWS: readonly Point[] = BUILDINGS.flatMap(buildingWindows);

function skyline(): PixelMap {
  const grid = new PixelGrid(SKYLINE_WIDTH, SKYLINE_HEIGHT);
  for (const building of BUILDINGS) drawBuilding(grid, building);
  for (const [x, y] of SKYLINE_WINDOWS) grid.fillRect(x, y, WINDOW_WIDTH, WINDOW_HEIGHT, 'w');
  return grid.toPixelMap();
}

export const SKYLINE_SHEET = {
  key: 'skyline',
  palette: {
    b: ART_COLORS.nightBuilding,
    e: ART_COLORS.nightRoof,
    w: ART_COLORS.windowDark,
  },
  frames: { town: skyline() },
} as const satisfies SpriteSheetDefinition;

const LAMP_WIDTH = 7;
const LAMP_HEIGHT = 26;

/** A street lamp: a post with a lantern on top, dark or lit with a little glow round it. */
function lamp(lit: boolean): PixelMap {
  const grid = new PixelGrid(LAMP_WIDTH, LAMP_HEIGHT);
  if (lit) grid.fillRect(0, 0, LAMP_WIDTH, 7, 'l');
  grid.fillRect(1, 1, 5, 5, 'p');
  grid.fillRect(2, 2, 3, 3, lit ? 'L' : 'o');
  grid.fillRect(3, 6, 1, LAMP_HEIGHT - 7, 'p');
  grid.fillRect(2, LAMP_HEIGHT - 2, 3, 2, 'p');
  return grid.toPixelMap();
}

/** Standing on the bottom of its frame. */
export const LAMP_SHEET = {
  key: 'street-lamp',
  palette: {
    p: ART_COLORS.lampPost,
    o: ART_COLORS.lampOff,
    L: ART_COLORS.lampLit,
    l: ART_COLORS.lampGlow,
  },
  frames: { off: lamp(false), on: lamp(true) },
} as const satisfies SpriteSheetDefinition;
