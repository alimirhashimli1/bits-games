import * as Phaser from 'phaser';

import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { DEFAULT_MATCH, type GameMode, type MatchSetup } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';

const HEADING_Y = 40;
const MENU_Y = 80;

const MODES: readonly { readonly mode: GameMode; readonly label: string }[] = [
  { mode: 'arcade', label: 'ARCADE' },
  { mode: 'versus', label: 'VERSUS' },
  { mode: 'online', label: 'ONLINE' },
];

/** Arcade against the CPU, versus on one machine, or online by link. */
export class ModeSelectScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.modeSelect);
  }

  create(): void {
    fadeIn(this);
    addCenteredPixelText(this, HEADING_Y, 'SELECT MODE', { color: COLORS.title, scale: 2 });

    this.menu = new Menu(
      this,
      MODES.map(({ mode, label }) => ({ label, onSelect: () => this.choose(mode) })),
      {
        y: MENU_Y,
        color: COLORS.muted,
        selectedColor: COLORS.title,
        onCancel: () => fadeToScene(this, SCENES.title),
      },
    );
  }

  override update(): void {
    this.menu.update();
  }

  private choose(mode: GameMode): void {
    const setup: MatchSetup = { ...DEFAULT_MATCH, mode };
    fadeToScene(this, SCENES.characterSelect, setup);
  }
}
