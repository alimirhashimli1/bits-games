import type * as Phaser from 'phaser';

import { addCenteredPixelText, addPixelText } from './pixelText';

/** One row of the controls table: what it does, its keys and its gamepad button. */
export type ControlRow = readonly [action: string, keyboard: string, gamepad: string];

/** What a game's controls table shows, and in which colours. */
export interface ControlsTable {
  readonly rows: readonly ControlRow[];
  /** Short lines under the table, such as the rules that matter most. */
  readonly notes?: readonly string[];
  readonly colors: {
    readonly title: number;
    readonly text: number;
    readonly muted: number;
  };
}

const HEADING_Y = 14;
const FIRST_ROW_Y = 32;
const ROW_HEIGHT = 9;
/** Left edge of each column. */
const ACTION_X = 20;
const KEYBOARD_X = 140;
const GAMEPAD_X = 230;
const NOTE_GAP = 8;

/**
 * The controls table, drawn as three columns. It is a panel rather than a scene of its own,
 * because both the title screen and the pause menu show the same thing.
 */
export class ControlsPanel {
  private readonly texts: Phaser.GameObjects.BitmapText[] = [];

  constructor(scene: Phaser.Scene, { rows, notes = [], colors }: ControlsTable) {
    this.texts.push(addCenteredPixelText(scene, HEADING_Y, 'CONTROLS', { color: colors.title }));
    this.texts.push(addPixelText(scene, ACTION_X, FIRST_ROW_Y, 'ACTION', { color: colors.muted }));
    this.texts.push(addPixelText(scene, KEYBOARD_X, FIRST_ROW_Y, 'KEYS', { color: colors.muted }));
    this.texts.push(addPixelText(scene, GAMEPAD_X, FIRST_ROW_Y, 'PAD', { color: colors.muted }));

    rows.forEach(([action, keyboard, gamepad], row) => {
      const y = FIRST_ROW_Y + (row + 1) * ROW_HEIGHT + 2;
      this.texts.push(addPixelText(scene, ACTION_X, y, action, { color: colors.text }));
      this.texts.push(addPixelText(scene, KEYBOARD_X, y, keyboard, { color: colors.text }));
      this.texts.push(addPixelText(scene, GAMEPAD_X, y, gamepad, { color: colors.text }));
    });

    const notesTop = FIRST_ROW_Y + (rows.length + 1) * ROW_HEIGHT + NOTE_GAP;
    notes.forEach((note, row) => {
      this.texts.push(addCenteredPixelText(scene, notesTop + row * ROW_HEIGHT, note, { color: colors.muted }));
    });
  }

  destroy(): void {
    this.texts.forEach((text) => text.destroy());
  }
}
