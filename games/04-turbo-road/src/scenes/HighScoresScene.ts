import { drawCenteredPixelText, drawPixelText, measurePixelText } from '@shared/pixel-font/canvasPixelText';

import { COLORS, ROUTE_MAP } from '../config';
import { type HighScore, loadHighScores, placeName } from '../systems/scores/highScores';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { clearScreen } from './clearScreen';
import { TitleScene } from './TitleScene';

const HEADING_Y = 24;
const HEADER_Y = 48;
const FIRST_ROW_Y = 62;
const ROW_HEIGHT = 14;
/** Columns: rank and initials on the left, the score right-aligned, then where the race ended. */
const RANK_X = 28;
const INITIALS_X = 52;
const SCORE_RIGHT = 150;
const PLACE_X = 166;
const PROMPT_Y = 156;

/**
 * The best five scores in this browser. Straight after a new one is entered, its line blinks.
 * START or Esc goes back to the title.
 */
export class HighScoresScene implements Scene {
  private readonly scores: readonly HighScore[] = loadHighScores();
  private steps = 0;

  constructor(
    private readonly game: GameContext,
    /** The line to pick out, 0 at the top, if one was just added. */
    private readonly highlight: number | null = null,
  ) {}

  update(): void {
    this.steps++;
    const { input } = this.game;
    if (input.justPressed('confirm') || input.justPressed('cancel')) this.game.scenes.go(new TitleScene(this.game));
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawCenteredPixelText(context, 'BEST DRIVERS', HEADING_Y, { color: COLORS.title });
    drawPixelText(context, 'SCORE', SCORE_RIGHT - measurePixelText('SCORE'), HEADER_Y, { color: COLORS.muted });
    drawPixelText(context, 'REACHED', PLACE_X, HEADER_Y, { color: COLORS.muted });

    // Blinks on the same beat as the next stage on the route map.
    const blinkOff = Math.floor(this.steps / ROUTE_MAP.blinkSteps) % 2 === 1;
    this.scores.forEach(({ initials, score, place }, row) => {
      const isNew = row === this.highlight;
      if (isNew && blinkOff) return;
      const color = isNew ? COLORS.selected : COLORS.text;
      const y = FIRST_ROW_Y + row * ROW_HEIGHT;
      drawPixelText(context, `${row + 1}.`, RANK_X, y, { color });
      drawPixelText(context, initials, INITIALS_X, y, { color });
      const points = String(score);
      drawPixelText(context, points, SCORE_RIGHT - measurePixelText(points), y, { color });
      drawPixelText(context, placeName(place), PLACE_X, y, { color });
    });
    drawCenteredPixelText(context, 'PRESS START', PROMPT_Y, { color: COLORS.muted });
  }
}
