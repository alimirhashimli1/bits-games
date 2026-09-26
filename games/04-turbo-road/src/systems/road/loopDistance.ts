/** A distance along the track brought back into one lap. */
export function wrapDistance(z: number, trackLength: number): number {
  return ((z % trackLength) + trackLength) % trackLength;
}

/** How far `to` is in front of `from`, going round the loop: always 0 or more. */
export function distanceAhead(from: number, to: number, trackLength: number): number {
  return wrapDistance(to - from, trackLength);
}
