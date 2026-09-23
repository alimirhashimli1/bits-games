import type { CpuStyle } from '../cpuStyle';

/** Knox has to be close to do anything, so he closes the gap and keeps the pressure on. */
export const KNOX_CPU: CpuStyle = {
  preferredRange: 40,
  aggression: 0.75,
  jumpiness: 0.1,
  projectileLove: 0,
  throwLove: 0.3,
};
