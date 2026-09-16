import * as Phaser from 'phaser';

import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, KEYS, TIMING } from '../config';
import { SCENES } from './sceneKeys';

const HEADING_Y = 64;
const PROMPT_Y = 120;

/** Placeholder game over screen. Step 16 adds the continue option. */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.gameOver);
  }

  create(): void {
    fadeIn(this);

    addCenteredPixelText(this, HEADING_Y, 'GAME OVER', { color: COLORS.danger, scale: 2 });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.text });
    blink(this, prompt, TIMING.promptBlinkMs);

    onKeyPress(this, KEYS.confirm, () => fadeToScene(this, SCENES.title));
  }
}
