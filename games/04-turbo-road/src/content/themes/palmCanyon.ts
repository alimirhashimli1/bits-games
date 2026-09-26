import { SMALL_CLOUD } from '../backgrounds';
import type { StageTheme } from './theme';

/** Leg 2, left: a palm-lined oasis road on a sandy canyon floor, under flat-topped red walls. */
export const PALM_CANYON: StageTheme = {
  palette: {
    sky: ['#3a7ac8', '#5a8ad0', '#7a9ad0', '#a8a8c8', '#d8b89a', '#f0c88a'],
    grass: { light: '#bca45a', dark: '#ac944c' },
    rumble: { light: '#f4f4f4', dark: '#d8342c' },
    road: { light: '#7a6e68', dark: '#72665f' },
    laneLine: '#f4f4f4',
  },
  background: [
    {
      kind: 'sprites',
      speed: 0.15,
      palette: { w: '#fff4e8', s: '#e8c8a8' },
      sprites: [
        { map: SMALL_CLOUD, x: 60, y: 12 },
        { map: SMALL_CLOUD, x: 300, y: 20 },
        { map: SMALL_CLOUD, x: 520, y: 8 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.3,
      color: '#c88a5a',
      baseHeight: 30,
      maxHeight: 38,
      waves: [
        { amplitude: 14, cycles: 4, phase: 0.5 },
        { amplitude: 6, cycles: 9, phase: 2 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0.6,
      color: '#a4502e',
      baseHeight: 12,
      maxHeight: 22,
      waves: [
        { amplitude: 14, cycles: 6, phase: 1 },
        { amplitude: 4, cycles: 17, phase: 0.3 },
      ],
    },
  ],
  scenery: { tall: 'palm', low: 'scrub', building: 'cliff', obstacle: 'redRock' },
};
