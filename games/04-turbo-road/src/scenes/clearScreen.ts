import { COLORS } from '../config';

/** Paints the whole screen in the background colour, for scenes drawn on a plain backdrop. */
export function clearScreen(context: CanvasRenderingContext2D): void {
  context.fillStyle = COLORS.background;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}
