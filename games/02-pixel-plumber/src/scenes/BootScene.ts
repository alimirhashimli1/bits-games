import * as Phaser from 'phaser';

import { toggleMuted, unlockAudio } from '@shared/audio/audioEngine';

import { devParam, devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { GLOBAL_KEYS } from '../config';
import { LEVEL_IDS, type LevelId } from '../content/levels/levelOrder';
import { SPRITES } from '../content/sprites';
import { newRun } from '../systems/runState';
import { SCENES, type SceneKey } from './sceneKeys';
import type { WorldIntroData } from './WorldIntroScene';

/** Scenes that the `?scene=` development shortcut may jump to. */
const JUMPABLE_SCENES: readonly SceneKey[] = Object.values(SCENES).filter(
  // The pause menu only makes sense over a level.
  (key) => key !== SCENES.boot && key !== SCENES.pause,
);

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
    const muteKeys: readonly string[] = GLOBAL_KEYS.mute;
    window.addEventListener('keydown', (event) => {
      if (!event.repeat && muteKeys.includes(event.key.toUpperCase())) toggleMuted();
    });

    // Development only: `?scene=Level&level=2-1` starts in world 2-1, and
    // `?scene=WorldIntro&level=3-1` opens on world 3's story.
    const requestedLevel = LEVEL_IDS.indexOf(devParam('level') as LevelId);
    const run = newRun(Math.max(requestedLevel, 0));
    const scene = devStartScene(JUMPABLE_SCENES) ?? SCENES.title;
    const intro: WorldIntroData = { ...run, story: true };
    this.scene.start(scene, scene === SCENES.worldIntro ? intro : run);
  }
}
