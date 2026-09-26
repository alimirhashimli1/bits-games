import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

/**
 * The scenery beyond the road: layers stacked on the horizon, drawn back to front. Each slides
 * sideways through a bend at its own speed (pixels per unit of bend per segment driven), so far
 * layers drift and near ones sweep past, which makes the bend feel deep.
 */
export type BackgroundLayer = SpriteLayer | RidgeLayer | StarLayer | SkylineLayer;

/** Pixel-art pictures at fixed places in the sky: clouds, the sun, the moon. */
export interface SpriteLayer {
  readonly kind: 'sprites';
  readonly speed: number;
  readonly palette: Palette;
  readonly sprites: readonly { readonly map: PixelMap; readonly x: number; readonly y: number }[];
}

/** A skyline of hills or mountains, its height built from a few sine waves. */
export interface RidgeLayer {
  readonly kind: 'ridge';
  readonly speed: number;
  readonly color: string;
  /** Height above the horizon, in pixels, before the waves are added. */
  readonly baseHeight: number;
  /**
   * `cycles` is how many times the wave repeats across the layer. Whole numbers make the
   * layer's two ends meet, so it can repeat forever without a seam.
   */
  readonly waves: readonly { readonly amplitude: number; readonly cycles: number; readonly phase: number }[];
  /** Cuts the tops off at this height, for flat-topped mesas and canyon walls. */
  readonly maxHeight?: number;
  /** Paints everything above `from` pixels in `color`, for snow-capped peaks. */
  readonly cap?: { readonly color: string; readonly from: number };
}

/** Points of light scattered over the sky, the same every time for the same `seed`. */
export interface StarLayer {
  readonly kind: 'stars';
  readonly speed: number;
  readonly count: number;
  readonly colors: readonly string[];
  readonly seed: number;
}

/** A row of buildings along the horizon, their windows lit at random, the same for the same `seed`. */
export interface SkylineLayer {
  readonly kind: 'skyline';
  readonly speed: number;
  readonly color: string;
  /** Building sizes are picked between these, in pixels. */
  readonly width: { readonly min: number; readonly max: number };
  readonly height: { readonly min: number; readonly max: number };
  /** Share of windows lit, each in one of `windowColors`. */
  readonly litShare: number;
  readonly windowColors: readonly string[];
  readonly seed: number;
}

export const SMALL_CLOUD: PixelMap = [
  '....wwww......',
  '..wwwwwwww....',
  '.wwwwwwwwwww..',
  'wwwwwwwwwwwwww',
  '.ssssssssssss.',
];

export const LARGE_CLOUD: PixelMap = [
  '.......wwwww..........',
  '....wwwwwwwwww........',
  '...wwwwwwwwwwwwwwww...',
  '.wwwwwwwwwwwwwwwwwwww.',
  'wwwwwwwwwwwwwwwwwwwwww',
  '.ssssssssssssssssssss.',
  '...ssssssssssssssss...',
];

/** A full moon: `m` is its face and `M` the darker seas on it. */
export const MOON: PixelMap = [
  '....mmmm....',
  '..mmmmmmmm..',
  '.mmmmmMmmmm.',
  '.mmmMMmmmmm.',
  'mmmmMmmmmmmm',
  'mmmmmmmmmMmm',
  'mmmmmmmmMMmm',
  'mmMmmmmmmmmm',
  '.mMMmmmmmmm.',
  '.mmmmmmmmmm.',
  '..mmmmmmmm..',
  '....mmmm....',
];

/** The desert sun, `s`, with a paler ring round it, `g`. */
export const SUN: PixelMap = [
  '.....gggg.....',
  '...ggssssgg...',
  '..gssssssssg..',
  '.gssssssssssg.',
  '.gssssssssssg.',
  'gssssssssssssg',
  'gssssssssssssg',
  'gssssssssssssg',
  'gssssssssssssg',
  '.gssssssssssg.',
  '.gssssssssssg.',
  '..gssssssssg..',
  '...ggssssgg...',
  '.....gggg.....',
];
