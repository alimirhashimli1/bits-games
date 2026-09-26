import type { RoadPalette, StripeColors } from '../../content/palettes';
import { FINISH_LINE } from '../../content/sprites/gates';
import { ROAD, SCREEN } from '../../config';
import { type ProjectedEdge, projectRoadPoint, type RoadCamera } from './projection';
import type { Segment, Track } from './Track';

/** The colours of one segment: every band is light or dark together. */
interface SegmentColors {
  readonly grass: string;
  readonly rumble: string;
  readonly road: string;
  /** Lane lines are dashed: only light segments have them. */
  readonly laneLine: string | null;
}

/** Where the player's camera is on the track. Its height follows the road beneath it. */
export interface RoadView {
  /** Sideways, from the road's centre line. */
  readonly x: number;
  /** Distance along the track. */
  readonly z: number;
}

/** A segment as it was drawn this frame, for the scenery drawn over the road afterwards. */
export interface ProjectedSegment {
  readonly segment: Segment;
  /** The segment's near and far edges on screen. */
  readonly near: ProjectedEdge;
  readonly far: ProjectedEdge;
  /** The highest row nearer road had already covered: anything of this segment below it is hidden. */
  readonly clipBottom: number;
}

/**
 * Draws the ground and the road ahead of the camera, over whatever sky is already there.
 *
 * Segments are drawn near to far, each as a stack of one-pixel rows of whole-pixel rectangles,
 * so every edge is sharp. `clipBottom` is the highest row drawn so far: a farther segment only
 * fills the rows above it, which is how a hill crest hides the road behind it.
 *
 * Curves: each segment's bend is added to a running sideways step (`dx`), and each step to a
 * running offset (`x`), so the road ahead swings further and further out, like a real bend.
 *
 * Forks: where the road splits, each row is drawn as two roads, pulled apart either side of
 * the old centre line.
 *
 * Returns every segment in view, nearest first, with the row it was clipped at.
 */
export function drawRoad(
  context: CanvasRenderingContext2D,
  track: Track,
  view: RoadView,
  palette: RoadPalette,
): readonly ProjectedSegment[] {
  // Ground too far away to be drawn as a segment is still grass.
  context.fillStyle = palette.grass.dark;
  context.fillRect(0, ROAD.horizonY, SCREEN.width, SCREEN.height - ROAD.horizonY);

  const z = track.wrap(view.z);
  const camera: RoadCamera = { x: view.x, y: ROAD.cameraHeight + track.heightAt(z), z };
  const base = track.segmentAt(z);
  // The camera is part-way into its segment, so that segment's bend has partly happened already.
  let dx = -base.curve * ((z - base.z) / track.segmentLength);
  let x = 0;
  let clipBottom: number = SCREEN.height;
  const projected: ProjectedSegment[] = [];

  for (let offset = 0; offset < ROAD.drawDistance; offset++) {
    const segment = track.segmentAfter(base.index, offset);
    // Segments past the end of the lap are drawn one lap further on, so the loop is seamless.
    const segmentZ = segment.z + (segment.index < base.index ? track.length : 0);
    const near = projectRoadPoint(camera, x, segment.nearY, segmentZ);
    const far = projectRoadPoint(camera, x + dx, segment.farY, segmentZ + track.segmentLength);
    x += dx;
    dx += segment.curve;
    if (!near || !far) continue;
    projected.push({ segment, near, far, clipBottom });

    // A climb can rise past the top of the screen; there is nothing to draw above row 0.
    const top = Math.max(0, Math.round(far.y));
    const bottom = Math.min(Math.round(near.y), clipBottom);
    // Nothing left to fill: hidden behind a nearer crest, or facing away down the far side of one.
    if (top >= bottom) continue;

    drawSegmentRows(context, segment, near, far, top, bottom, segmentColors(segment, palette));
    clipBottom = top;
  }
  return projected;
}

function segmentColors(segment: Segment, palette: RoadPalette): SegmentColors {
  const light = Math.floor(segment.index / ROAD.stripeSegments) % 2 === 0;
  const pick = (colors: StripeColors): string => (light ? colors.light : colors.dark);
  return {
    grass: pick(palette.grass),
    rumble: pick(palette.rumble),
    road: pick(palette.road),
    laneLine: light ? palette.laneLine : null,
  };
}

