import { MOON } from '../backgrounds';
import type { StageTheme } from './theme';

/**
 * Leg 2, right: night on the harbour quays, lit by street lamps, with the lights of the town
 * across the bay. Bright rumble strips and lane lines keep the road easy to read in the dark.
 */
export const HARBOUR_LIGHTS: StageTheme = {
  palette: {
    sky: ['#070a1e', '#0a0e2a', '#0e1436', '#141a44', '#1c2252', '#262c60'],
    grass: { light: '#2e3244', dark: '#282c3c' },
    rumble: { light: '#e8e8f0', dark: '#f2c230' },
    road: { light: '#3c3c4c', dark: '#363646' },
    laneLine: '#f2f2f8',
  },
  background: [
    { kind: 'stars', speed: 0.05, count: 70, colors: ['#ffffff', '#9ab0ff', '#fff4b0'], seed: 11 },
    { kind: 'sprites', speed: 0.05, palette: { m: '#f4f0d8', M: '#c8c4b0' }, sprites: [{ map: MOON, x: 420, y: 10 }] },
    {
      kind: 'ridge',
      speed: 0.2,
      color: '#141a3a',
      baseHeight: 14,
      waves: [
        { amplitude: 6, cycles: 3, phase: 1 },
        { amplitude: 3, cycles: 8, phase: 0.2 },
      ],
    },
    {
      kind: 'skyline',
      speed: 0.4,
      color: '#1c2140',
      width: { min: 6, max: 16 },
      height: { min: 5, max: 16 },
      litShare: 0.35,
      windowColors: ['#f2c84b', '#fff4b0'],
      seed: 5,
    },
  ],
  scenery: { tall: 'lamp', low: 'bollard', building: 'warehouse', obstacle: 'crates' },
};
