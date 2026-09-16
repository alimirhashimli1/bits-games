import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, KEYS, TIMING } from '../config';
import { SOUNDS } from '../content/sounds';
import { SCENES } from './sceneKeys';

const HEADING_Y = 56;
const MESSAGE_Y = 88;
const PROMPT_Y = 128;

/** The end of a won run, reached from the rescue once Kenji walks Mei out of the fortress. */
export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.victory);
  }

  create(): void {
    fadeIn(this);
    stopMusic();
    playSound(SOUNDS.victorySting);

    addCenteredPixelText(this, HEADING_Y, 'VICTORY', { color: COLORS.success, scale: 2 });
    addCenteredPixelText(this, MESSAGE_Y, 'MEI IS FREE!', { color: COLORS.text });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.muted });
    blink(this, prompt, TIMING.promptBlinkMs);

    onKeyPress(this, KEYS.confirm, () => fadeToScene(this, SCENES.title));
  }
}
