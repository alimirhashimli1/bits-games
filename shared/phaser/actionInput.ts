import * as Phaser from 'phaser';

import { isGamepadButtonPressed, isGamepadStickPushed, readGamepads } from '@shared/input/gamepads';

export interface ActionBinding {
  /** Phaser key names, e.g. 'LEFT', 'A', 'SHIFT'. */
  readonly keys?: readonly string[];
  /** Standard gamepad button indices, e.g. 0 = A, 3 = Y, 14 = D-pad left. */
  readonly buttons?: readonly number[];
  readonly stick?: { readonly axis: number; readonly direction: -1 | 1 };
}

export type ActionBindings<Action extends string> = Readonly<Record<Action, ActionBinding>>;

/**
 * Turns keyboard and gamepad input into named actions such as "left" or "stance".
 * Call `update()` once per frame, then ask `isDown()` or `justPressed()`.
 */
export class ActionInput<Action extends string> {
  private readonly bindings: ActionBindings<Action>;
  private readonly actions: readonly Action[];
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  /** Key presses since the last update, so a tap shorter than one frame is not lost. */
  private readonly keyPressesSinceUpdate = new Set<Action>();
  private held = new Set<Action>();
  private pressed = new Set<Action>();
  private readonly gamepadSlot: number | undefined;

  /**
   * `gamepadSlot` limits the gamepad buttons to one pad, counted in the order they connected
   * (0 = the first), so two players can each have their own. Without it every pad counts.
   */
  constructor(scene: Phaser.Scene, bindings: ActionBindings<Action>, gamepadSlot?: number) {
    this.bindings = bindings;
    this.gamepadSlot = gamepadSlot;
    // Object.keys loses the key type, but the keys come straight from `bindings`.
    this.actions = Object.keys(bindings) as Action[];

    const keyboard = scene.input.keyboard;
    const removeListeners: Array<() => void> = [];

    for (const action of this.actions) {
      const keys = keyboard ? (bindings[action].keys ?? []).map((keyName) => keyboard.addKey(keyName)) : [];
      this.keys.set(action, keys);

      const onKeyDown = (_key: Phaser.Input.Keyboard.Key, event: KeyboardEvent): void => {
        // A held key sends repeated key-downs. Holding is one press, just as it is on a gamepad.
        if (event.repeat) return;
        this.keyPressesSinceUpdate.add(action);
      };
      for (const key of keys) {
        key.on(Phaser.Input.Keyboard.Events.DOWN, onKeyDown);
        removeListeners.push(() => key.off(Phaser.Input.Keyboard.Events.DOWN, onKeyDown));
      }
    }

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => removeListeners.forEach((remove) => remove()));
  }

  update(): void {
    const held = new Set<Action>();
    const pressed = new Set<Action>();
    const connected = readGamepads();
    const gamepads = this.gamepadSlot === undefined ? connected : connected.slice(this.gamepadSlot, this.gamepadSlot + 1);

    for (const action of this.actions) {
      const isActive = this.isActive(action, gamepads);
      if (isActive) held.add(action);
      if (this.keyPressesSinceUpdate.has(action) || (isActive && !this.held.has(action))) pressed.add(action);
    }

    this.keyPressesSinceUpdate.clear();
    this.held = held;
    this.pressed = pressed;
  }

  isDown(action: Action): boolean {
    return this.held.has(action);
  }

  /** True only on the frame the action was first pressed. */
  justPressed(action: Action): boolean {
    return this.pressed.has(action);
  }

  private isActive(action: Action, gamepads: readonly Gamepad[]): boolean {
    const { buttons = [], stick } = this.bindings[action];
    return (
      (this.keys.get(action) ?? []).some((key) => key.isDown) ||
      buttons.some((button) => isGamepadButtonPressed(button, gamepads)) ||
      (stick !== undefined && isGamepadStickPushed(stick.axis, stick.direction, gamepads))
    );
  }
}
