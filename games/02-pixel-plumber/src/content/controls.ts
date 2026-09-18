import type { ControlRow, ControlsTable } from '@shared/phaser/controlsPanel';

import { COLORS } from '../config';

/** The controls, as rows of [action, keyboard, gamepad], for the controls screen. */
export const CONTROL_ROWS: readonly ControlRow[] = [
  ['MOVE', 'ARROWS', 'D-PAD'],
  ['DUCK / DOWN A PIPE', 'DOWN', 'DOWN'],
  ['JUMP', 'Z / SPACE', 'A'],
  ['RUN / STEAM', 'X', 'X / B'],
  ['PAUSE', 'ESC', 'START'],
  ['MUTE', 'M', '-'],
];

/** Shown under the table. */
export const CONTROL_NOTES: readonly string[] = [
  'HOLD JUMP TO JUMP HIGHER, AND RUN',
  'FOR LONGER JUMPS.',
  'STEAM RUSTY FIRES PUFFS WITH RUN.',
];

/** The table as the title's controls screen and the pause menu show it. */
export const CONTROLS_TABLE: ControlsTable = {
  rows: CONTROL_ROWS,
  notes: CONTROL_NOTES,
  colors: { title: COLORS.title, text: COLORS.text, muted: COLORS.muted },
};
