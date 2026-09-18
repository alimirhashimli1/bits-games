import * as Phaser from 'phaser';

import { addCenteredPixelText } from '@shared/phaser/pixelText';

import { COLORS, SCREEN } from '../config';
import { SCENES } from './sceneKeys';

/** First scene. For now it only shows the game's name, until the scene flow exists. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    addCenteredPixelText(this, SCREEN.height / 2 - 12, 'ARENA FIGHTERS', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, SCREEN.height / 2 + 12, 'IN DEVELOPMENT', { color: COLORS.muted });
  }
}
