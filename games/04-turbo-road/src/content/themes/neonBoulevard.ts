import type { StageTheme } from './theme';

/**
 * Leg 3: night on the city's neon strip, between towers and billboards. The rumble strips
 * glow cyan and pink, so the edges of the road stand out against the dark pavement.
 */
export const NEON_BOULEVARD: StageTheme = {
  palette: {
    sky: ['#0c0418', '#140626', '#1e0a36', '#2c0e46', '#401456', '#5a1a64'],
    grass: { light: '#221c30', dark: '#1c1828' },
    rumble: { light: '#6af0ff', dark: '#ff4ad0' },
    road: { light: '#302c3e', dark: '#2a2638' },
    laneLine: '#f4f4f4',
  },
  background: [
    { kind: 'stars', speed: 0.05, count: 30, colors: ['#ffffff', '#ffc0f0'], seed: 23 },
    {
      kind: 'skyline',
      speed: 0.25,
      color: '#1a1030',
      width: { min: 10, max: 24 },
      height: { min: 20, max: 50 },
      litShare: 0.3,
      windowColors: ['#ff4ad0', '#6af0ff', '#ffd66a'],
      seed: 3,
    },
    {
      kind: 'skyline',
      speed: 0.45,
      color: '#0e0a1a',
      width: { min: 8, max: 18 },
      height: { min: 8, max: 28 },
      litShare: 0.2,
      windowColors: ['#ffd66a', '#6af0ff'],
      seed: 9,
    },
  ],
  scenery: { tall: 'neonLamp', low: 'hedge', building: 'tower', obstacle: 'neonSign' },
};
