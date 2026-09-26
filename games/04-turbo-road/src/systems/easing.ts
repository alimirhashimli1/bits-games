/** A gentle S-shaped blend from 0 to 1, flat at both ends. */
export function smoothStep(t: number): number {
  return (1 - Math.cos(Math.PI * t)) / 2;
}
