import * as Phaser from 'phaser';

import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SCENES } from './sceneKeys';
import { ScreenInput } from './screenInput';

const LOGO_Y = 50;
const SUBTITLE_Y = 76;
const PROMPT_Y = 124;
const PROMPT_BLINK_MS = 500;

/** The logo and "press start". The full title menu arrives with the options screen. */
export class TitleScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private screenInput!: ScreenInput;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);
    this.screenInput = new ScreenInput(this);

    addCenteredPixelText(this, LOGO_Y, 'ARENA FIGHTERS', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, SUBTITLE_Y, 'THE IRON CROWN TOURNAMENT', { color: COLORS.muted });
    blink(this, addCenteredPixelText(this, PROMPT_Y, 'PRESS START', { color: COLORS.text }), PROMPT_BLINK_MS);
  }

  override update(): void {
    this.screenInput.update();
    if (this.screenInput.justPressed('confirm')) fadeToScene(this, SCENES.modeSelect);
  }
}
