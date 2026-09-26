import { SCENERY_SPRITES } from '../../content/sprites/scenery';
import { CAR, CRASH, ROAD, SCENERY, TRAFFIC } from '../../config';
import { onBranch } from '../road/fork';
import type { SceneryPlacement } from '../road/Track';
import type { CarState } from './carPhysics';

/** Scenery is drawn in sprite pixels; the car's position is in road half-widths. */
const HALF_WIDTHS_PER_PIXEL = SCENERY.worldUnitsPerPixel / ROAD.halfWidth;

/**
 * The first piece of solid scenery the car, at sideways position `carX`, is touching, among
 * `placements` beside a road whose branches are `branchOffset` from the middle.
 */
export function findCollision(
  carX: number,
  placements: readonly SceneryPlacement[],
  branchOffset: number,
): SceneryPlacement | null {
  return placements.find((placement) => isTouching(carX, placement, branchOffset)) ?? null;
}

/**
 * A slow knock: the car loses most of its speed and is nudged back towards the road, or off
 * to one side of a fork sign.
 */
export function bumpOff(car: CarState, hit: SceneryPlacement): CarState {
  const away = hit.offset === 0 ? (car.x < 0 ? -1 : 1) : -sideOf(hit);
  return { ...car, speed: car.speed * CRASH.bumpSpeedKept, x: car.x + away * CRASH.bumpPush };
}

function isTouching(carX: number, placement: SceneryPlacement, branchOffset: number): boolean {
  const { map, hitWidth } = SCENERY_SPRITES[placement.kind];
  if (hitWidth === 0) return false;

  // Scenery stands on the outer side of its spot, as the scenery renderer draws it, and a
  // fork sign centred on the median.
  const width = (map[0]?.length ?? 0) * HALF_WIDTHS_PER_PIXEL;
  const centre =
    placement.offset === 0 ? 0 : onBranch(placement.offset, branchOffset) + (sideOf(placement) * width) / 2;
  const reach = (hitWidth * HALF_WIDTHS_PER_PIXEL) / 2 + CAR.hitHalfWidth;
  return Math.abs(carX - centre) < reach;
}

/** -1 for scenery on the left of the road, 1 for the right. */
function sideOf(placement: SceneryPlacement): -1 | 1 {
  return placement.offset < 0 ? -1 : 1;
}

/**
 * Touching another vehicle: the Comet drops to a little below its speed, so the two drift
 * apart, and is knocked sideways away from it.
 */
export function bumpOffVehicle(car: CarState, vehicleX: number, vehicleSpeed: number): CarState {
  const away = car.x < vehicleX ? -1 : 1;
  return {
    ...car,
    speed: Math.min(car.speed, vehicleSpeed * TRAFFIC.bumpSpeedShare),
    x: car.x + away * TRAFFIC.bumpPush,
  };
}
