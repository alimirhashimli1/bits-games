import * as Phaser from 'phaser';

import { devParam, devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { LEVEL_IDS, type LevelId } from '../content/levels/levelOrder';
import { SPRITES } from '../content/sprites';
import { newRun } from '../systems/runState';
import { SCENES, type SceneKey } from './sceneKeys';

/** Scenes that the `?scene=` development shortcut may jump to. */
const JUMPABLE_SCENES: readonly SceneKey[] = Object.values(SCENES).filter((key) => key !== SCENES.boot);

/** First scene: turns all pixel art into textures, then opens the title screen. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    registerSprites(this, SPRITES);

    // Development only: `?scene=Level&level=2-1` starts in world 2-1.
    const requestedLevel = LEVEL_IDS.indexOf(devParam('level') as LevelId);
    const run = newRun(Math.max(requestedLevel, 0));
    this.scene.start(devStartScene(JUMPABLE_SCENES) ?? SCENES.title, run);
  }
}
