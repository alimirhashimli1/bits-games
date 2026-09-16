import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { Menu } from '@shared/phaser/menu';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SOUNDS } from '../content/sounds';
import { ControlsPanel } from './hud/ControlsPanel';
import { SCENES } from './sceneKeys';

const BACK_Y = 158;

/** The controls table, reached from the title menu. */
export class ControlsScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.controls);
  }

  create(): void {
    fadeIn(this);
    new ControlsPanel(this);

    const goBack = (): void => fadeToScene(this, SCENES.title);
    this.menu = new Menu(this, [{ label: 'BACK', onSelect: goBack }], {
      y: BACK_Y,
      color: COLORS.muted,
      selectedColor: COLORS.title,
      onConfirm: () => playSound(SOUNDS.confirm),
      onCancel: goBack,
    });
  }

  override update(): void {
    this.menu.update();
  }
}
