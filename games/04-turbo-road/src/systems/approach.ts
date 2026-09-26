/** Moves `value` towards `target` by at most `step`, without overshooting. */
export function approach(value: number, target: number, step: number): number {
  return value < target ? Math.min(target, value + step) : Math.max(target, value - step);
}
