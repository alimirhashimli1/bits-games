import { CAR, ROAD, TRAFFIC } from '../../config';
import { distanceAhead } from './loopDistance';
import { pixelsPerUnitAt } from './projection';

/** What drivers need to know about the road: how long it is, and where it forks. A `Track` is one. */
export interface RoadMap {
  readonly length: number;
  /** How far each branch is from the old centre line at `z`, in road half-widths: 0 before any fork. */
  branchOffsetAt(z: number): number;
}

/** Anything driving on the road. Sideways positions are in road half-widths, like the Comet's. */
export interface RoadUser {
  /** Distance along the track, within one lap. */
  readonly z: number;
  readonly x: number;
  readonly speed: number;
}

/** A road user with a width, for anyone deciding whether it is in their way. */
export interface Obstacle extends RoadUser {
  /** Half its width, in road half-widths. */
  readonly halfWidth: number;
  /** Where it is heading sideways: the centre of the lane it is moving into, or just `x`. */
  readonly headingX: number;
}

/**
 * True if `other` is in the way of something `halfWidth` wide at `x`, either where it is now
 * or where it is heading. Two drivers never both move into the same gap.
 */
export function isInPath(other: Obstacle, x: number, halfWidth: number): boolean {
  const reach = halfWidth + other.halfWidth;
  return Math.abs(other.x - x) < reach || Math.abs(other.headingX - x) < reach;
}

/**
 * Vehicle sprites are drawn at the same size as the Comet: one sprite pixel covers this many
 * world units, which is what one screen pixel covers where the Comet is.
 */
export const VEHICLE_UNITS_PER_PIXEL = 1 / pixelsPerUnitAt(CAR.distanceAhead);

/** Half the width of a vehicle whose sprite is `pixels` wide, in road half-widths. */
export function spriteHalfWidth(pixels: number): number {
  return (pixels * VEHICLE_UNITS_PER_PIXEL) / ROAD.halfWidth / 2;
}

/** The Comet, as other drivers see it. */
export function cometObstacle(player: RoadUser): Obstacle {
  return { ...player, halfWidth: CAR.hitHalfWidth, headingX: player.x };
}

/** How far a driver closes on something ahead while braking away a speed difference of `closing`. */
export function brakingDistance(closing: number, braking: number): number {
  return closing > 0 ? (closing * closing) / (2 * braking) : 0;
}

/** True if the nose of `self` is touching the back of `other`. */
export function isTouching(self: Obstacle, other: Obstacle, trackLength: number): boolean {
  return (
    distanceAhead(self.z, other.z, trackLength) < TRAFFIC.length &&
    Math.abs(other.x - self.x) < other.halfWidth + self.halfWidth
  );
}
