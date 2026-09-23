import type { CpuStyle } from '../cpuStyle';

/**
 * Vane holds the middle of the arena and makes you come to him: he sits just outside the range
 * of most fighters' pokes, throws the crown at anything that stands still, and answers a jump
 * with the fist. He almost never jumps himself, and he has no throw to go for.
 */
export const VANE_CPU: CpuStyle = {
  preferredRange: 66,
  aggression: 0.75,
  jumpiness: 0.05,
  projectileLove: 0.3,
  throwLove: 0.2,
};
