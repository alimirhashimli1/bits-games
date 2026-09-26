import { LARGE_CLOUD, SMALL_CLOUD } from '../backgrounds';
import type { StageTheme } from './theme';

/** Leg 1: a clear afternoon on the coast road, blue mountains inland and green headlands. */
export const SUNSET_COAST: StageTheme = {
  palette: {
    sky: ['#2f7fd6', '#3a8fe0', '#4aa2ea', '#5ab4f0', '#72c4f4', '#9ad6f6'],
    grass: { light: '#44b04c', dark: '#379a40' },
    rumble: { light: '#f4f4f4', dark: '#d8342c' },
    road: { light: '#6e6e7c', dark: '#666674' },
    laneLine: '#f4f4f4',
  },
  background: [
    {
      kind: 'sprites',
      speed: 0.15,
      palette: { w: '#ffffff', s: '#cfe6f6' },
      sprites: [
        { map: LARGE_CLOUD, x: 20, y: 14 },
        { map: SMALL_CLOUD, x: 130, y: 30 },
        { map: LARGE_CLOUD, x: 250, y: 8 },
        { map: SMALL_CLOUD, x: 380, y: 22 },
        { map: LARGE_CLOUD, x: 470, y: 34 },
        { map: SMALL_CLOUD, x: 580, y: 12 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.3,
      color: '#5a7fb8',
      baseHeight: 20,
      waves: [
        { amplitude: 8, cycles: 3, phase: 0 },
        { amplitude: 5, cycles: 7, phase: 1.3 },
        { amplitude: 2, cycles: 19, phase: 0.4 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.6,
      color: '#2e8a4a',
      baseHeight: 7,
      waves: [
        { amplitude: 4, cycles: 5, phase: 2.1 },
        { amplitude: 2, cycles: 13, phase: 0.7 },
      ],
    },
  ],
  scenery: { tall: 'palm', low: 'bush', building: 'hut', obstacle: 'rock' },
};
