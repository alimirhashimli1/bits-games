import { ROAD, SCENERY } from '../../config';
import type { SceneryImages } from '../sprites/sceneryImages';
import { onBranch } from './fork';
import type { ProjectedSegment } from './roadRenderer';
import { VEHICLE_UNITS_PER_PIXEL } from './roadUsers';
import type { SceneryPlacement, Track } from './Track';

/** A vehicle to draw on the road: where it is, and its picture. */
export interface RoadVehicleSprite {
  /** Distance along the track. */
  readonly z: number;
  /** Sideways, in road half-widths. */
  readonly x: number;
  readonly image: HTMLCanvasElement;
}

/** The pictures of everything that stands still beside or across the road. */
export interface RoadImages {
  readonly scenery: SceneryImages;
  readonly checkpointGate: HTMLCanvasElement;
  /** The finish gate of the stage's goal, on a stage that ends at one. */
  readonly finishGate: HTMLCanvasElement | null;
}

/**
 * Draws everything standing on or beside the road, far to near, so nearer things cover
 * farther ones: a palm can hide a truck, and a truck a palm. Each sprite is cut off at the row
 * its segment was clipped at, so nothing shows through a hill.
 */
export function drawRoadSprites(
  context: CanvasRenderingContext2D,
  projected: readonly ProjectedSegment[],
  track: Track,
  images: RoadImages,
  vehicles: readonly RoadVehicleSprite[],
): void {
  const vehiclesBySegment = groupBySegment(vehicles, track);

  for (let index = projected.length - 1; index >= 0; index--) {
    const entry = projected[index];
    if (!entry) continue;
    // Vehicles are somewhere inside the segment, so beyond the scenery and gate at its near edge.
    for (const vehicle of vehiclesBySegment.get(entry.segment.index) ?? []) {
      drawVehicle(context, vehicle, entry, track.segmentLength);
    }
    for (const placement of entry.segment.scenery) drawScenery(context, images.scenery[placement.kind], placement, entry);
    if (entry.segment.checkpoint !== null) drawGate(context, images.checkpointGate, entry);
    if (entry.segment.finish && images.finishGate) drawGate(context, images.finishGate, entry);
  }
}

/**
 * Scenery stands at its segment's near edge, on the outer side of its spot, so it never
 * reaches over the road; after a fork, beside its own branch. At offset 0 it stands centred.
 */
function drawScenery(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  placement: SceneryPlacement,
  { segment, near, clipBottom }: ProjectedSegment,
): void {
  const pixelSize = SCENERY.worldUnitsPerPixel * near.scale;
  const width = image.width * pixelSize;
  const offset = placement.offset === 0 ? 0 : onBranch(placement.offset, segment.branchNear);
  const anchorX = near.x + offset * ROAD.halfWidth * near.scale;
  const left = placement.offset === 0 ? anchorX - width / 2 : placement.offset < 0 ? anchorX - width : anchorX;
  drawClipped(context, image, left, near.y, pixelSize, clipBottom);
}

/** A gate stands across the road at its segment's near edge, centred on the road. */
function drawGate(context: CanvasRenderingContext2D, image: HTMLCanvasElement, { near, clipBottom }: ProjectedSegment): void {
  const pixelSize = SCENERY.worldUnitsPerPixel * near.scale;
  drawClipped(context, image, near.x - (image.width * pixelSize) / 2, near.y, pixelSize, clipBottom);
}

/** A vehicle can be anywhere in its segment, so it is placed between the segment's two edges. */
function drawVehicle(
  context: CanvasRenderingContext2D,
  vehicle: RoadVehicleSprite,
  { segment, near, far, clipBottom }: ProjectedSegment,
  segmentLength: number,
): void {
  const along = (vehicle.z - segment.z) / segmentLength;
  const blend = (from: number, to: number): number => from + (to - from) * along;
  const scale = blend(near.scale, far.scale);
  const centre = blend(near.x, far.x) + vehicle.x * ROAD.halfWidth * scale;
  const pixelSize = VEHICLE_UNITS_PER_PIXEL * scale;
  drawClipped(context, vehicle.image, centre - (vehicle.image.width * pixelSize) / 2, blend(near.y, far.y), pixelSize, clipBottom);
}

/** Draws a sprite standing on `bottom`, scaled by `pixelSize`, with anything below `clipBottom` cut off. */
function drawClipped(
  context: CanvasRenderingContext2D,
  image: HTMLCanvasElement,
  left: number,
  bottom: number,
  pixelSize: number,
  clipBottom: number,
): void {
  const width = image.width * pixelSize;
  const height = image.height * pixelSize;
  if (width < 1) return;

  const top = bottom - height;
  const visibleHeight = Math.min(bottom, clipBottom) - top;
  if (visibleHeight <= 0) return;

  // Only the part above the clip row is copied from the sprite.
  const sourceHeight = (image.height * visibleHeight) / height;
  context.drawImage(
    image,
    0,
    0,
    image.width,
    sourceHeight,
    Math.round(left),
    Math.round(top),
    Math.round(width),
    Math.round(visibleHeight),
  );
}

/** Vehicles listed under their segment, farthest first, so they are drawn in the right order within it. */
function groupBySegment(vehicles: readonly RoadVehicleSprite[], track: Track): Map<number, RoadVehicleSprite[]> {
  const groups = new Map<number, RoadVehicleSprite[]>();
  for (const vehicle of [...vehicles].sort((a, b) => b.z - a.z)) {
    const index = track.segmentAt(vehicle.z).index;
    groups.set(index, [...(groups.get(index) ?? []), vehicle]);
  }
  return groups;
}
