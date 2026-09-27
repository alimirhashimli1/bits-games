import { FACING_VECTORS, FACINGS, type Facing } from './facing';

/**
 * Walking rules for Wren, kept apart from Phaser so they can be checked on their own. They only
 * turn held directions into a velocity and a facing; the physics world does the moving.
 */

export interface Vector {
  readonly x: number;
  readonly y: number;
}

/** A physics body's edges in room pixels. `right` and `bottom` are the first pixels outside it. */
export interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** Answers whether the room pixel at (x, y) is part of something solid. */
export type SolidCheck = (x: number, y: number) => boolean;

/** -1, 0 or 1 on each axis. Opposite directions held together cancel out. */
export function heldDirection(held: Readonly<Record<Facing, boolean>>): Vector {
  return { x: Number(held.right) - Number(held.left), y: Number(held.down) - Number(held.up) };
}

/** The same speed in every direction, so walking diagonally is not faster. */
export function walkVelocity(direction: Vector, speed: number): Vector {
  const length = Math.hypot(direction.x, direction.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: (direction.x / length) * speed, y: (direction.y / length) * speed };
}

/**
 * Wren faces the direction pressed most recently, for as long as she is still going that way.
 * Walking diagonally keeps whichever of the two she already faced. Standing still keeps the facing.
 */
export function nextFacing(current: Facing, direction: Vector, justPressed: readonly Facing[]): Facing {
  const isAlong = (facing: Facing): boolean => {
    const vector = FACING_VECTORS[facing];
    return (vector.x !== 0 && vector.x === direction.x) || (vector.y !== 0 && vector.y === direction.y);
  };
  return justPressed.find(isAlong) ?? (isAlong(current) ? current : (FACINGS.find(isAlong) ?? current));
}

/**
 * Walking straight into the corner of something solid: which way to slide round it, -1 (up or
 * left) or 1 (down or right), or 0 for no slide. It slides only when one corner of her leading
 * edge is blocked and the other is free, and she overlaps the blocked tile by `margin` or less.
 * Her body is smaller than a tile, so its two corners are enough to find every tile in the way.
 */
export function cornerSlide(box: Box, direction: Vector, isSolid: SolidCheck, tileSize: number, margin: number): -1 | 0 | 1 {
  const horizontal = direction.x !== 0;
  if (horizontal === (direction.y !== 0)) return 0;

  // Her body sits between whole pixels as often as not, so every test uses the pixels it
  // actually touches: its edge rounded outwards. A body ending at 208.67 still covers pixel 208.
  const [start, end] = horizontal ? [box.top, box.bottom] : [box.left, box.right];
  const firstPixel = Math.floor(start);
  const lastPixel = Math.ceil(end) - 1;
  const forward = horizontal ? direction.x : direction.y;
  const ahead = forward > 0 ? Math.ceil(horizontal ? box.right : box.bottom) : Math.floor(horizontal ? box.left : box.top) - 1;
  const solidAt = (along: number): boolean => (horizontal ? isSolid(ahead, along) : isSolid(along, ahead));

  const nearBlocked = solidAt(firstPixel);
  if (nearBlocked === solidAt(lastPixel)) return 0;

  // How far she has to move sideways to clear the blocked tile.
  const overlap = nearBlocked
    ? (Math.floor(firstPixel / tileSize) + 1) * tileSize - start
    : end - Math.floor(lastPixel / tileSize) * tileSize;
  if (overlap > margin) return 0;
  return nearBlocked ? 1 : -1;
}
