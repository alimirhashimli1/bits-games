/**
 * Pixel art written as text: each string is one row, each character one pixel.
 *
 *   '...r....'
 *   '..ror...'
 *
 * `.` is transparent. Every other character is looked up in a palette.
 */
export type PixelMap = readonly string[];

/** Maps pixel characters to CSS colours, e.g. `{ k: '#1b1b22', r: '#e4572e' }`. */
export type Palette = Readonly<Record<string, string>>;

export interface PixelSize {
  readonly width: number;
  readonly height: number;
}

export const TRANSPARENT_PIXEL = '.';

/** Returns the size of a pixel map, after checking that every row has the same width. */
export function measurePixelMap(map: PixelMap, name: string): PixelSize {
  const width = map[0]?.length ?? 0;
  map.forEach((row, index) => {
    if (row.length !== width) {
      throw new Error(`Pixel map "${name}": row ${index} is ${row.length} pixels wide, expected ${width}.`);
    }
  });
  return { width, height: map.length };
}

/** Creates an off-screen canvas to draw pixel art on. */
export function createPixelCanvas(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser does not support 2D canvas.');
  return context;
}

/** Draws a pixel map with whole-pixel rectangles, so it is always perfectly sharp. */
export function drawPixelMap(
  context: CanvasRenderingContext2D,
  map: PixelMap,
  palette: Palette,
  left: number,
  top: number,
): void {
  map.forEach((row, y) => {
    [...row].forEach((symbol, x) => {
      if (symbol === TRANSPARENT_PIXEL) return;

      const color = palette[symbol];
      if (color === undefined) throw new Error(`Pixel "${symbol}" has no colour in the palette.`);

      context.fillStyle = color;
      context.fillRect(left + x, top + y, 1, 1);
    });
  });
}
