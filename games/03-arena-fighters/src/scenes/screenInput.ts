import type * as Phaser from 'phaser';

import { ActionInput } from '@shared/phaser/actionInput';

import { SCREEN_CONTROLS, type ScreenAction } from '../config';

/**
 * Screen controls for scenes without a menu. Like the shared menu, it ignores its first
 * frame: a screen is usually opened by a press, and a gamepad button still held from it
 * would otherwise count as a new press and skip straight past the screen.
 */
export class ScreenInput {
  private readonly input: ActionInput<ScreenAction>;
  private updates = 0;

  constructor(scene: Phaser.Scene) {
    this.input = new ActionInput(scene, SCREEN_CONTROLS);
  }

  /** Call once per frame, before asking `justPressed()`. */
  update(): void {
    this.input.update();
    this.updates += 1;
  }

  justPressed(action: ScreenAction): boolean {
    return this.updates > 1 && this.input.justPressed(action);
  }
}
