import type { SpriteAssets } from '@shared/phaser/pixelSprites';
import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';
import { TRANSPARENT_PIXEL } from '@shared/pixel-art/pixelMap';

import { SCREEN } from '../../config';
import type { ArenaDefinition, ArenaId, ArenaLayer } from '../arenas/arenaTypes';

/** Small enough for sixteen across four rows, and the same shape as the screen (16:9). */
export const THUMBNAIL = { width: 48, height: 27 } as const;

/**
 * Symbols a thumbnail's palette may use: every printable character but the transparent one.
 * An arena is a handful of sky bands and one palette, so far fewer than this ever come up.
 */
const SYMBOLS: readonly string[] = Array.from({ length: 126 - 33 + 1 }, (_, index) => String.fromCharCode(33 + index)).filter(
  (symbol) => symbol !== TRANSPARENT_PIXEL,
);

export function arenaThumbnailKey(id: ArenaId): string {
  return `${id}-thumbnail`;
}

/**
 * An arena shrunk to a thumbnail for the arena select, painted from the arena itself rather
 * than drawn a second time by hand: every pixel is the colour the real screen would show at
 * that spot, so a stage cannot be picked from a picture that has stopped matching it.
 *
 * It samples the arena as it stands with the camera at the left-hand wall, front layer first,
 * falling back to the sky. The crowd is left out: at this size people are a pixel each and only
 * muddy the colours that make a stage recognisable.
 */
export function createArenaThumbnail(arena: ArenaDefinition): SpriteAssets {
  const symbols = new Map<string, string>();
  const map: string[] = [];

  for (let y = 0; y < THUMBNAIL.height; y += 1) {
    let row = '';
    for (let x = 0; x < THUMBNAIL.width; x += 1) {
      const color = colorAt(arena, sample(x, THUMBNAIL.width, SCREEN.width), sample(y, THUMBNAIL.height, SCREEN.height));
      row += symbolFor(symbols, color, arena);
    }
    map.push(row);
  }

  const palette: Palette = Object.fromEntries([...symbols].map(([color, symbol]) => [symbol, color]));
  return { sheet: { key: arenaThumbnailKey(arena.id), palette, frames: { stage: map as PixelMap } }, animations: [] };
}

/** The middle of the block of real pixels this thumbnail pixel stands for. */
function sample(index: number, of: number, across: number): number {
  return Math.floor(((index + 0.5) * across) / of);
}

/**
 * What is seen at one point of the arena. Layers are listed back to front, so they are searched
 * the other way round and the first one with something at that point wins, exactly as the real
 * arena stacks them.
 */
function colorAt(arena: ArenaDefinition, x: number, y: number): string {
  for (let index = arena.layers.length - 1; index >= 0; index -= 1) {
    const layer = arena.layers[index];
    if (!layer) continue;
    const symbol = pixelOf(layer, x, y);
    if (symbol === undefined) continue;
    const color = arena.palette[symbol];
    if (color !== undefined) return color;
  }
  return skyAt(arena, y);
}

/** A layer's pixel at a point on screen, or nothing where the layer does not reach or is see-through. */
function pixelOf(layer: ArenaLayer, x: number, y: number): string | undefined {
  const row = layer.frames[0]?.[y - layer.top];
  const symbol = row?.[x];
  return symbol === undefined || symbol === TRANSPARENT_PIXEL ? undefined : symbol;
}

/** The sky's bands run from the top of the screen down to the horizon, as `ArenaView` draws them. */
function skyAt(arena: ArenaDefinition, y: number): string {
  const { sky, horizonY } = arena;
  const last = sky[sky.length - 1] ?? '#000000';
  if (y >= horizonY) return last;
  const band = Math.min(Math.floor((y * sky.length) / horizonY), sky.length - 1);
  return sky[band] ?? last;
}

function symbolFor(symbols: Map<string, string>, color: string, arena: ArenaDefinition): string {
  const known = symbols.get(color);
  if (known !== undefined) return known;

  const symbol = SYMBOLS[symbols.size];
  if (symbol === undefined) throw new Error(`Arena "${arena.id}" needs more thumbnail colours than there are symbols.`);
  symbols.set(color, symbol);
  return symbol;
}
