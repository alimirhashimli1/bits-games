import { drawCenteredPixelText } from '@shared/pixel-font/canvasPixelText';

import type { StageId } from '../content/stages/stage';
import { COLORS } from '../config';
import { placeName } from '../systems/scores/highScores';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { afterRace } from './afterRace';
import { clearScreen } from './clearScreen';

const HEADING_Y = 56;
const HEADING_SCALE = 2;
const SCORE_Y = 84;
const PLACE_Y = 96;
const PROMPT_Y = 128;

/** The clock ran out: the score, and the stage it ran out on. START goes on to the high scores. */
export class GameOverScene implements Scene {
  constructor(
    private readonly game: GameContext,
    private readonly score: number,
    private readonly stage: StageId,
  ) {}

  update(): void {
    if (this.game.input.justPressed('confirm')) this.game.scenes.go(afterRace(this.game, this.score, this.stage));
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawCenteredPixelText(context, 'GAME OVER', HEADING_Y, { color: COLORS.title, scale: HEADING_SCALE });
    drawCenteredPixelText(context, `SCORE ${this.score}`, SCORE_Y, { color: COLORS.text });
    drawCenteredPixelText(context, `OUT OF TIME ON ${placeName(this.stage)}`, PLACE_Y, { color: COLORS.muted });
    drawCenteredPixelText(context, 'PRESS START', PROMPT_Y, { color: COLORS.muted });
  }
}
