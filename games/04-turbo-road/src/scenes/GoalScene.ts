import { playSound } from '@shared/audio/audioEngine';

import { TALLY_TICK } from '../content/sounds';
import type { Goal } from '../content/stages/stage';
import { COLORS, ENDING, RACE } from '../config';
import { EndingPicture } from '../systems/endings/EndingPicture';
import { type RaceResult, timeBonus } from '../systems/race/scoring';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { drawCenteredOutlinedText, drawOutlinedText, drawRightAlignedOutlinedText } from '../systems/ui/outlinedText';
import { afterRace } from './afterRace';

const NAME_Y = 6;
const NAME_SCALE = 2;
const STORY_Y = 26;
const LINE_HEIGHT = 10;
/** The tally: labels on the left, numbers on the right, one row each. */
const TALLY_LEFT = 72;
const TALLY_RIGHT = 248;
const TALLY_Y = 120;
const TOTAL_GAP = 4;
const PROMPT_Y = 166;

/**
 * The ending at a goal: the Comet drives up to the goal's landmark and parks, a line or two
 * says what happens next, and the time left on the clock is counted into a time bonus. START
 * skips the count, then goes on to the high scores.
 */
export class GoalScene implements Scene {
  private readonly picture: EndingPicture;
  private steps = 0;

  constructor(
    private readonly game: GameContext,
    private readonly goal: Goal,
    private readonly result: RaceResult,
  ) {
    this.picture = new EndingPicture(goal.ending);
  }

  /** When the count starts, and how many steps it takes. */
  private get tallyStart(): number {
    return ENDING.driveSteps + ENDING.tallyDelaySteps;
  }

  private get tallyEnd(): number {
    return this.tallyStart + this.result.secondsLeft * ENDING.tallyStepsPerSecond;
  }

  /** The final score, with the whole time bonus. */
  private get total(): number {
    return this.result.score + timeBonus(this.result.secondsLeft);
  }

  /** Seconds already moved from the clock into the bonus. */
  private get secondsCounted(): number {
    const counted = Math.floor((this.steps - this.tallyStart) / ENDING.tallyStepsPerSecond);
    return Math.min(this.result.secondsLeft, Math.max(0, counted));
  }

  update(): void {
    const countedBefore = this.secondsCounted;
    this.steps++;
    if (this.secondsCounted > countedBefore && this.steps <= this.tallyEnd) playSound(TALLY_TICK);
    if (!this.game.input.justPressed('confirm')) return;
    if (this.steps < this.tallyEnd) this.steps = this.tallyEnd;
    else this.game.scenes.go(afterRace(this.game, this.total, this.goal.id));
  }

  draw(context: CanvasRenderingContext2D): void {
    this.picture.draw(context, this.steps / ENDING.driveSteps);
    drawCenteredOutlinedText(context, this.goal.name, NAME_Y, { color: COLORS.title, scale: NAME_SCALE });
    if (this.steps < ENDING.driveSteps) return;

    this.goal.ending.story.forEach((line, index) => {
      drawCenteredOutlinedText(context, line, STORY_Y + index * LINE_HEIGHT, { color: COLORS.text });
    });
    this.drawTally(context);
  }

  /** The clock counts down to nothing as the bonus counts up, then the total. */
  private drawTally(context: CanvasRenderingContext2D): void {
    const counted = this.secondsCounted;
    const bonus = timeBonus(counted);
    const rows: readonly (readonly [string, string])[] = [
      ['SCORE', String(this.result.score)],
      ['TIME LEFT', String(this.result.secondsLeft - counted)],
      [`TIME BONUS  X${RACE.timeBonusPerSecond}`, String(bonus)],
    ];
    rows.forEach(([label, value], index) => drawTallyRow(context, label, value, TALLY_Y + index * LINE_HEIGHT, COLORS.text));
    if (this.steps < this.tallyEnd) return;

    drawTallyRow(context, 'TOTAL', String(this.total), TALLY_Y + rows.length * LINE_HEIGHT + TOTAL_GAP, COLORS.title);
    if (Math.floor(this.steps / ENDING.blinkSteps) % 2 === 0) {
      drawCenteredOutlinedText(context, 'PRESS START', PROMPT_Y, { color: COLORS.text });
    }
  }
}

function drawTallyRow(context: CanvasRenderingContext2D, label: string, value: string, y: number, color: string): void {
  drawOutlinedText(context, label, TALLY_LEFT, y, { color });
  drawRightAlignedOutlinedText(context, value, TALLY_RIGHT, y, { color });
}
