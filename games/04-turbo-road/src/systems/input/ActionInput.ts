import { isGamepadButtonPressed, isGamepadStickPushed, readGamepads } from '@shared/input/gamepads';

export interface ActionBinding {
  /** `KeyboardEvent.code` values, e.g. 'ArrowLeft', 'KeyA', 'Space'. They name keys by position, so they work on any layout. */
  readonly keys?: readonly string[];
  /** Standard gamepad button indices, e.g. 0 = A, 3 = Y, 14 = D-pad left. */
  readonly buttons?: readonly number[];
  readonly stick?: { readonly axis: number; readonly direction: -1 | 1 };
}

export type ActionBindings<Action extends string> = Readonly<Record<Action, ActionBinding>>;

/**
 * Turns keyboard and gamepad input into named actions such as "steer left" or "gear".
 * Call `update()` once per game step, then ask `isDown()` or `justPressed()`.
 */
export class ActionInput<Action extends string> {
  private readonly bindings: ActionBindings<Action>;
  private readonly actions: readonly Action[];
  private readonly boundKeys: ReadonlySet<string>;
  private readonly keysDown = new Set<string>();
  /** Key presses since the last update, so a tap shorter than one step is not lost. */
  private readonly keyPressesSinceUpdate = new Set<string>();
  private held = new Set<Action>();
  private pressed = new Set<Action>();

  constructor(bindings: ActionBindings<Action>) {
    this.bindings = bindings;
    // Object.keys loses the key type, but the keys come straight from `bindings`.
    this.actions = Object.keys(bindings) as Action[];
    this.boundKeys = new Set(this.actions.flatMap((action) => bindings[action].keys ?? []));

    window.addEventListener('keydown', (event) => {
      if (!this.boundKeys.has(event.code)) return;
      // Arrow keys and Space would otherwise scroll the page.
      event.preventDefault();
      // A held key sends repeated key-downs. Holding is one press, just as it is on a gamepad.
      if (!event.repeat) this.keyPressesSinceUpdate.add(event.code);
      this.keysDown.add(event.code);
    });
    window.addEventListener('keyup', (event) => this.keysDown.delete(event.code));
    // Keys released while another window has focus never send a key-up.
    window.addEventListener('blur', () => this.keysDown.clear());
  }

  update(): void {
    const held = new Set<Action>();
    const pressed = new Set<Action>();
    const gamepads = readGamepads();

    for (const action of this.actions) {
      const isActive = this.isActive(action, gamepads);
      const keyTapped = (this.bindings[action].keys ?? []).some((key) => this.keyPressesSinceUpdate.has(key));
      if (isActive) held.add(action);
      if (keyTapped || (isActive && !this.held.has(action))) pressed.add(action);
    }

    this.keyPressesSinceUpdate.clear();
    this.held = held;
    this.pressed = pressed;
  }

  isDown(action: Action): boolean {
    return this.held.has(action);
  }

  /** True only on the step the action was first pressed. */
  justPressed(action: Action): boolean {
    return this.pressed.has(action);
  }

  private isActive(action: Action, gamepads: readonly Gamepad[]): boolean {
    const { keys = [], buttons = [], stick } = this.bindings[action];
    return (
      keys.some((key) => this.keysDown.has(key)) ||
      buttons.some((button) => isGamepadButtonPressed(button, gamepads)) ||
      (stick !== undefined && isGamepadStickPushed(stick.axis, stick.direction, gamepads))
    );
  }
}
