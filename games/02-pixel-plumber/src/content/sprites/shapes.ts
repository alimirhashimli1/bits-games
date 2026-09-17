import { TRANSPARENT_PIXEL, type PixelMap } from '@shared/pixel-art/pixelMap';

import { LEVEL } from '../../config';

/** Round sprites are drawn inside one tile. */
const SIZE = LEVEL.tileSize;
const CENTER = (SIZE - 1) / 2;

export const OUTLINE = 'k';

/**
 * Draws a round shape by asking `pick` for the symbol at each pixel, given its distance and
 * angle from the middle of the frame. Returning nothing leaves the pixel empty.
 */
export function radial(pick: (distance: number, angle: number) => string | undefined): PixelMap {
  return Array.from({ length: SIZE }, (_, y) =>
    Array.from({ length: SIZE }, (_, x) => {
      const dx = x - CENTER;
      const dy = y - CENTER;
      return pick(Math.hypot(dx, dy), Math.atan2(dy, dx)) ?? TRANSPARENT_PIXEL;
    }).join(''),
  );
}

/** Adds a one-pixel outline around a shape, in the empty pixels next to it (not diagonally). */
export function outlined(map: PixelMap): PixelMap {
  const filled = (x: number, y: number) => {
    const symbol = map[y]?.[x];
    return symbol !== undefined && symbol !== TRANSPARENT_PIXEL && symbol !== OUTLINE;
  };
  return map.map((row, y) =>
    [...row]
      .map((symbol, x) =>
        symbol === TRANSPARENT_PIXEL && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1))
          ? OUTLINE
          : symbol,
      )
      .join(''),
  );
}

/** Light from the top left: the light, middle or shaded symbol for a pixel at this angle. */
export function shaded(angle: number, light: string, middle: string, shade: string): string {
  const facing = Math.cos(angle - Math.PI / 4);
  if (facing < -0.4) return light;
  return facing > 0.4 ? shade : middle;
}
