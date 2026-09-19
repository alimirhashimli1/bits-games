import type { PixelGrid } from '@shared/pixel-art/pixelGrid';

import { SCREEN, STAGE } from '../../config';

/** How wide a layer must be to cover the screen at every camera position, given how fast it scrolls. */
export function layerWidth(scroll: number): number {
  return Math.ceil(SCREEN.width + (STAGE.width - SCREEN.width) * scroll);
}

/** A filled circle, cut off below `lowestRow` (for a sun half under the horizon, say). */
export function fillCircle(grid: PixelGrid, centerX: number, centerY: number, radius: number, symbol: string, lowestRow = Infinity): void {
  for (let y = centerY - radius; y <= Math.min(centerY + radius, lowestRow); y++) {
    for (let x = centerX - radius; x <= centerX + radius; x++) {
      if ((x - centerX) ** 2 + (y - centerY) ** 2 <= radius ** 2) grid.plot(x, y, symbol);
    }
  }
}
