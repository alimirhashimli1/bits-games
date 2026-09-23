import type { ControlRow, ControlsTable } from '@shared/phaser/controlsPanel';

import { COLORS } from '../config';

/**
 * The controls, as rows of [action, keyboard, gamepad]. The keyboard column holds both players:
 * player 1 on the left half of the keyboard and player 2 on the right, exactly as `config.ts`
 * binds them. Either player may use a gamepad instead, and the buttons are the same for both.
 */
export const CONTROL_ROWS: readonly ControlRow[] = [
  ['MOVE JUMP CROUCH', 'WASD  ARROWS', 'D-PAD'],
  ['LIGHT PUNCH', 'F     K', 'X'],
  ['HEAVY PUNCH', 'G     L', 'Y'],
  ['LIGHT KICK', 'V     ,', 'A'],
  ['HEAVY KICK', 'B     .', 'B'],
  ['MENUS', 'ENTER ESC', 'A   B'],
  ['PAUSE', 'ESC', 'START'],
  ['MUTE', 'M', '-'],
];

/** Shown under the table: the two rules that a list of keys cannot teach. */
export const CONTROL_NOTES: readonly string[] = [
  'PLAYER 1 KEYS LEFT, PLAYER 2 RIGHT.',
  'SPECIALS: DOWN, TOWARDS, THEN A BUTTON.',
  'THROW: LIGHT PUNCH AND KICK UP CLOSE.',
];

/** The table as the title's controls screen and the pause menu show it. */
export const CONTROLS_TABLE: ControlsTable = {
  rows: CONTROL_ROWS,
  notes: CONTROL_NOTES,
  colors: { title: COLORS.title, text: COLORS.text, muted: COLORS.muted },
};
