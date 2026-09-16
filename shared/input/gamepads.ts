/** How far a stick must be pushed (0 to 1) to count as a direction. */
const STICK_THRESHOLD = 0.5;

function connectedGamepads(): Gamepad[] {
  return navigator.getGamepads().filter((gamepad): gamepad is Gamepad => gamepad !== null);
}

/** True if the button (standard layout index, e.g. 0 = A, 14 = D-pad left) is pressed on any gamepad. */
export function isGamepadButtonPressed(button: number): boolean {
  return connectedGamepads().some((gamepad) => gamepad.buttons[button]?.pressed === true);
}

/** True if a stick axis (0 = left stick X, 1 = left stick Y) is pushed in `direction` on any gamepad. */
export function isGamepadStickPushed(axis: number, direction: -1 | 1): boolean {
  return connectedGamepads().some((gamepad) => (gamepad.axes[axis] ?? 0) * direction > STICK_THRESHOLD);
}
