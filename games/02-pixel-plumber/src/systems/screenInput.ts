import type * as Phaser from 'phaser';

import { ActionInput, type ActionBindings } from '@shared/phaser/actionInput';

/**
 * Keyboard and gamepad input for a screen. It reads once straight away, so a gamepad
 * button still held from the previous screen does not count as a new press here.
 */
export function createScreenInput<Action extends string>(
  scene: Phaser.Scene,
  bindings: ActionBindings<Action>,
): ActionInput<Action> {
  const input = new ActionInput(scene, bindings);
  input.update();
  return input;
}
