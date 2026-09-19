import type { CpuStyle } from '../cpuStyle';

/** Grom walks straight in and looks for a throw: up close is where all his damage is. */
export const GROM_CPU: CpuStyle = {
  preferredRange: 30,
  aggression: 0.6,
  jumpiness: 0.1,
  projectileLove: 0,
  throwLove: 0.55,
};
