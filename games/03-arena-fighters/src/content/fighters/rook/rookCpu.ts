import type { CpuStyle } from '../cpuStyle';

/** Rook waits: he keeps his distance behind his Rail Shots and lets you be the one to jump. */
export const ROOK_CPU: CpuStyle = {
  preferredRange: 64,
  aggression: 0.5,
  jumpiness: 0.05,
  projectileLove: 0.5,
  throwLove: 0.2,
};
