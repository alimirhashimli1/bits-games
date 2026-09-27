import type { ControlRow, ControlsTable } from '@shared/phaser/controlsPanel';

import { COLORS } from '../config';

/** The controls, as rows of [action, keyboard, gamepad], for the controls screen. */
export const CONTROL_ROWS: readonly ControlRow[] = [
  ['MOVE', 'ARROWS / WASD', 'D-PAD'],
  ['SWORD', 'Z / SPACE', 'A'],
  ['USE ITEM', 'X', 'B'],
  ['INVENTORY', 'ENTER', 'START'],
  ['PAUSE', 'ESC', 'SELECT'],
  ['MUTE', 'M', '-'],
];

/** Shown under the table. */
export const CONTROL_NOTES: readonly string[] = [
  'WALK INTO PEOPLE AND SIGNS TO TALK.',
  'CHOOSE THE ITEM FOR X IN THE INVENTORY.',
];

/** The table as the title's controls screen and the pause menu show it. */
export const CONTROLS_TABLE: ControlsTable = {
  rows: CONTROL_ROWS,
  notes: CONTROL_NOTES,
  colors: { title: COLORS.title, text: COLORS.text, muted: COLORS.muted },
};