/** Fills rows `top` to `bottom - 1`, blending the road's position and width between the segment's two edges. */
function drawSegmentRows(
  context: CanvasRenderingContext2D,
  segment: Segment,
  near: ProjectedEdge,
  far: ProjectedEdge,
  top: number,
  bottom: number,
  colors: SegmentColors,
): void {
  const height = near.y - far.y;
  const nearHalfWidth = near.scale * ROAD.halfWidth;
  const farHalfWidth = far.scale * ROAD.halfWidth;
  const nearBranch = segment.branchNear * nearHalfWidth;
  const farBranch = segment.branchFar * farHalfWidth;

  for (let y = top; y < bottom; y++) {
    // 0 at the far edge, 1 at the near edge, measured through the middle of the row.
    const t = height > 0 ? (y + 0.5 - far.y) / height : 1;
    const centre = far.x + (near.x - far.x) * t;
    const halfWidth = farHalfWidth + (nearHalfWidth - farHalfWidth) * t;
    const branch = farBranch + (nearBranch - farBranch) * t;
    drawRow(context, y, branch > 0 ? [centre - branch, centre + branch] : [centre], halfWidth, colors);
    // Two rows of squares deep, the far half of the segment offset from the near half.
    if (segment.finish) drawChequers(context, y, centre, halfWidth, t < FINISH_ROW_SPLIT ? 1 : 0);
  }
}

/** The far half of a finish segment is one row of chequers, the near half the other. */
const FINISH_ROW_SPLIT = 0.5;

/** One row of the chequered finish line across the tarmac. `shift` 1 starts on a dark square. */
function drawChequers(context: CanvasRenderingContext2D, y: number, centre: number, halfWidth: number, shift: number): void {
  const squareWidth = (halfWidth * 2) / FINISH_LINE.squares;
  for (let square = 0; square < FINISH_LINE.squares; square++) {
    const left = centre - halfWidth + square * squareWidth;
    const color = (square + shift) % 2 === 0 ? FINISH_LINE.light : FINISH_LINE.dark;
    fillSpan(context, y, left, left + squareWidth, color);
  }
}

/**
 * One row of ground with one road across it, or two after a fork. Every road's rumble strips
 * go down before any tarmac, so where two branches still overlap they read as one wide road.
 */
function drawRow(
  context: CanvasRenderingContext2D,
  y: number,
  centres: readonly number[],
  halfWidth: number,
  colors: SegmentColors,
): void {
  context.fillStyle = colors.grass;
  context.fillRect(0, y, SCREEN.width, 1);

  const rumbleHalfWidth = halfWidth * (1 + ROAD.rumbleWidth);
  for (const centre of centres) fillSpan(context, y, centre - rumbleHalfWidth, centre + rumbleHalfWidth, colors.rumble);
  for (const centre of centres) fillSpan(context, y, centre - halfWidth, centre + halfWidth, colors.road);

  const { laneLine } = colors;
  if (!laneLine) return;
  const laneWidth = (halfWidth * 2) / ROAD.lanes;
  const lineHalfWidth = (halfWidth * ROAD.laneLineWidth) / 2;
  for (const centre of centres) {
    for (let lane = 1; lane < ROAD.lanes; lane++) {
      const lineX = centre - halfWidth + lane * laneWidth;
      // Where two branches still overlap, a line crossing the other branch's tarmac is left out,
      // so the overlap reads as one wide road rather than a tangle of lines.
      const onOtherBranch = centres.some((other) => other !== centre && Math.abs(lineX - other) < halfWidth);
      if (!onOtherBranch) fillSpan(context, y, lineX - lineHalfWidth, lineX + lineHalfWidth, laneLine);
    }
  }
}

/** One row from `left` to `right`, rounded to whole pixels and never less than one pixel wide. */
function fillSpan(context: CanvasRenderingContext2D, y: number, left: number, right: number, color: string): void {
  const start = Math.round(left);
  const width = Math.max(1, Math.round(right) - start);
  context.fillStyle = color;
  context.fillRect(start, y, width, 1);
}
