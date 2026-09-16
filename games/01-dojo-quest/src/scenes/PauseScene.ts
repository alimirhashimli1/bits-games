import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';

import { COLORS, SCREEN } from '../config';
import { SOUNDS } from '../content/sounds';
import { ControlsPanel } from './hud/ControlsPanel';
import { SCENES, type SceneKey } from './sceneKeys';

export interface PauseSceneData {
  /** The scene that is frozen underneath, so it can be resumed or stopped. */
  readonly pausedScene: SceneKey;
}

const DIM_ALPHA = 0.82;
const HEADING_Y = 40;
const MENU_Y = 80;
const BACK_Y = 158;

/**
 * The pause menu, laid over the frozen game rather than replacing it, so the fight is still
 * visible behind and nothing about it has to be saved and rebuilt.
 */
export class PauseScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;
  private heading!: Phaser.GameObjects.BitmapText;
  private panel: ControlsPanel | null = null;
  private pausedScene: SceneKey = SCENES.area;

  constructor() {
    super(SCENES.pause);
  }

  init(data: PauseSceneData): void {
    this.pausedScene = data.pausedScene;
  }

  create(): void {
    this.add.rectangle(0, 0, SCREEN.width, SCREEN.height, COLORS.background, DIM_ALPHA).setOrigin(0, 0);
    this.heading = addCenteredPixelText(this, HEADING_Y, 'PAUSED', { color: COLORS.title, scale: 2 });
    this.showMenu();
  }

  override update(): void {
    this.menu.update();
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
        color: COLORS.muted,
        selectedColor: COLORS.title,
        onMove: () => playSound(SOUNDS.menuMove),
        onConfirm: () => playSound(SOUNDS.confirm),
        onCancel: () => this.resumeGame(),
      },
    );
  }

  /** The controls table replaces the menu, and a single BACK item brings it back. */
  private showControls(): void {
    this.menu.destroy();
    this.heading.setVisible(false);
    this.panel = new ControlsPanel(this);

    const goBack = (): void => {
      this.panel?.destroy();
      this.panel = null;
      this.menu.destroy();
      this.showMenu();
    };
    this.menu = new Menu(this, [{ label: 'BACK', onSelect: goBack }], {
      y: BACK_Y,
      color: COLORS.muted,
      selectedColor: COLORS.title,
      onConfirm: () => playSound(SOUNDS.confirm),
      onCancel: goBack,
    });
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume(this.pausedScene);
  }

  private quitToTitle(): void {
    stopMusic();
    this.scene.stop(this.pausedScene);
    this.scene.start(SCENES.title);
  }
}
