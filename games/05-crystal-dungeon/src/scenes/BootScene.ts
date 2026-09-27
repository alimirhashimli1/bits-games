import * as Phaser from 'phaser';

import { devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { SPRITES } from '../content/sprites';
import { AREAS, START_SPOT } from '../content/world/areas';
import { checkWorld } from '../systems/worldCheck';
import { SCENES, type SceneKey } from './sceneKeys';

/** Scenes that the `?scene=` development shortcut may jump to. */
const JUMPABLE_SCENES: readonly SceneKey[] = Object.values(SCENES).filter(
  // The pause menu, the inventory, the dialogue box and the HUD only make sense over the world.
  (key) => key !== SCENES.boot && key !== SCENES.pause && key !== SCENES.inventory && key !== SCENES.dialogue && key !== SCENES.hud,
);

/** First scene: turns all pixel art into textures, then opens the title screen. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    registerSprites(this, SPRITES);
    // A broken map or a door to nowhere stops the game here, with the room's name, instead of mid-play.
    checkWorld(AREAS, START_SPOT);
    // Development only: `?scene=World` starts straight in the world.
    this.scene.start(devStartScene(JUMPABLE_SCENES) ?? SCENES.title);
  }
}
