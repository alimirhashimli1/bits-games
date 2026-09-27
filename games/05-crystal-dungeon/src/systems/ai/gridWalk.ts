import { ROOM } from '../../config';
import { FACING_VECTORS, FACINGS, OPPOSITE_FACING, type Facing } from '../facing';
import type { Vector } from '../playerMovement';
import type { Cell } from '../worldMap';

/**
 * Walking from tile to tile, as most ground enemies do: they only decide where to go when they
 * stand in the middle of a tile, so they keep to the grid and turn corners cleanly.
 */

/** Whether an enemy may walk onto this cell: inside the room and not solid. */
export type OpenCellCheck = (cell: Cell) => boolean;

/** A number from 0 up to (not including) 1, like Math.random. Passed in so tests can fix it. */
export type Random = () => number;

export function cellAt({ x, y }: Vector): Cell {
  return { column: Math.floor(x / ROOM.tileSize), row: Math.floor(y / ROOM.tileSize) };
}

export function middleOf({ column, row }: Cell): Vector {
  return { x: (column + 0.5) * ROOM.tileSize, y: (row + 0.5) * ROOM.tileSize };
}

export function neighbour({ column, row }: Cell, facing: Facing): Cell {
  const { x, y } = FACING_VECTORS[facing];
  return { column: column + x, row: row + y };
}

/**
 * Picks the way to go next from a tile's middle: usually straight on, sometimes a turn, and back
 * the way it came only when there is no other way. Null when it is boxed in.
 */
export function chooseHeading(current: Facing, cell: Cell, isOpen: OpenCellCheck, turnChance: number, random: Random): Facing | null {
  const open = FACINGS.filter((facing) => isOpen(neighbour(cell, facing)));
  if (open.length === 0) return null;
  if (open.includes(current) && random() >= turnChance) return current;
  const forwards = open.filter((facing) => facing !== OPPOSITE_FACING[current]);
  const choices = forwards.length > 0 ? forwards : open;
  return choices[Math.floor(random() * choices.length)] ?? null;
}

/** A whole number of milliseconds between the two ends of a range, both included. */
export function between([min, max]: readonly [number, number], random: Random): number {
  return Math.round(min + random() * (max - min));
}

/**
 * Where a walker is heading: the middle of the tile it is walking to. It walks straight at it,
 * which also brings it back onto the grid after being knocked off it.
 */
export class GridWalk {
  private target: Vector | null = null;

  /** Forgets where it was going: the next decision is made from the middle of the tile it is in. */
  reset(): void {
    this.target = null;
  }

  /** True when it has no target, or has reached it: the moment to decide where to go next. */
  arrived(position: Vector): boolean {
    return this.target === null || (position.x === this.target.x && position.y === this.target.y);
  }

  goTo(target: Vector): void {
    this.target = target;
  }

  /**
   * The velocity towards the target at `speed`, or where to stop exactly if it would get there
   * within this frame, so it never overshoots the middle of a tile.
   */
  step(position: Vector, speed: number, deltaMs: number): { readonly velocity: Vector; readonly snapTo?: Vector } {
    const target = this.target;
    if (!target) return { velocity: { x: 0, y: 0 } };
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= (speed * deltaMs) / 1000) return { velocity: { x: 0, y: 0 }, snapTo: target };
    return { velocity: { x: (dx / distance) * speed, y: (dy / distance) * speed } };
  }
}
