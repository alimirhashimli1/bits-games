/**
 * Where the road forks, it becomes two roads, their centres `offset` road half-widths either
 * side of the old centre line. Everything on the road keeps its place relative to the road it
 * was on: left of the centre line follows the left branch, the rest the right one.
 */

/** Which branch something at `x` (before the split) follows: -1 left, 1 right. */
export function branchSide(x: number): -1 | 1 {
  return x < 0 ? -1 : 1;
}

/** Where something at `x` on the unsplit road is, once the branches are `offset` apart from the middle. */
export function onBranch(x: number, offset: number): number {
  return x + branchSide(x) * offset;
}

/** The centre of the branch nearest to `x`, a position on the split road. With no fork, the centre line. */
export function nearestBranchCentre(x: number, offset: number): number {
  return offset === 0 ? 0 : branchSide(x) * offset;
}
