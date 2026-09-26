import { createPixelCanvas } from '@shared/pixel-art/pixelMap';
import { drawCenteredPixelText, PIXEL_TEXT_CELL_HEIGHT } from '@shared/pixel-font/canvasPixelText';

import { GATE, type GateStyle } from '../../content/sprites/gates';

/** Draws a gate once, ready to be scaled onto the road each frame. */
export function createGateImage({ text, chequered, colors }: GateStyle): HTMLCanvasElement {
  const { width, height, postWidth, stripeHeight, bannerHeight, chequerSize } = GATE;
  const context = createPixelCanvas(width, height);

  for (let y = bannerHeight; y < height; y += stripeHeight) {
    context.fillStyle = Math.floor(y / stripeHeight) % 2 === 0 ? colors.postLight : colors.postDark;
    context.fillRect(0, y, postWidth, stripeHeight);
    context.fillRect(width - postWidth, y, postWidth, stripeHeight);
  }

  if (chequered) {
    for (let y = 0; y < bannerHeight; y += chequerSize) {
      for (let x = 0; x < width; x += chequerSize) {
        context.fillStyle = (x / chequerSize + y / chequerSize) % 2 === 0 ? colors.postLight : colors.postDark;
        context.fillRect(x, y, chequerSize, chequerSize);
      }
    }
  } else {
    context.fillStyle = colors.bannerEdge;
    context.fillRect(0, 0, width, bannerHeight);
  }
  // The chequers show round the edge, as wide as one square.
  const border = chequered ? chequerSize : 1;
  context.fillStyle = colors.banner;
  context.fillRect(border, border, width - border * 2, bannerHeight - border * 2);
  // The letters are one row shorter than the font's cell, which has a blank row below them.
  const letterHeight = PIXEL_TEXT_CELL_HEIGHT - 1;
  drawCenteredPixelText(context, text, Math.ceil((bannerHeight - letterHeight) / 2), { color: colors.text });
  return context.canvas;
}
