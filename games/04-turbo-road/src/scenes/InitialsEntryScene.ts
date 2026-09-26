import { playSound } from '@shared/audio/audioEngine';
import {
  drawCenteredPixelText,
  drawPixelText,
  PIXEL_TEXT_CELL_HEIGHT,
  PIXEL_TEXT_CELL_WIDTH,
} from '@shared/pixel-font/canvasPixelText';

import { MENU_MOVE, MENU_SELECT } from '../content/sounds';
import { COLORS, HIGH_SCORES, ROUTE_MAP, SCREEN } from '../config';
import { addHighScore, loadHighScores, placeName, type RacePlace, saveHighScores } from '../systems/scores/highScores';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { clearScreen } from './clearScreen';
import { HighScoresScene } from './HighScoresScene';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const HEADING_Y = 28;
const SCORE_Y = 50;
const PLACE_Y = 62;
const LETTERS_Y = 86;
const LETTER_SCALE = 3;
/** Space between letters, in screen pixels. */
const LETTER_GAP = 6;
/** The cursor's underline sits this far below the letter. */
const UNDERLINE_GAP = 3;
const HINT_Y = 132;
const LINE_HEIGHT = 10;

/**
 * A new high score: the driver spells three initials. Up and down change the letter, left and
 * right move between letters, START moves on and, on the last letter, saves. Esc steps back.
 */
export class InitialsEntryScene implements Scene {
  /** Each initial, as a place in `LETTERS`. */
  private readonly letters: number[] = Array.from({ length: HIGH_SCORES.initialsLength }, () => 0);
  private cursor = 0;
  private steps = 0;

  constructor(
    private readonly game: GameContext,
    private readonly score: number,
    private readonly place: RacePlace,
  ) {}

  private get initials(): string {
    return this.letters.map((letter) => LETTERS[letter] ?? '').join('');
  }

  update(): void {
    this.steps++;
    const { input } = this.game;
    if (input.justPressed('up')) this.changeLetter(1);
    if (input.justPressed('down')) this.changeLetter(-1);
    if (input.justPressed('left') || input.justPressed('cancel')) this.moveCursor(-1);
    if (input.justPressed('right')) this.moveCursor(1);
    if (input.justPressed('confirm')) this.confirm();
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawCenteredPixelText(context, 'NEW HIGH SCORE!', HEADING_Y, { color: COLORS.title });
    drawCenteredPixelText(context, String(this.score), SCORE_Y, { color: COLORS.text });
    drawCenteredPixelText(context, placeName(this.place), PLACE_Y, { color: COLORS.muted });

    const letterWidth = PIXEL_TEXT_CELL_WIDTH * LETTER_SCALE;
    const totalWidth = this.letters.length * letterWidth + (this.letters.length - 1) * LETTER_GAP;
    const left = Math.round((SCREEN.width - totalWidth) / 2);
    const blinkOn = Math.floor(this.steps / ROUTE_MAP.blinkSteps) % 2 === 0;
    [...this.initials].forEach((letter, index) => {
      const x = left + index * (letterWidth + LETTER_GAP);
      const isCursor = index === this.cursor;
      drawPixelText(context, letter, x, LETTERS_Y, { color: isCursor ? COLORS.selected : COLORS.text, scale: LETTER_SCALE });
      if (isCursor && blinkOn) {
        context.fillStyle = COLORS.selected;
        // Below the letter, which is one row shorter than the font's cell.
        const underlineY = LETTERS_Y + (PIXEL_TEXT_CELL_HEIGHT - 1) * LETTER_SCALE + UNDERLINE_GAP;
        context.fillRect(x, underlineY, letterWidth - LETTER_SCALE, LETTER_SCALE - 1);
      }
    });

    drawCenteredPixelText(context, 'UP DOWN: LETTER   LEFT RIGHT: MOVE', HINT_Y, { color: COLORS.muted });
    drawCenteredPixelText(context, 'START: NEXT LETTER, THEN SAVE', HINT_Y + LINE_HEIGHT, { color: COLORS.muted });
  }

  private changeLetter(step: number): void {
    const current = this.letters[this.cursor] ?? 0;
    this.letters[this.cursor] = (current + step + LETTERS.length) % LETTERS.length;
    playSound(MENU_MOVE);
  }

  private moveCursor(step: number): void {
    const next = Math.max(0, Math.min(this.letters.length - 1, this.cursor + step));
    if (next === this.cursor) return;
    this.cursor = next;
    playSound(MENU_MOVE);
  }

  private confirm(): void {
    playSound(MENU_SELECT);
    if (this.cursor < this.letters.length - 1) {
      this.cursor++;
      return;
    }
    const entry = { initials: this.initials, score: this.score, place: this.place };
    const { scores, rank } = addHighScore(loadHighScores(), entry);
    saveHighScores(scores);
    this.game.scenes.go(new HighScoresScene(this.game, rank));
  }
}
