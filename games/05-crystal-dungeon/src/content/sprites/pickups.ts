import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

const SIZE = 16;
const MIDDLE = 7.5;
/** How far a gem's points reach from its middle, across and (a little further) down. */
const GEM_HALF_WIDTH = 4;
const GEM_TALLNESS = 1.3;

/**
 * A gem: a diamond, lit on its top-left face and shaded on its bottom-right one. The three
 * symbols are its light, middle and dark colours.
 */
function gem(light: string, middle: string, dark: string): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x - MIDDLE;
      const dy = (y - MIDDLE) / GEM_TALLNESS;
      if (Math.abs(dx) + Math.abs(dy) > GEM_HALF_WIDTH) continue;
      drawing.plot(x, y, dx < 0 && dy < 0 ? light : dx > 0 && dy > 0 ? dark : middle);
    }
  }
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** Gems in their three values: green is worth 1, blue 5 and red 20. */
export const GEM_SHEET = {
  key: 'gems',
  palette: {
    k: ART_COLORS.outline,
    a: ART_COLORS.gemGreenLight,
    b: ART_COLORS.gemGreen,
    c: ART_COLORS.gemGreenDark,
    d: ART_COLORS.gemBlueLight,
    e: ART_COLORS.gemBlue,
    f: ART_COLORS.gemBlueDark,
    g: ART_COLORS.gemRedLight,
    h: ART_COLORS.gemRed,
    i: ART_COLORS.gemRedDark,
  },
  frames: { green: gem('a', 'b', 'c'), blue: gem('d', 'e', 'f'), red: gem('g', 'h', 'i') },
} as const satisfies SpriteSheetDefinition;

export type GemFrame = keyof typeof GEM_SHEET.frames;

/** How many rows the heart container's lower half takes to narrow to its point. */
const HEART_POINT_ROWS = 7;

/** A big heart: two round lobes over a point, with a shine on the left lobe and a gold rim. */
function heartContainer(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([5, 5.5], 3.6, 'h');
  drawing.fillCircle([10, 5.5], 3.6, 'h');
  for (let row = 0; row < HEART_POINT_ROWS; row++) drawing.fillRect(1 + row, 7 + row, 13 - row * 2, 1, 'h');
  drawing.fillRect(3, 4, 2, 2, 'H');
  drawing.plot(5, 3, 'H');
  drawing.outline('y');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A heart container: each one found adds a heart for good. */
export const HEART_CONTAINER_SHEET = {
  key: 'heart-container',
  palette: { k: ART_COLORS.outline, h: ART_COLORS.heartContainer, H: ART_COLORS.heartLight, y: ART_COLORS.keyGold },
  frames: { container: heartContainer() },
} as const satisfies SpriteSheetDefinition;

/** A ring of smoke, `radius` across and one to two pixels thick. */
function puff(radius: number, thickness: number): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([MIDDLE, MIDDLE], radius, 'w');
  drawing.fillCircle([MIDDLE, MIDDLE], radius - thickness * 0.5, 'g');
  drawing.fillCircle([MIDDLE, MIDDLE], radius - thickness, '.');
  return drawing.toPixelMap();
}

/** The puff of smoke a defeated enemy leaves. */
export const PUFF_SHEET = {
  key: 'puff',
  palette: { w: ART_COLORS.puff, g: ART_COLORS.puffShade },
  frames: { small: puff(2.5, 3), middle: puff(4.5, 2), large: puff(6.5, 1.5) },
} as const satisfies SpriteSheetDefinition;

export const PUFF_ANIMATIONS = {
  burst: { key: 'puff-burst', frames: ['small', 'middle', 'large'], frameRate: 14 },
} as const satisfies Record<string, PixelAnimationDefinition>;
