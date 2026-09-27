import * as Phaser from 'phaser';

import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SCENES } from './sceneKeys';

const LOGO_Y = 40;
const SUBTITLE_Y = 64;
const MENU_Y = 100;

/** The title: for now the logo and the menu. Continue arrives with saving. */
export class TitleScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);

    addCenteredPixelText(this, LOGO_Y, 'CRYSTAL DUNGEON', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, SUBTITLE_Y, 'THE SHARDS OF GLIMMERVALE', { color: COLORS.muted });

    this.menu = new Menu(
      this,
      [
        { label: 'NEW GAME', onSelect: () => fadeToScene(this, SCENES.world) },
        { label: 'CONTROLS', onSelect: () => fadeToScene(this, SCENES.controls) },
      ],
      { y: MENU_Y, color: COLORS.muted, selectedColor: COLORS.title },
    );
  }

  override update(): void {
    this.menu.update();
  }
}
