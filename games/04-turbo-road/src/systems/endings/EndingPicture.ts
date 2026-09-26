import type { Ending } from '../../content/endings/ending';
import { COMET_PALETTE, COMET_STRAIGHT } from '../../content/sprites/comet';
import { CAR, ENDING, ROAD, SCREEN } from '../../config';
import { smoothStep } from '../easing';
import { ParallaxBackground } from '../road/ParallaxBackground';
import { renderPixelSprite } from '../sprites/pixelSprites';

/** The road is this wide where it meets the horizon, and at the bottom of the screen, in pixels either side of its centre. */
const ROAD_FAR_HALF_WIDTH = 3;
const ROAD_NEAR_HALF_WIDTH = 110;
/** The edge strips, as a share of the road's half width, like the rumble strips in the race. */
const ROAD_EDGE_SHARE = 0.12;
const LINE_HALF_WIDTH_SHARE = 0.02;
/** Centre line dashes: bigger numbers make more, shorter dashes. */
const DASH_DEPTH = 3;
/** The landmark's base sits this far below the horizon, so it stands on the ground, not on the line. */
const LANDMARK_SINK = 2;

/**
 * The picture at a goal: its sky and horizon, the road running up to its landmark, and the
 * Comet driving up the road and parking, smaller as it goes.
 */
export class EndingPicture {
  private readonly background: ParallaxBackground;
  private readonly landmark: HTMLCanvasElement;
  private readonly comet = renderPixelSprite(COMET_STRAIGHT, COMET_PALETTE, 'Comet');

  constructor(private readonly ending: Ending) {
    this.background = new ParallaxBackground(ending.background, ending.sky);
    this.landmark = renderPixelSprite(ending.landmark.map, ending.landmark.palette, 'landmark');
  }

  /** `driven` is how far the Comet has come, from 0 at the bottom of the screen to 1 parked. */
  draw(context: CanvasRenderingContext2D, driven: number): void {
    this.background.draw(context);
    this.drawGround(context);
    const { landmark } = this;
    const landmarkTop = ROAD.horizonY + LANDMARK_SINK - landmark.height;
    context.drawImage(landmark, Math.round((SCREEN.width - landmark.width) / 2), landmarkTop);
    this.drawComet(context, smoothStep(Math.min(1, driven)));
  }

  /** Row by row from the horizon down: ground, the road's edges, the road, and its dashed centre line. */
  private drawGround(context: CanvasRenderingContext2D): void {
    const { ground, road, roadEdge, roadLine } = this.ending;
    const centre = SCREEN.width / 2;
    const depth = SCREEN.height - ROAD.horizonY;
    for (let y = ROAD.horizonY; y < SCREEN.height; y++) {
      // 0 at the horizon, 1 at the bottom of the screen.
      const near = (y - ROAD.horizonY + 1) / depth;
      const halfWidth = ROAD_FAR_HALF_WIDTH + (ROAD_NEAR_HALF_WIDTH - ROAD_FAR_HALF_WIDTH) * near;
      fillRow(context, y, 0, SCREEN.width, ground);
      fillRow(context, y, centre - halfWidth, centre + halfWidth, roadEdge);
      const tarmac = halfWidth * (1 - ROAD_EDGE_SHARE);
      fillRow(context, y, centre - tarmac, centre + tarmac, road);
      // Dashes shorten towards the horizon, as they would in perspective.
      if (Math.floor(DASH_DEPTH / near) % 2 === 0) {
        const line = Math.max(0.5, halfWidth * LINE_HALF_WIDTH_SHARE);
        fillRow(context, y, centre - line, centre + line, roadLine);
      }
    }
  }

  private drawComet(context: CanvasRenderingContext2D, along: number): void {
    const startBottom = SCREEN.height - CAR.screenBottomGap;
    const bottom = startBottom + (ENDING.parkedY - startBottom) * along;
    const scale = ENDING.startScale + (ENDING.parkedScale - ENDING.startScale) * along;
    const width = Math.round(this.comet.width * scale);
    const height = Math.round(this.comet.height * scale);
    context.drawImage(this.comet, Math.round((SCREEN.width - width) / 2), Math.round(bottom) - height, width, height);
  }
}

/** One row from `left` to `right`, in whole pixels, at least one pixel wide. */
function fillRow(context: CanvasRenderingContext2D, y: number, left: number, right: number, color: string): void {
  const start = Math.round(left);
  context.fillStyle = color;
  context.fillRect(start, y, Math.max(1, Math.round(right) - start), 1);
}
