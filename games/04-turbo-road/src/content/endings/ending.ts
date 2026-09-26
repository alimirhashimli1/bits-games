import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

import type { BackgroundLayer } from '../backgrounds';

/**
 * The scene at the end of a route: the road runs up to the goal's landmark on the horizon,
 * under its own sky, and the Comet drives in and parks.
 */
export interface Ending {
  /** Bands of sky from the top of the screen down to the horizon. */
  readonly sky: readonly string[];
  readonly background: readonly BackgroundLayer[];
  /** The ground either side of the road, the road, its edges and its centre line. */
  readonly ground: string;
  readonly road: string;
  readonly roadEdge: string;
  readonly roadLine: string;
  /** The goal itself, standing where the road meets the horizon. */
  readonly landmark: { readonly map: PixelMap; readonly palette: Palette };
  /** What happens next, a line or two. */
  readonly story: readonly string[];
}
