import * as Phaser from 'phaser';

import { devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { SPRITES } from '../content/sprites';
import type { MatchResult } from '../systems/matchSetup';
import { devMatchSetup } from './devMatchSetup';
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

    // Development only: the address bar can jump to any scene with any match (see devMatchSetup).
    const setup = devMatchSetup();
    const result: MatchResult = { setup, winner: 0 };
    const scene = devStartScene(JUMPABLE_SCENES) ?? SCENES.title;
    this.scene.start(scene, scene === SCENES.results ? result : setup);
  }
}
