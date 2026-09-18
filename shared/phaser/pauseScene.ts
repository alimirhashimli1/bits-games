import * as Phaser from 'phaser';

import { ControlsPanel, type ControlsTable } from './controlsPanel';
import { Menu } from './menu';
import { addCenteredPixelText } from './pixelText';

export interface PauseSceneData {
  /** The scene that is frozen underneath, so it can be resumed or stopped. */
  readonly pausedScene: string;
}

/** How a game's pause menu looks and sounds, and where quitting goes. */
export interface PauseSceneOptions {
  readonly key: string;
  /** Where QUIT TO TITLE goes. */
  readonly titleKey: string;
  readonly controls: ControlsTable;
  /** The colour laid over the frozen game, dimming it. */
  readonly dimColor: number;
  /** Called when the menu opens and when the game is quit, for stopping music. */
  readonly onOpen?: () => void;
  readonly onQuit?: () => void;
  /** Menu sounds. */
  readonly onMove?: () => void;
  readonly onConfirm?: () => void;
}

const DIM_ALPHA = 0.82;
const HEADING_Y = 40;
const MENU_Y = 80;
const BACK_Y = 158;

/**
 * The pause menu, laid over the frozen game rather than replacing it, so the game is still
 * visible behind and nothing about it has to be saved and rebuilt. Each game makes its own by
 * extending this with its options.
 */
export class PauseScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;
  private heading!: Phaser.GameObjects.BitmapText;
  private panel: ControlsPanel | null = null;
  private pausedScene = '';

  constructor(private readonly options: PauseSceneOptions) {
    super(options.key);
  }

  init(data: PauseSceneData): void {
    this.pausedScene = data.pausedScene;
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, this.options.dimColor, DIM_ALPHA).setOrigin(0, 0);
    this.heading = addCenteredPixelText(this, HEADING_Y, 'PAUSED', { color: this.options.controls.colors.title, scale: 2 });
    this.options.onOpen?.();
    this.showMenu();
  }

  override update(): void {
    this.menu.update();
  }

  private menuColors(): { color: number; selectedColor: number } {
    const { muted, title } = this.options.controls.colors;
    return { color: muted, selectedColor: title };
  }

  private showMenu(): void {
    this.heading.setVisible(true);
    this.menu = new Menu(
      this,
      [
        { label: 'RESUME', onSelect: () => this.resumeGame() },
        { label: 'CONTROLS', onSelect: () => this.showControls() },
        { label: 'QUIT TO TITLE', onSelect: () => this.quitToTitle() },
      ],
      {
        y: MENU_Y,
        ...this.menuColors(),
        onMove: this.options.onMove,
        onConfirm: this.options.onConfirm,
        onCancel: () => this.resumeGame(),
      },
    );
  }

  /** The controls table replaces the menu, and a single BACK item brings it back. */
  private showControls(): void {
    this.menu.destroy();
    this.heading.setVisible(false);
    this.panel = new ControlsPanel(this, this.options.controls);

    const goBack = (): void => {
      this.panel?.destroy();
      this.panel = null;
      this.menu.destroy();
      this.showMenu();
    };
    this.menu = new Menu(this, [{ label: 'BACK', onSelect: goBack }], {
      y: BACK_Y,
      ...this.menuColors(),
      onConfirm: this.options.onConfirm,
      onCancel: goBack,
    });
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume(this.pausedScene);
  }

  private quitToTitle(): void {
    this.options.onQuit?.();
    this.scene.stop(this.pausedScene);
    this.scene.start(this.options.titleKey);
  }
}
