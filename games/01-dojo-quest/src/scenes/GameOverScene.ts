import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SOUNDS } from '../content/sounds';
import type { AreaSceneData } from './AreaScene';
import { SCENES, type SceneKey } from './sceneKeys';

export interface GameOverSceneData {
  /** Where "continue" goes back to. Defaults to the fortress. */
  readonly continueScene?: SceneKey;
  /** The area Kenji fell in, so continuing starts it again. */
  readonly areaIndex?: number;
  /**
   * Why the run ended, at most two lines. Losing a fight explains itself and needs none;
   * an ending lost to a rule the game never stated does.
   */
  readonly reason?: readonly string[];
}

const HEADING_Y = 48;
const REASON_Y = 76;
const REASON_LINE_HEIGHT = 10;
/** The menu sits lower when there is a reason above it to read. */
const MENU_Y = 92;
const MENU_Y_WITH_REASON = 112;

/** Game over, with the choice to take the same ground again or give up. */
export class GameOverScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;
  private continueScene: SceneKey = SCENES.area;
  private areaIndex = 0;
  private reason: readonly string[] = [];

  constructor() {
    super(SCENES.gameOver);
  }

  init(data: GameOverSceneData): void {
    this.continueScene = data.continueScene ?? SCENES.area;
    this.areaIndex = data.areaIndex ?? 0;
    this.reason = data.reason ?? [];
  }

  create(): void {
    fadeIn(this);
    stopMusic();
    playSound(SOUNDS.defeatSting);

    addCenteredPixelText(this, HEADING_Y, 'GAME OVER', { color: COLORS.danger, scale: 2 });
    this.reason.forEach((line, row) => {
      addCenteredPixelText(this, REASON_Y + row * REASON_LINE_HEIGHT, line, { color: COLORS.text });
    });

    this.menu = new Menu(
      this,
      [
        { label: 'CONTINUE', onSelect: () => this.tryAgain() },
        { label: 'QUIT TO TITLE', onSelect: () => fadeToScene(this, SCENES.title) },
      ],
      {
        y: this.reason.length > 0 ? MENU_Y_WITH_REASON : MENU_Y,
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

  /** Starts the same area again at full health, rather than sending him back down the mountain. */
  private tryAgain(): void {
    const data: AreaSceneData = { areaIndex: this.areaIndex };
    fadeToScene(this, this.continueScene, data);
  }
}
