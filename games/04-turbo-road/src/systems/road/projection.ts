import { ROAD, SCREEN } from '../../config';

/** Where the camera is. It looks straight down the track, level with the horizon. */
export interface RoadCamera {
  /** Sideways, from the road's centre line. */
  readonly x: number;
  /** Height above the world's zero level. */
  readonly y: number;
  /** Distance along the track. */
  readonly z: number;
}

/** A point on the road's centre line, projected onto the screen. */
export interface ProjectedEdge {
  readonly x: number;
  readonly y: number;
  /** Pixels per world unit at this distance: everything here is drawn this much smaller. */
  readonly scale: number;
}

/** How far the screen sits in front of the camera, for the chosen field of view (1 = 90°). */
const CAMERA_DEPTH = 1 / Math.tan(((ROAD.fieldOfViewDegrees / 2) * Math.PI) / 180);
/** World units become pixels at the same rate sideways and upwards, so the road is not squashed. */
const PIXELS_PER_UNIT_AT_SCREEN = SCREEN.width / 2;

/**
 * Projects a point on the road's centre line onto the screen. Returns null for points at or
 * behind the screen, which cannot be drawn.
 */
export function projectRoadPoint(camera: RoadCamera, x: number, y: number, z: number): ProjectedEdge | null {
  const distance = z - camera.z;
  if (distance <= CAMERA_DEPTH) return null;

  const scale = pixelsPerUnitAt(distance);
  return {
    x: SCREEN.width / 2 + scale * (x - camera.x),
    y: ROAD.horizonY - scale * (y - camera.y),
    scale,
  };
}

/** How many screen pixels one world unit covers, `distance` ahead of the camera. */
export function pixelsPerUnitAt(distance: number): number {
  return (CAMERA_DEPTH / distance) * PIXELS_PER_UNIT_AT_SCREEN;
}
