import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, SCREEN } from '../config';
import { TITLE_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { TORCH_ANIMATIONS, TORCH_SHEET } from '../content/sprites/torch';
import { SCENES } from './sceneKeys';

const LOGO_Y = 44;
const SUBTITLE_Y = 74;
const MENU_Y = 110;

const TORCH_DISTANCE_FROM_CENTER = 116;
const TORCH_BOTTOM_Y = 76;
const TORCH_SCALE = 2;
/** The right torch starts on a different frame, so the two flames don't flicker in sync. */
const RIGHT_TORCH_START_FRAME = 2;

/** The title screen and its menu. */
export class TitleScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);
    // The title theme carries on through the raid and the opening, because playing a track
    // that is already playing changes nothing.
    playMusic(TITLE_MUSIC);

    this.addTorch(-TORCH_DISTANCE_FROM_CENTER, 0);
    this.addTorch(TORCH_DISTANCE_FROM_CENTER, RIGHT_TORCH_START_FRAME);

    addCenteredPixelText(this, LOGO_Y, 'DOJO QUEST', { color: COLORS.title, scale: 3 });
    addCenteredPixelText(this, SUBTITLE_Y, 'THE MOUNTAIN FORTRESS', { color: COLORS.muted });

    this.menu = new Menu(
      this,
      [
        { label: 'NEW GAME', onSelect: () => fadeToScene(this, SCENES.raid) },
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

  private addTorch(offsetFromCenter: number, startFrame: number): void {
    this.add
      .sprite(SCREEN.width / 2 + offsetFromCenter, TORCH_BOTTOM_Y, TORCH_SHEET.key)
      .setOrigin(0.5, 1)
      .setScale(TORCH_SCALE)
      .play({ key: TORCH_ANIMATIONS.burn.key, startFrame });
  }
}
