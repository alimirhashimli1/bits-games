import * as Phaser from 'phaser';

import { ControlsPanel, type ControlsTable } from './controlsPanel';
import { Menu } from './menu';
import { fadeIn, fadeToScene } from './sceneTransitions';

/** Where the controls screen goes back to, and what it shows. */
export interface ControlsSceneOptions {
  readonly key: string;
  readonly backKey: string;
  readonly controls: ControlsTable;
  /** Behind the table. Without one the game's own background shows. */
  readonly backgroundColor?: number;
  /** Menu sound. */
  readonly onConfirm?: () => void;
}

const BACK_Y = 158;

/**
 * The controls table as a screen of its own, reached from a title menu. Each game makes its
 * own by extending this with its options.
 */
export class ControlsScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor(private readonly options: ControlsSceneOptions) {
    super(options.key);
  }

  create(): void {
    fadeIn(this);
    const { controls, backKey, onConfirm, backgroundColor } = this.options;
    if (backgroundColor !== undefined) this.cameras.main.setBackgroundColor(backgroundColor);
    new ControlsPanel(this, controls);

    const goBack = (): void => fadeToScene(this, backKey);
    this.menu = new Menu(this, [{ label: 'BACK', onSelect: goBack }], {
      y: BACK_Y,
      color: controls.colors.muted,
      selectedColor: controls.colors.title,
      onConfirm,
      onCancel: goBack,
    });
  }

  override update(): void {
    this.menu.update();
  }
}
