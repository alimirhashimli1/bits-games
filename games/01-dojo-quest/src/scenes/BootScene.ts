import * as Phaser from 'phaser';

import { toggleMuted, unlockAudio } from '@shared/audio/audioEngine';
import { devNumberParam, devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { KEYS } from '../config';
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
    // Browsers keep audio silent until the page is used, so the first key press wakes it.
    unlockAudio();
    // Mute belongs to the whole game rather than one scene, so it is bound on the window.
    window.addEventListener('keydown', (event) => {
      const pressed = event.key.toUpperCase();
      if (KEYS.mute.some((key) => key === pressed)) toggleMuted();
    });

    // Development only: `?scene=Area&area=3` starts in the fourth area.
    const areaData: AreaSceneData = { areaIndex: devNumberParam('area') };
    this.scene.start(devStartScene(JUMPABLE_SCENES) ?? SCENES.title, areaData);
  }
}
