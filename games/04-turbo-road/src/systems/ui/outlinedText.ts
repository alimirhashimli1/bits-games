import { type CanvasPixelTextOptions, drawPixelText, measurePixelText } from '@shared/pixel-font/canvasPixelText';

import { COLORS, SCREEN } from '../../config';

/** One pixel all round, plus the corner below right, which reads as a slight drop shadow. */
const OUTLINE_OFFSETS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [1, 1],
] as const;

/** Pixel text with a dark outline, so it reads over anything: sky, white clouds or road. */
export function drawOutlinedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: CanvasPixelTextOptions = {},
): void {
  for (const [dx, dy] of OUTLINE_OFFSETS) {
    drawPixelText(context, text, x + dx, y + dy, { ...options, color: COLORS.textOutline });
  }
  drawPixelText(context, text, x, y, options);
}

/** Outlined text centred across the screen. */
export function drawCenteredOutlinedText(
  context: CanvasRenderingContext2D,
  text: string,
  y: number,
  options: CanvasPixelTextOptions = {},
): void {
  drawOutlinedText(context, text, Math.round((SCREEN.width - measurePixelText(text, options.scale)) / 2), y, options);
}

/** Outlined text whose right edge is at `right`. */
export function drawRightAlignedOutlinedText(
  context: CanvasRenderingContext2D,
  text: string,
  right: number,
  y: number,
  options: CanvasPixelTextOptions = {},
): void {
  drawOutlinedText(context, text, right - measurePixelText(text, options.scale), y, options);
}
