import type { OffsetRect } from '../config';
import { FACING_VECTORS, OPPOSITE_FACING, type Facing } from './facing';
import type { Vector } from './playerMovement';

/**
 * Hitboxes and hurtboxes are plain rectangles in room pixels, separate from physics bodies:
 * a sword reaches further than a body, and a body only covers feet.
 */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** An offset rectangle placed round a point. */
export function rectAround(x: number, y: number, offset: OffsetRect): Rect {
  return { x: x + offset.x, y: y + offset.y, width: offset.width, height: offset.height };
}

export function centreOf(rect: Rect): Vector {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/**
 * Which way something is knocked when hit from `source`: straight away from it along whichever
 * axis they are further apart on, as on the original console, never diagonally.
 */
export function knockbackAway(source: Vector, target: Vector): Facing {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** A knockback velocity along a facing. */
export function knockbackVelocity(direction: Facing, speed: number): Vector {
  const { x, y } = FACING_VECTORS[direction];
  return { x: x * speed, y: y * speed };
}

/**
 * Her shield stops a pebble flying straight at her face: she faces back along its path, and is
 * walking or standing (a swing or a knockback leaves her open).
 */
export function shieldBlocks(wrenFacing: Facing, wrenReady: boolean, projectileDirection: Facing): boolean {
  return wrenReady && wrenFacing === OPPOSITE_FACING[projectileDirection];
}

/** Something the sword and spark can hit, which may also hurt Wren by touching her. */
export interface Hittable {
  readonly alive: boolean;
  /** Half hearts taken from Wren when she touches it. 0 for harmless things. */
  readonly contactDamage: number;
  hurtBox(): Rect;
  canBeHit(now: number): boolean;
  /** Takes the damage and is knocked `direction`. Returns true if that was its last hit. */
  takeHit(damage: number, direction: Facing, now: number): boolean;
}
