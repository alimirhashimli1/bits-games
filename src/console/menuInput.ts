import { isGamepadButtonPressed, isGamepadStickPushed } from '@shared/input/gamepads';

export type MenuDirection = 'left' | 'right' | 'up' | 'down';
export type MenuAction = MenuDirection | 'confirm';

const KEY_ACTIONS: Readonly<Record<string, MenuAction>> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  KeyA: 'left',
  KeyD: 'right',
  KeyW: 'up',
  KeyS: 'down',
  Enter: 'confirm',
  Space: 'confirm',
};

/** Standard gamepad layout: 0 = A, 9 = Start, 12-15 = D-pad. */
const GAMEPAD_BUTTON_ACTIONS: ReadonlyArray<readonly [button: number, action: MenuAction]> = [
  [12, 'up'],
  [13, 'down'],
  [14, 'left'],
  [15, 'right'],
  [0, 'confirm'],
  [9, 'confirm'],
];

/** Left stick: axis 0 is horizontal, axis 1 is vertical. */
const GAMEPAD_STICK_ACTIONS: ReadonlyArray<readonly [axis: number, direction: -1 | 1, action: MenuAction]> = [
  [0, -1, 'left'],
  [0, 1, 'right'],
  [1, -1, 'up'],
  [1, 1, 'down'],
];

/** Calls `onAction` whenever the player presses a menu key or gamepad button. */
export function listenForMenuInput(onAction: (action: MenuAction) => void): void {
  window.addEventListener('keydown', (event) => {
    const action = KEY_ACTIONS[event.code];
    if (!action) return;

    // Stops arrow keys scrolling the page and Enter/Space clicking a button twice.
    event.preventDefault();
    if (event.repeat && action === 'confirm') return;
    onAction(action);
  });

  // Browsers only expose gamepads after one connects, so start polling then.
  window.addEventListener('gamepadconnected', () => pollGamepads(onAction), { once: true });
}

function pollGamepads(onAction: (action: MenuAction) => void): void {
  let heldActions = new Set<MenuAction>();

  const poll = (): void => {
    const pressedActions = readGamepadActions();
    for (const action of pressedActions) {
      if (!heldActions.has(action)) onAction(action);
    }
    heldActions = pressedActions;
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
}

function readGamepadActions(): Set<MenuAction> {
  const actions = new Set<MenuAction>();
  for (const [button, action] of GAMEPAD_BUTTON_ACTIONS) {
    if (isGamepadButtonPressed(button)) actions.add(action);
  }
  for (const [axis, direction, action] of GAMEPAD_STICK_ACTIONS) {
    if (isGamepadStickPushed(axis, direction)) actions.add(action);
  }
  return actions;
}
