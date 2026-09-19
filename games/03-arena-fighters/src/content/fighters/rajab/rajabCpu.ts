import type { CpuStyle } from '../cpuStyle';

/** Rajab deals cards from a middle distance, happy to go in, and waits for the opponent to overplay their hand. */
export const RAJAB_CPU: CpuStyle = {
  preferredRange: 64,
  aggression: 0.55,
  jumpiness: 0.12,
  projectileLove: 0.5,
  throwLove: 0.25,
};
