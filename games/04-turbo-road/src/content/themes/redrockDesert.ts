import { SUN } from '../backgrounds';
import type { StageTheme } from './theme';

/** Leg 3: a straight hot road across the sand, cacti and buttes, mesas on the horizon. */
export const REDROCK_DESERT: StageTheme = {
  palette: {
    sky: ['#3a8ad8', '#52a0e0', '#6ab4e8', '#8ac8ec', '#b8dcec', '#f0e4c0'],
    grass: { light: '#e2b872', dark: '#d6aa64' },
    rumble: { light: '#f4f4f4', dark: '#d8342c' },
    road: { light: '#8a7e76', dark: '#827670' },
    laneLine: '#f4f4f4',
  },
  background: [
    { kind: 'sprites', speed: 0.05, palette: { s: '#fff8e0', g: '#fce8b0' }, sprites: [{ map: SUN, x: 180, y: 8 }] },
    {
      kind: 'ridge',
      speed: 0.25,
      color: '#d89a6a',
      baseHeight: 12,
      maxHeight: 24,
      waves: [
        { amplitude: 16, cycles: 3, phase: 0.2 },
        { amplitude: 8, cycles: 7, phase: 1.7 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.5,
      color: '#b8603a',
      baseHeight: 2,
      maxHeight: 15,
      waves: [
        { amplitude: 16, cycles: 4, phase: 2.4 },
        { amplitude: 5, cycles: 11, phase: 0.9 },
      ],
    },
  ],
  scenery: { tall: 'cactus', low: 'scrub', building: 'cliff', obstacle: 'redRock' },
};
