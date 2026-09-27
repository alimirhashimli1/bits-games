import * as Phaser from 'phaser';

import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SCENES } from './sceneKeys';

const HEADING_Y = 52;
const MESSAGE_Y = 80;
const MENU_Y = 120;

/** The Heartcrystal is whole again. For now a placeholder card before the title. */
export class EndingScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.ending);
  }

  create(): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);

    addCenteredPixelText(this, HEADING_Y, 'THE END', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, MESSAGE_Y, 'THE HEARTCRYSTAL SHINES AGAIN', { color: COLORS.text });

    this.menu = new Menu(this, [{ label: 'BACK TO TITLE', onSelect: () => fadeToScene(this, SCENES.title) }], {
      y: MENU_Y,
      color: COLORS.muted,
      selectedColor: COLORS.title,
    });
  }

  override update(): void {
    this.menu.update();
  }
}
