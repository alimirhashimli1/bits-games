import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { LEVEL, PLATFORMS } from '../../config';
import { ART_COLORS } from '../palette';

const WIDTH = PLATFORMS.widthTiles * LEVEL.tileSize;
const HEIGHT = PLATFORMS.thickness;
/** The cross-bracing makes one X in every bay of this many pixels. */
const BAY = 8;
/** Rows between the top and bottom rails. */
const BRACE_ROWS = HEIGHT - 4;

/** True where one of the two diagonals of a bay's X crosses this row. */
function onBrace(along: number, row: number): boolean {
  const stride = BAY / BRACE_ROWS;
  const falling = Math.floor(along / stride) === row;
  const rising = Math.floor((BAY - 1 - along) / stride) === row;
  return falling || rising;
}

/** A steel girder: a lit top rail, a shaded bottom rail and cross-bracing between them. */
function girder(): PixelMap {
  const grid = new PixelGrid(WIDTH, HEIGHT);
  grid.fillRect(1, 0, WIDTH - 2, HEIGHT, 'k');
  grid.fillRect(0, 1, WIDTH, HEIGHT - 2, 'k');
  grid.fillRect(1, 1, WIDTH - 2, 1, 'L');
  grid.fillRect(1, HEIGHT - 2, WIDTH - 2, 1, 'D');
  for (let x = 1; x < WIDTH - 1; x++) {
    for (let row = 0; row < BRACE_ROWS; row++) grid.plot(x, row + 2, onBrace(x % BAY, row) ? 'D' : 's');
  }
  return grid.toPixelMap();
}

/** The platform that rides back and forth over the rooftops, three tiles wide. */
export const PLATFORM_SHEET = {
  key: 'platform',
  palette: {
    k: ART_COLORS.outline,
    L: ART_COLORS.steelLight,
    s: ART_COLORS.steel,
    D: ART_COLORS.steelShade,
  },
  frames: { girder: girder() },
} as const satisfies SpriteSheetDefinition;
