/**
 * The controls as the CONTROLS screen lists them, matching the table in the README and the
 * bindings in `controls.ts`. The pixel font has no arrows, so the arrow keys are named.
 */
export interface ControlsHelpRow {
  readonly action: string;
  readonly keyboard: string;
  readonly gamepad: string;
}

export const CONTROLS_HELP: readonly ControlsHelpRow[] = [
  { action: 'STEER', keyboard: 'LEFT RIGHT / A D', gamepad: 'D-PAD / STICK' },
  { action: 'ACCELERATE', keyboard: 'UP / W / X', gamepad: 'A' },
  { action: 'BRAKE', keyboard: 'DOWN / S / Z', gamepad: 'B / X' },
  { action: 'GEAR', keyboard: 'SPACE / C', gamepad: 'Y / RB' },
  { action: 'PAUSE', keyboard: 'ESC', gamepad: 'START' },
  { action: 'MUTE', keyboard: 'M', gamepad: '-' },
  { action: 'CONSOLE MENU', keyboard: 'BACKSPACE', gamepad: '-' },
];
