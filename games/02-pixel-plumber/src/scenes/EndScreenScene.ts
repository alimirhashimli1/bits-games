import * as Phaser from 'phaser';

import type { ActionInput } from '@shared/phaser/actionInput';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, SCREEN_CONTROLS, TIMING } from '../config';
import { formatScore } from '../systems/score';
import { createScreenInput } from '../systems/screenInput';
import { SCENES, type SceneKey } from './sceneKeys';

const HEADING_Y = 56;
const MESSAGE_Y = 88;
const SCORE_Y = 106;
const PROMPT_Y = 128;

interface EndScreenText {
  readonly heading: string;
  readonly headingColor: number;
  readonly message: string;
}

/** How the run ended. */
export interface EndScreenData {
  readonly score: number;
}

/** A screen that ends a run and returns to the title. Game Over and the Ending share it. */
abstract class EndScreenScene extends Phaser.Scene {
  private controls!: ActionInput<keyof typeof SCREEN_CONTROLS>;

  protected constructor(
    key: SceneKey,
    private readonly text: EndScreenText,
  ) {
    super(key);
  }

  create(data: Partial<EndScreenData> = {}): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);

    addCenteredPixelText(this, HEADING_Y, this.text.heading, { color: this.text.headingColor, scale: 2 });
    addCenteredPixelText(this, MESSAGE_Y, this.text.message, { color: COLORS.text });
    addCenteredPixelText(this, SCORE_Y, `SCORE ${formatScore(data.score ?? 0)}`, { color: COLORS.title });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.muted });
    blink(this, prompt, TIMING.promptBlinkMs);

    this.controls = createScreenInput(this, SCREEN_CONTROLS);
  }

  override update(): void {
    this.controls.update();
    if (this.controls.justPressed('confirm')) fadeToScene(this, SCENES.title);
  }
}

export class GameOverScene extends EndScreenScene {
  constructor() {
    super(SCENES.gameOver, { heading: 'GAME OVER', headingColor: COLORS.danger, message: 'THE SLUDGE WINS... FOR NOW' });
  }
}

export class EndingScene extends EndScreenScene {
  constructor() {
    super(SCENES.ending, { heading: 'THE PIPES RUN CLEAR', headingColor: COLORS.success, message: 'BRASSWICK IS SAVED!' });
  }
}
