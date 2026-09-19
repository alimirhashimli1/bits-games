import type * as Phaser from 'phaser';

import { ActionInput, type ActionBindings } from '@shared/phaser/actionInput';

import type { Controller } from './controller';
import { BUTTONS, cleanDirections, INPUT, type Direction, type InputBits, type InputName } from './inputBits';

const DIRECTIONS: readonly Direction[] = ['up', 'down', 'left', 'right'];

/**
 * A player on this computer: reads their keys and gamepad once per frame and packs them into
 * input bits, which every step of that frame then uses.
 */
export class LocalInput implements Controller {
  private readonly input: ActionInput<InputName>;
  private bits: InputBits = 0;

  /** `gamepadSlot` picks the player's own pad (0 = the first connected). Leave it out to accept any pad. */
  constructor(scene: Phaser.Scene, bindings: ActionBindings<InputName>, gamepadSlot?: number) {
    this.input = new ActionInput(scene, bindings, gamepadSlot);
  }

  readFrame(): void {
    this.input.update();
    let bits: InputBits = 0;
    for (const direction of DIRECTIONS) {
      if (this.input.isDown(direction)) bits |= INPUT[direction];
    }
    // A tap that starts and ends between two frames still counts as a press.
    for (const button of BUTTONS) {
      if (this.input.isDown(button) || this.input.justPressed(button)) bits |= INPUT[button];
    }
    this.bits = cleanDirections(bits);
  }

  inputFor(): InputBits {
    return this.bits;
  }
}
