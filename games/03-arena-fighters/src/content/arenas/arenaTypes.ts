import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

import type { FighterId } from '../roster';

/** Every arena: one for each fighter, plus the tower roof where the boss waits. */
export const ARENA_IDS = [
  'docks',
  'plaza',
  'mine',
  'powerStation',
  'bamboo',
  'monastery',
  'hangar',
  'gym',
  'ring',
  'ruins',
  'foundry',
  'rooftops',
  'casino',
  'clinic',
  'fieldCamp',
  'towerRoof',
] as const;

export type ArenaId = (typeof ARENA_IDS)[number];

/** Each fighter's home arena, where they are met in arcade mode. */
export const HOME_ARENAS: Readonly<Record<FighterId, ArenaId>> = {
  brand: 'docks',
  tala: 'plaza',
  grom: 'mine',
  nova: 'powerStation',
  kestrel: 'bamboo',
  wen: 'monastery',
  rook: 'hangar',
  knox: 'gym',
  cometa: 'ring',
  sable: 'ruins',
  kanan: 'foundry',
  mahmood: 'rooftops',
  rajab: 'casino',
  azar: 'clinic',
  osal: 'fieldCamp',
  vane: 'towerRoof',
};

/**
 * One picture layer of an arena. It scrolls at `scroll` times the camera's speed (0 stays put,
 * 1 moves with the floor), so far-off layers drift slowly and give the scene depth. A layer
 * with several frames plays them as a loop.
 */
export interface ArenaLayer {
  readonly name: string;
  readonly scroll: number;
  /** Screen row of the layer's top edge. */
  readonly top: number;
  readonly frames: readonly PixelMap[];
  readonly frameRate?: number;
  /** Drawn in front of the crowd rather than behind it, like a railing they stand behind. */
  readonly inFrontOfCrowd?: boolean;
}

/** One kind of person in the crowd: two frames standing about, and two cheering. */
export interface CrowdPerson {
  readonly idle: readonly [PixelMap, PixelMap];
  readonly cheer: readonly [PixelMap, PixelMap];
}

export interface ArenaCrowd {
  readonly people: readonly CrowdPerson[];
  /** Screen row the crowd's feet stand on. */
  readonly footY: number;
  /** Arena columns where someone stands. */
  readonly spots: readonly number[];
  readonly scroll: number;
}

/**
 * Everything drawn behind the fighters. Layers are listed back to front; the sky is flat bands
 * of colour behind them all, from the top of the screen down to the horizon.
 */
export interface ArenaDefinition {
  readonly id: ArenaId;
  readonly name: string;
  readonly sky: readonly string[];
  readonly horizonY: number;
  readonly palette: Palette;
  readonly layers: readonly ArenaLayer[];
  readonly crowd: ArenaCrowd;
}
