import { createPixelCanvas, drawPixelMap } from '@shared/pixel-art/pixelMap';

import { GLYPH_HEIGHT, GLYPH_WIDTH, GLYPHS } from './glyphs';

/**
 * The pixel font for games drawn straight onto a 2D canvas, without Phaser. It uses the same
 * glyphs and spacing as `addPixelText`, so text looks the same in every game.
 */

/** Each character cell has one empty column and row after the glyph, for spacing. */
export const PIXEL_TEXT_CELL_WIDTH = GLYPH_WIDTH + 1;
export const PIXEL_TEXT_CELL_HEIGHT = GLYPH_HEIGHT + 1;

const CHARACTERS = Object.keys(GLYPHS);
const CHARACTER_INDEX = new Map(CHARACTERS.map((character, index) => [character, index]));

/** One strip of every glyph per colour, drawn the first time that colour is used. */
const sheets = new Map<string, HTMLCanvasElement>();

export interface CanvasPixelTextOptions {
  /** Any CSS colour. */
  readonly color?: string;
  /** Whole-number size multiplier, so letters stay on the pixel grid. */
  readonly scale?: number;
}

/** Width of `text` in pixels, counting the spacing column after the last letter. */
export function measurePixelText(text: string, scale = 1): number {
  return text.length * PIXEL_TEXT_CELL_WIDTH * scale;
}

/** Draws `text` with its top-left corner at (`x`, `y`). Lowercase letters use the uppercase shapes. */
export function drawPixelText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  { color = '#ffffff', scale = 1 }: CanvasPixelTextOptions = {},
): void {
  const sheet = glyphSheet(color);
  const left = Math.round(x);
  const top = Math.round(y);

  [...text.toUpperCase()].forEach((character, position) => {
    const index = CHARACTER_INDEX.get(character);
    if (index === undefined) return;

    context.drawImage(
      sheet,
      index * PIXEL_TEXT_CELL_WIDTH,
      0,
      PIXEL_TEXT_CELL_WIDTH,
      PIXEL_TEXT_CELL_HEIGHT,
      left + position * PIXEL_TEXT_CELL_WIDTH * scale,
      top,
      PIXEL_TEXT_CELL_WIDTH * scale,
      PIXEL_TEXT_CELL_HEIGHT * scale,
    );
  });
}

/** Draws `text` centred across the whole canvas, snapped to a whole pixel. */
export function drawCenteredPixelText(
  context: CanvasRenderingContext2D,
  text: string,
  y: number,
  options: CanvasPixelTextOptions = {},
): void {
  const x = Math.round((context.canvas.width - measurePixelText(text, options.scale)) / 2);
  drawPixelText(context, text, x, y, options);
}

function glyphSheet(color: string): HTMLCanvasElement {
  const cached = sheets.get(color);
  if (cached) return cached;

  const context = createPixelCanvas(CHARACTERS.length * PIXEL_TEXT_CELL_WIDTH, PIXEL_TEXT_CELL_HEIGHT);
  CHARACTERS.forEach((character, index) => {
    const glyph = GLYPHS[character];
    if (glyph) drawPixelMap(context, glyph, { '#': color }, index * PIXEL_TEXT_CELL_WIDTH, 0);
  });

  sheets.set(color, context.canvas);
  return context.canvas;
}
