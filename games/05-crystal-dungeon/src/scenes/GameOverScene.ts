import * as Phaser from 'phaser';

import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SCENES } from './sceneKeys';

const HEADING_Y = 52;
const MESSAGE_Y = 80;
const MENU_Y = 112;

/** Wren has fallen. Offers to carry on in the world, or to go back to the title. */
export class GameOverScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.gameOver);
  }

  create(): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);

    addCenteredPixelText(this, HEADING_Y, 'GAME OVER', { color: COLORS.danger, scale: 2 });
    addCenteredPixelText(this, MESSAGE_Y, 'THE VALLEY GROWS DARKER...', { color: COLORS.text });

    this.menu = new Menu(
      this,
      [
        { label: 'CONTINUE', onSelect: () => fadeToScene(this, SCENES.world) },
        { label: 'BACK TO TITLE', onSelect: () => fadeToScene(this, SCENES.title) },
      ],
      { y: MENU_Y, color: COLORS.muted, selectedColor: COLORS.title },
    );
  }

  override update(): void {
    this.menu.update();
  }
}
