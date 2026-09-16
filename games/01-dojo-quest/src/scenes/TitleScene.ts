import * as Phaser from 'phaser';

import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, KEYS, SCREEN, TIMING } from '../config';
import { TORCH_ANIMATIONS, TORCH_SHEET } from '../content/sprites/torch';
import { SCENES } from './sceneKeys';

const LOGO_Y = 52;
const SUBTITLE_Y = 84;
const PROMPT_Y = 136;

const TORCH_DISTANCE_FROM_CENTER = 116;
const TORCH_BOTTOM_Y = 80;
const TORCH_SCALE = 2;
/** The right torch starts on a different frame, so the two flames don't flicker in sync. */
const RIGHT_TORCH_START_FRAME = 2;

/** Placeholder title screen. Step 16 adds the real title art and menu. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);

    this.addTorch(-TORCH_DISTANCE_FROM_CENTER, 0);
    this.addTorch(TORCH_DISTANCE_FROM_CENTER, RIGHT_TORCH_START_FRAME);

    addCenteredPixelText(this, LOGO_Y, 'DOJO QUEST', { color: COLORS.title, scale: 3 });
    addCenteredPixelText(this, SUBTITLE_Y, 'THE MOUNTAIN FORTRESS', { color: COLORS.muted });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.text });
    blink(this, prompt, TIMING.promptBlinkMs);

    onKeyPress(this, KEYS.confirm, () => fadeToScene(this, SCENES.raid));
  }

  private addTorch(offsetFromCenter: number, startFrame: number): void {
    this.add
      .sprite(SCREEN.width / 2 + offsetFromCenter, TORCH_BOTTOM_Y, TORCH_SHEET.key)
      .setOrigin(0.5, 1)
      .setScale(TORCH_SCALE)
      .play({ key: TORCH_ANIMATIONS.burn.key, startFrame });
  }
}
