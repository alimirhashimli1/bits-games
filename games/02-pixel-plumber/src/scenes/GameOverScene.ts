import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { LEVEL_IDS } from '../content/levels/levelOrder';
import { SOUNDS } from '../content/sounds';
import { firstLevelOf } from '../systems/continuePoint';
import { newRun } from '../systems/runState';
import { formatScore } from '../systems/score';
import { SCENES } from './sceneKeys';
import type { WorldIntroData } from './WorldIntroScene';

const HEADING_Y = 48;
const MESSAGE_Y = 76;
const SCORE_Y = 92;
const MENU_Y = 118;

/** How the run ended: its score, and the level it ended in. */
export interface GameOverData {
  readonly score: number;
  readonly levelIndex?: number;
}

/**
 * The last life is gone. Shows the score, and offers to carry on from the start of the world
 * the run ended in, with a fresh set of lives and no score, or to go back to the title.
 */
export class GameOverScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.gameOver);
  }

  create({ score = 0, levelIndex = 0 }: Partial<GameOverData> = {}): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);
    stopMusic();
    playSound(SOUNDS.gameOver);

    addCenteredPixelText(this, HEADING_Y, 'GAME OVER', { color: COLORS.danger, scale: 2 });
    addCenteredPixelText(this, MESSAGE_Y, 'THE SLUDGE WINS... FOR NOW', { color: COLORS.text });
    addCenteredPixelText(this, SCORE_Y, `SCORE ${formatScore(score)}`, { color: COLORS.title });

    const world = (LEVEL_IDS[levelIndex] ?? LEVEL_IDS[0]).charAt(0);
    const worldStart = LEVEL_IDS.indexOf(firstLevelOf(world) ?? LEVEL_IDS[0]);
    this.menu = new Menu(
      this,
      [
        {
          label: `CONTINUE FROM WORLD ${world}`,
          onSelect: () => {
            const run: WorldIntroData = { ...newRun(worldStart), story: true };
            fadeToScene(this, SCENES.worldIntro, run);
          },
        },
        { label: 'BACK TO TITLE', onSelect: () => fadeToScene(this, SCENES.title) },
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
