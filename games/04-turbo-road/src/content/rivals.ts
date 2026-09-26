import type { Palette } from '@shared/pixel-art/pixelMap';

import { coupePalette } from './sprites/rivals';

/** One of the three drivers racing the Comet. */
export interface RivalDriver {
  readonly name: string;
  readonly palette: Palette;
  /** Their speed with a clear road, in world units per step. The Comet's top speed is 200. */
  readonly cruise: number;
  /** How far ahead of the Comet they start, in world units. */
  readonly startAhead: number;
  /** The lane they start in: 0 is the left-hand one. */
  readonly startLane: number;
}

/**
 * The slowest starts nearest. Rivals get away at the start, and a clean flat-out run catches
 * them after about 16, 21 and 32 seconds: the last one takes a good drive.
 */
export const RIVAL_DRIVERS: readonly RivalDriver[] = [
  {
    name: 'JUNO REYES',
    palette: coupePalette({ paint: '#1fb5a8', shade: '#137a72', shine: '#6fe0d4', wing: '#0f5a54', helmet: '#f4f4f4' }),
    cruise: 174,
    startAhead: 1000,
    startLane: 0,
  },
  {
    name: 'BROCK HALE',
    palette: coupePalette({ paint: '#3a3a48', shade: '#26262f', shine: '#6a6a80', wing: '#d8242c', helmet: '#ffd23f' }),
    cruise: 180,
    startAhead: 2500,
    startLane: 2,
  },
  {
    name: 'SABLE QUINN',
    palette: coupePalette({ paint: '#8a3ad8', shade: '#5a2296', shine: '#c080ff', wing: '#f2c230', helmet: '#e8e8f0' }),
    cruise: 186,
    startAhead: 5000,
    startLane: 1,
  },
];
