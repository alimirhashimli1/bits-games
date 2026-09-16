import * as Phaser from 'phaser';

import { devNumberParam, devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { SPRITES } from '../content/sprites';
import type { AreaSceneData } from './AreaScene';
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

    // Development only: `?scene=Area&area=3` starts in the fourth area.
    const areaData: AreaSceneData = { areaIndex: devNumberParam('area') };
    this.scene.start(devStartScene(JUMPABLE_SCENES) ?? SCENES.title, areaData);
  }
}
