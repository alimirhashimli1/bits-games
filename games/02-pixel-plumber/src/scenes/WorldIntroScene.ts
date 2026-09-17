import * as Phaser from 'phaser';

import type { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, SCREEN_CONTROLS, TIMING } from '../config';
import { levelId, type RunState } from '../systems/runState';
import { createScreenInput } from '../systems/screenInput';
import { SCENES } from './sceneKeys';

const WORLD_Y = 70;
const LIVES_Y = 100;

/** The black card before every level, and again after each lost life. */
export class WorldIntroScene extends Phaser.Scene {
  private controls!: ActionInput<keyof typeof SCREEN_CONTROLS>;
  private run!: RunState;

  constructor() {
    super(SCENES.worldIntro);
  }

  create(run: RunState): void {
    this.run = run;
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);

    addCenteredPixelText(this, WORLD_Y, `WORLD ${levelId(run)}`, { color: COLORS.text, scale: 2 });
    addCenteredPixelText(this, LIVES_Y, `RUSTY x ${run.lives}`, { color: COLORS.muted });

    this.controls = createScreenInput(this, SCREEN_CONTROLS);
    this.time.delayedCall(TIMING.worldIntroMs, () => this.startLevel());
  }

  override update(): void {
    this.controls.update();
    if (this.controls.justPressed('confirm')) this.startLevel();
  }

  private startLevel(): void {
    fadeToScene(this, SCENES.level, this.run);
  }
}
