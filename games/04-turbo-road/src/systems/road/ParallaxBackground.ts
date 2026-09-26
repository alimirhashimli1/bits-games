import { createPixelCanvas, drawPixelMap, measurePixelMap } from '@shared/pixel-art/pixelMap';

import type { BackgroundLayer, RidgeLayer, SkylineLayer, SpriteLayer, StarLayer } from '../../content/backgrounds';
import { BACKGROUND, ROAD, SCREEN } from '../../config';
import { seededRandom } from '../random';

interface DrawnLayer {
  readonly canvas: HTMLCanvasElement;
  readonly speed: number;
  /** How far the layer has slid to the left, in pixels. */
  offset: number;
}

/** Stars keep clear of the bottom of the sky, where the ridges and skylines stand. */
const STARLESS_BAND = 16;
/** Skyline windows: one lit pixel in every block of this many, across and down. */
const WINDOW_SPACING = 3;
/** Buildings have a plain band this deep along the top before the first row of windows. */
const ROOF_DEPTH = 2;

/**
 * The sky and the layers of scenery on the horizon. Each layer is drawn once onto a canvas
 * that repeats sideways, and slides through bends at its own speed.
 */
export class ParallaxBackground {
  private readonly layers: DrawnLayer[];

  constructor(
    layers: readonly BackgroundLayer[],
    private readonly sky: readonly string[],
  ) {
    this.layers = layers.map((layer) => ({ canvas: drawLayer(layer), speed: layer.speed, offset: 0 }));
  }

  /** Slides the layers for a stretch of road: a right bend moves the scenery left, as turning right would. */
  scroll(curve: number, segmentsDriven: number): void {
    for (const layer of this.layers) {
      layer.offset = wrap(layer.offset + curve * segmentsDriven * layer.speed, BACKGROUND.layerWidth);
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    const bandHeight = Math.ceil(ROAD.horizonY / this.sky.length);
    this.sky.forEach((color, band) => {
      context.fillStyle = color;
      context.fillRect(0, band * bandHeight, SCREEN.width, bandHeight);
    });

    for (const layer of this.layers) {
      // Two copies side by side always cover the screen, since a layer is wider than it.
      const left = -Math.round(layer.offset);
      context.drawImage(layer.canvas, left, 0);
      context.drawImage(layer.canvas, left + BACKGROUND.layerWidth, 0);
    }
  }
}

function drawLayer(layer: BackgroundLayer): HTMLCanvasElement {
  const context = createPixelCanvas(BACKGROUND.layerWidth, ROAD.horizonY);
  switch (layer.kind) {
    case 'sprites':
      drawSprites(context, layer);
      break;
    case 'ridge':
      drawRidge(context, layer);
      break;
    case 'stars':
      drawStars(context, layer);
      break;
    case 'skyline':
      drawSkyline(context, layer);
      break;
  }
  return context.canvas;
}

function drawSprites(context: CanvasRenderingContext2D, layer: SpriteLayer): void {
  layer.sprites.forEach(({ map, x, y }, index) => {
    // Throws if a sprite's rows are uneven, which would otherwise draw it skewed.
    measurePixelMap(map, `sky sprite ${index}`);
    drawPixelMap(context, map, layer.palette, x, y);
  });
}

/** One column of pixels at a time, rising from the horizon to the ridge line. */
function drawRidge(context: CanvasRenderingContext2D, layer: RidgeLayer): void {
  for (let x = 0; x < BACKGROUND.layerWidth; x++) {
    const across = (x / BACKGROUND.layerWidth) * Math.PI * 2;
    const height = layer.waves.reduce(
      (total, wave) => total + wave.amplitude * Math.sin(across * wave.cycles + wave.phase),
      layer.baseHeight,
    );
    const rounded = Math.max(0, Math.round(Math.min(height, layer.maxHeight ?? Infinity)));
    context.fillStyle = layer.color;
    context.fillRect(x, ROAD.horizonY - rounded, 1, rounded);
    if (layer.cap && rounded > layer.cap.from) {
      context.fillStyle = layer.cap.color;
      context.fillRect(x, ROAD.horizonY - rounded, 1, rounded - layer.cap.from);
    }
  }
}

function drawStars(context: CanvasRenderingContext2D, layer: StarLayer): void {
  const random = seededRandom(layer.seed);
  for (let star = 0; star < layer.count; star++) {
    const x = Math.floor(random() * BACKGROUND.layerWidth);
    const y = Math.floor(random() * (ROAD.horizonY - STARLESS_BAND));
    context.fillStyle = pick(layer.colors, random());
    context.fillRect(x, y, 1, 1);
  }
}

/** Buildings side by side, the last one sized to end exactly at the layer's edge so it repeats without a seam. */
function drawSkyline(context: CanvasRenderingContext2D, layer: SkylineLayer): void {
  const random = seededRandom(layer.seed);
  const between = (range: { readonly min: number; readonly max: number }): number =>
    Math.round(range.min + random() * (range.max - range.min));

  for (let left = 0; left < BACKGROUND.layerWidth; ) {
    const remaining = BACKGROUND.layerWidth - left;
    const width = remaining < layer.width.min * 2 ? remaining : Math.min(remaining, between(layer.width));
    const height = between(layer.height);
    const top = ROAD.horizonY - height;
    context.fillStyle = layer.color;
    context.fillRect(left, top, width, height);

    for (let y = top + ROOF_DEPTH; y < ROAD.horizonY - 1; y += WINDOW_SPACING) {
      for (let x = left + 1; x < left + width - 1; x += WINDOW_SPACING) {
        if (random() >= layer.litShare) continue;
        context.fillStyle = pick(layer.windowColors, random());
        context.fillRect(x, y, 1, 1);
      }
    }
    left += width;
  }
}

/** One of `choices`, picked by a number between 0 and 1. */
function pick(choices: readonly string[], share: number): string {
  return choices[Math.floor(share * choices.length)] ?? choices[0] ?? '#ffffff';
}

function wrap(value: number, range: number): number {
  return ((value % range) + range) % range;
}
