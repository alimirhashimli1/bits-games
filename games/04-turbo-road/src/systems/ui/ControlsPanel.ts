import { drawCenteredPixelText, drawPixelText } from '@shared/pixel-font/canvasPixelText';

import { CONTROLS_HELP } from '../../content/controlsHelp';
import { COLORS } from '../../config';

const HEADING_Y = 24;
const HEADER_Y = 44;
const FIRST_ROW_Y = 58;
const ROW_HEIGHT = 12;
/** Left edges of the three columns. */
const ACTION_X = 12;
const KEYBOARD_X = 96;
const GAMEPAD_X = 208;
const PROMPT_Y = 156;

/** The table of controls, drawn over whatever is behind it: the title's backdrop or the paused race. */
export function drawControlsPanel(context: CanvasRenderingContext2D): void {
  drawCenteredPixelText(context, 'CONTROLS', HEADING_Y, { color: COLORS.title });
  drawPixelText(context, 'KEYBOARD', KEYBOARD_X, HEADER_Y, { color: COLORS.muted });
  drawPixelText(context, 'GAMEPAD', GAMEPAD_X, HEADER_Y, { color: COLORS.muted });
  CONTROLS_HELP.forEach(({ action, keyboard, gamepad }, row) => {
    const y = FIRST_ROW_Y + row * ROW_HEIGHT;
    drawPixelText(context, action, ACTION_X, y, { color: COLORS.selected });
    drawPixelText(context, keyboard, KEYBOARD_X, y, { color: COLORS.text });
    drawPixelText(context, gamepad, GAMEPAD_X, y, { color: COLORS.text });
  });
  drawCenteredPixelText(context, 'PRESS START OR ESC TO GO BACK', PROMPT_Y, { color: COLORS.muted });
}
