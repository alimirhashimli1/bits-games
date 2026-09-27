import type { Facing } from '../facing';
import type { Vector } from '../playerMovement';

/** The way to charge if Wren is in line with `from` along a row or a column (within `tolerance`), or null. */
export function chargeDirection(from: Vector, wren: Vector, tolerance: number): Facing | null {
  if (Math.abs(wren.x - from.x) <= tolerance) return wren.y > from.y ? 'down' : 'up';
  if (Math.abs(wren.y - from.y) <= tolerance) return wren.x > from.x ? 'right' : 'left';
  return null;
}
