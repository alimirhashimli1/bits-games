import { LARGE_CLOUD, SMALL_CLOUD } from '../backgrounds';
import type { StageTheme } from './theme';

/** Leg 3: up through the pine forest towards snow-capped peaks, past log cabins. */
export const PINEWOOD_PASS: StageTheme = {
  palette: {
    sky: ['#3a70c0', '#4a82cc', '#5a94d6', '#72a8de', '#94c0e6', '#bcd8ee'],
    grass: { light: '#3e8e46', dark: '#357c3c' },
    rumble: { light: '#f4f4f4', dark: '#2a5ab8' },
    road: { light: '#666674', dark: '#5e5e6c' },
    laneLine: '#f4f4f4',
  },
  background: [
    {
      kind: 'sprites',
      speed: 0.15,
      palette: { w: '#ffffff', s: '#d8e4f0' },
      sprites: [
        { map: LARGE_CLOUD, x: 90, y: 6 },
        { map: SMALL_CLOUD, x: 340, y: 14 },
        { map: LARGE_CLOUD, x: 500, y: 4 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.25,
      color: '#7a86a8',
      baseHeight: 32,
      cap: { color: '#f0f4fa', from: 38 },
      waves: [
        { amplitude: 14, cycles: 3, phase: 0.8 },
        { amplitude: 7, cycles: 8, phase: 2.2 },
        { amplitude: 2, cycles: 23, phase: 0.1 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.4,
      color: '#4e6284',
      baseHeight: 16,
      waves: [
        { amplitude: 7, cycles: 5, phase: 1.1 },
        { amplitude: 3, cycles: 12, phase: 0.6 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.6,
      color: '#1d5a2a',
      baseHeight: 6,
      waves: [
        { amplitude: 3, cycles: 5, phase: 0.4 },
        // Many short, sharp waves read as the tops of a line of pines.
        { amplitude: 2, cycles: 90, phase: 0 },
      ],
    },
  ],
  scenery: { tall: 'pine', low: 'bush', building: 'cabin', obstacle: 'rock' },
};
