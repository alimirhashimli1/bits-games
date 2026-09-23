import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { TITLE_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { SCENES } from './sceneKeys';

const LOGO_Y = 44;
const SUBTITLE_Y = 70;
const MENU_Y = 102;

/** The logo and the menu: into the modes, or off to the settings and the controls first. */
export class TitleScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);
    playMusic(TITLE_MUSIC);

    addCenteredPixelText(this, LOGO_Y, 'ARENA FIGHTERS', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, SUBTITLE_Y, 'THE IRON CROWN TOURNAMENT', { color: COLORS.muted });

    this.menu = new Menu(
      this,
      [
        { label: 'START', onSelect: () => fadeToScene(this, SCENES.modeSelect) },
        { label: 'OPTIONS', onSelect: () => fadeToScene(this, SCENES.options) },
        { label: 'CONTROLS', onSelect: () => fadeToScene(this, SCENES.controls) },
      ],
      {
        y: MENU_Y,
        color: COLORS.muted,
        selectedColor: COLORS.title,
        onMove: () => playSound(SOUNDS.menuMove),
        onConfirm: () => playSound(SOUNDS.confirm),
      },
    );
  }

  override update(): void {
    this.menu.update();
  }
}
