import * as Phaser from 'phaser';

import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, KEYS, TIMING } from '../config';
import { SCENES } from './sceneKeys';

const HEADING_Y = 56;
const MESSAGE_Y = 88;
const PROMPT_Y = 128;

/** Placeholder victory screen. Step 14 adds the real ending. */
export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.victory);
  }

  create(): void {
    fadeIn(this);

    addCenteredPixelText(this, HEADING_Y, 'VICTORY', { color: COLORS.success, scale: 2 });
    addCenteredPixelText(this, MESSAGE_Y, 'MEI IS FREE!', { color: COLORS.text });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.muted });
    blink(this, prompt, TIMING.promptBlinkMs);

    onKeyPress(this, KEYS.confirm, () => fadeToScene(this, SCENES.title));
  }
}
