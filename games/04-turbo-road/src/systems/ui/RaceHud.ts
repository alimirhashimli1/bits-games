import { measurePixelText, PIXEL_TEXT_CELL_HEIGHT } from '@shared/pixel-font/canvasPixelText';

import { COLORS, SCREEN } from '../../config';
import type { Gear } from '../driving/carPhysics';
import { drawCenteredOutlinedText, drawRightAlignedOutlinedText, drawOutlinedText } from './outlinedText';

/** Everything the HUD shows, read from the race each frame. */
export interface HudReadout {
  readonly score: number;
  readonly rivalsBehind: number;
  readonly rivalCount: number;
  readonly seconds: number;
  readonly timeIsLow: boolean;
  readonly stageName: string;
  /** How far through the stage the Comet is, from 0 to 1. */
  readonly progress: number;
  readonly kmh: number;
  readonly gear: Gear;
}

const MARGIN = 4;
const LINE = PIXEL_TEXT_CELL_HEIGHT + 1;
const BIG = 2;
const TIME_Y = MARGIN + LINE;
const RIVALS_Y = MARGIN + LINE * 2 + 1;
const PROGRESS_BAR = { width: 64, height: 5, y: MARGIN + LINE + 1 } as const;
const SPEED_Y = SCREEN.height - MARGIN - PIXEL_TEXT_CELL_HEIGHT * BIG;
const GEAR_Y = SPEED_Y - LINE;
/** Letters are one row shorter than the font's cell. */
const LETTER_HEIGHT = PIXEL_TEXT_CELL_HEIGHT - 1;
/** "KM/H" sits just after the speed, its letters lined up with the bottom of the big digits. */
const UNIT_GAP = 2;
const UNIT_Y = SPEED_Y + LETTER_HEIGHT * BIG - LETTER_HEIGHT;

/**
 * The race readout, in the arcade layout: score and rivals top left, the clock top centre,
 * the stage and a progress bar top right, speed and gear bottom left.
 */
export function drawRaceHud(context: CanvasRenderingContext2D, hud: HudReadout): void {
  const right = SCREEN.width - MARGIN;

  drawOutlinedText(context, 'SCORE', MARGIN, MARGIN, { color: COLORS.title });
  drawOutlinedText(context, String(Math.floor(hud.score)), MARGIN, MARGIN + LINE, { color: COLORS.text });
  drawOutlinedText(context, `RIVALS ${hud.rivalsBehind}/${hud.rivalCount}`, MARGIN, RIVALS_Y, { color: COLORS.text });

  drawCenteredOutlinedText(context, 'TIME', MARGIN, { color: COLORS.title });
  drawCenteredOutlinedText(context, String(hud.seconds), TIME_Y, {
    color: hud.timeIsLow ? COLORS.warning : COLORS.text,
    scale: BIG,
  });

  drawRightAlignedOutlinedText(context, hud.stageName, right, MARGIN, { color: COLORS.title });
  drawProgressBar(context, right - PROGRESS_BAR.width, hud.progress);

  drawOutlinedText(context, hud.gear.toUpperCase(), MARGIN, GEAR_Y, { color: COLORS.title });
  const speed = String(Math.round(hud.kmh));
  drawOutlinedText(context, speed, MARGIN, SPEED_Y, { color: COLORS.text, scale: BIG });
  const unitX = MARGIN + measurePixelText(speed, BIG) + UNIT_GAP;
  drawOutlinedText(context, 'KM/H', unitX, UNIT_Y, { color: COLORS.text });
}

/** An outlined bar, filled from the left as the stage goes by. */
function drawProgressBar(context: CanvasRenderingContext2D, left: number, progress: number): void {
  const { width, height, y } = PROGRESS_BAR;
  context.fillStyle = COLORS.textOutline;
  context.fillRect(left + 1, y + 1, width, height);
  context.fillStyle = COLORS.text;
  context.fillRect(left, y, width, height);
  context.fillStyle = COLORS.textOutline;
  context.fillRect(left + 1, y + 1, width - 2, height - 2);
  context.fillStyle = COLORS.title;
  context.fillRect(left + 1, y + 1, Math.round((width - 2) * Math.min(1, Math.max(0, progress))), height - 2);
}
