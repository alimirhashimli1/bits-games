import { TRANSPARENT_PIXEL, type PixelMap } from './pixelMap';

export type Point = readonly [x: number, y: number];

/** A grid of pixel symbols to draw shapes on. Turned into a PixelMap when finished. */
export class PixelGrid {
  private readonly width: number;
  private readonly cells: string[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.cells = Array.from({ length: height }, () => new Array<string>(width).fill(TRANSPARENT_PIXEL));
  }

  /** Sets one pixel. Pixels outside the grid are ignored, so shapes may cross the edge. */
  plot(x: number, y: number, symbol: string): void {
    if (x < 0 || x >= this.width) return;
    const row = this.cells[y];
    if (row) row[x] = symbol;
  }

  fillRect(left: number, top: number, width: number, height: number, symbol: string): void {
    for (let y = top; y < top + height; y++) {
      for (let x = left; x < left + width; x++) this.plot(x, y, symbol);
    }
  }

  /** Fills a size×size square centred on `center`. */
  square([centerX, centerY]: Point, size: number, symbol: string): void {
    const offset = Math.floor((size - 1) / 2);
    this.fillRect(centerX - offset, centerY - offset, size, size, symbol);
  }

  /** Fills every pixel whose middle lies within `radius` of `center`. The centre may sit between pixels. */
  fillCircle([centerX, centerY]: Point, radius: number, symbol: string): void {
    for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y++) {
      for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x++) {
        if (Math.hypot(x - centerX, y - centerY) <= radius) this.plot(x, y, symbol);
      }
    }
  }

  /** Fills every pixel whose middle lies inside the ellipse with these radii round `center`. */
  fillEllipse([centerX, centerY]: Point, radiusX: number, radiusY: number, symbol: string): void {
    for (let y = Math.floor(centerY - radiusY); y <= Math.ceil(centerY + radiusY); y++) {
      for (let x = Math.floor(centerX - radiusX); x <= Math.ceil(centerX + radiusX); x++) {
        if (((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2 <= 1) this.plot(x, y, symbol);
      }
    }
  }

  /**
   * Draws a straight line (Bresenham's algorithm) with a square brush. Both ends are rounded to
   * whole pixels first: the steps are whole pixels, so a fractional end would never be reached.
   */
  line(from: Point, to: Point, thickness: number, symbol: string): void {
    let x = Math.round(from[0]);
    let y = Math.round(from[1]);
    const endX = Math.round(to[0]);
    const endY = Math.round(to[1]);
    const distanceX = Math.abs(endX - x);
    const distanceY = -Math.abs(endY - y);
    const stepX = x < endX ? 1 : -1;
    const stepY = y < endY ? 1 : -1;
    let error = distanceX + distanceY;

    for (;;) {
      this.square([x, y], thickness, symbol);
      if (x === endX && y === endY) return;

      const doubledError = 2 * error;
      if (doubledError >= distanceY) {
        error += distanceY;
        x += stepX;
      }
      if (doubledError <= distanceX) {
        error += distanceX;
        y += stepY;
      }
    }
  }

  /** Copies a pixel map onto the grid, skipping its transparent pixels. */
  stamp(map: PixelMap, left: number, top: number): void {
    map.forEach((row, y) => {
      [...row].forEach((symbol, x) => {
        if (symbol !== TRANSPARENT_PIXEL) this.plot(left + x, top + y, symbol);
      });
    });
  }

  /** Surrounds everything drawn so far with a one-pixel border: every empty pixel that touches a drawn one, side by side. */
  outline(symbol: string): void {
    const drawn = (x: number, y: number): boolean => {
      const cell = this.cells[y]?.[x];
      return cell !== undefined && cell !== TRANSPARENT_PIXEL && cell !== symbol;
    };
    const border: Array<readonly [number, number]> = [];
    this.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== TRANSPARENT_PIXEL) return;
        if (drawn(x - 1, y) || drawn(x + 1, y) || drawn(x, y - 1) || drawn(x, y + 1)) border.push([x, y]);
      });
    });
    border.forEach(([x, y]) => this.plot(x, y, symbol));
  }

  toPixelMap(): PixelMap {
    return this.cells.map((row) => row.join(''));
  }
}

/** Rotates a pixel map a quarter turn counter-clockwise. */
export function rotateCounterClockwise(map: PixelMap): PixelMap {
  const width = map[0]?.length ?? 0;
  return Array.from({ length: width }, (_, newRow) =>
    map.map((row) => row[width - 1 - newRow] ?? TRANSPARENT_PIXEL).join(''),
  );
}

/** Flips a pixel map left to right. */
export function mirrorPixelMap(map: PixelMap): PixelMap {
  return map.map((row) => [...row].reverse().join(''));
}
