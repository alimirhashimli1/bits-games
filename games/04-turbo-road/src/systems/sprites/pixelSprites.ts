import {
  createPixelCanvas,
  drawPixelMap,
  measurePixelMap,
  type Palette,
  type PixelMap,
  TRANSPARENT_PIXEL,
} from '@shared/pixel-art/pixelMap';

/** Draws a pixel map once onto its own canvas, ready to be drawn many times per frame. */
export function renderPixelSprite(map: PixelMap, palette: Palette, name: string): HTMLCanvasElement {
  const { width, height } = measurePixelMap(map, name);
  const context = createPixelCanvas(width, height);
  drawPixelMap(context, map, palette, 0, 0);
  return context.canvas;
}

/**
 * Leans a sprite seen from behind into a turn: rows above `fixedFromRow` slide sideways, the
 * top ones furthest, while the rows below (the tyres) stay put. `direction` is -1 for left and
 * 1 for right. The map is widened by `maxShift` on both sides, so every frame is the same size.
 */
export function leanPixelMap(map: PixelMap, direction: -1 | 1, fixedFromRow: number, maxShift: number): PixelMap {
  const padding = TRANSPARENT_PIXEL.repeat(maxShift);
  return map.map((row, y) => {
    const shift = y >= fixedFromRow ? 0 : Math.round((maxShift * (fixedFromRow - y)) / fixedFromRow) * direction;
    const padded = padding + row + padding;
    return shift >= 0
      ? TRANSPARENT_PIXEL.repeat(shift) + padded.slice(0, padded.length - shift)
      : padded.slice(-shift) + TRANSPARENT_PIXEL.repeat(-shift);
  });
}

/** Adds transparent columns to both sides, to match the size of leaned frames. */
export function padPixelMap(map: PixelMap, columns: number): PixelMap {
  const padding = TRANSPARENT_PIXEL.repeat(columns);
  return map.map((row) => padding + row + padding);
}

/** Flips a pixel map left to right. */
export function mirrorPixelMap(map: PixelMap): PixelMap {
  return map.map((row) => [...row].reverse().join(''));
}
