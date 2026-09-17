import * as Phaser from 'phaser';

import type { ActionInput } from '@shared/phaser/actionInput';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, SCREEN_CONTROLS, TIMING } from '../config';
import { newRun } from '../systems/runState';
import { createScreenInput } from '../systems/screenInput';
import { SCENES } from './sceneKeys';

const TITLE_Y = 60;
const PROMPT_Y = 120;

export class TitleScene extends Phaser.Scene {
  private controls!: ActionInput<keyof typeof SCREEN_CONTROLS>;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);

    addCenteredPixelText(this, TITLE_Y, 'PIXEL PLUMBER', { color: COLORS.title, scale: 2 });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.text });
    blink(this, prompt, TIMING.promptBlinkMs);

    this.controls = createScreenInput(this, SCREEN_CONTROLS);
  }

  override update(): void {
    this.controls.update();
    if (this.controls.justPressed('confirm')) fadeToScene(this, SCENES.worldIntro, newRun());
  }
}
