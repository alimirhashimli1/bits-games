import type * as Phaser from 'phaser';

import { addCenteredPixelText, addPixelText } from '@shared/phaser/pixelText';

import { COLORS } from '../../config';
import { CONTROL_NOTES, CONTROL_ROWS } from '../../content/controls';

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
 * because both the title screen and the pause menu need to show the same thing.
 */
export class ControlsPanel {
  private readonly texts: Phaser.GameObjects.BitmapText[] = [];

  constructor(scene: Phaser.Scene) {
    this.texts.push(addCenteredPixelText(scene, HEADING_Y, 'CONTROLS', { color: COLORS.title }));
    this.texts.push(addPixelText(scene, ACTION_X, FIRST_ROW_Y, 'ACTION', { color: COLORS.muted }));
    this.texts.push(addPixelText(scene, KEYBOARD_X, FIRST_ROW_Y, 'KEYS', { color: COLORS.muted }));
    this.texts.push(addPixelText(scene, GAMEPAD_X, FIRST_ROW_Y, 'PAD', { color: COLORS.muted }));

    CONTROL_ROWS.forEach(([action, keyboard, gamepad], row) => {
      const y = FIRST_ROW_Y + (row + 1) * ROW_HEIGHT + 2;
      this.texts.push(addPixelText(scene, ACTION_X, y, action, { color: COLORS.text }));
      this.texts.push(addPixelText(scene, KEYBOARD_X, y, keyboard, { color: COLORS.text }));
      this.texts.push(addPixelText(scene, GAMEPAD_X, y, gamepad, { color: COLORS.text }));
    });

    const notesTop = FIRST_ROW_Y + (CONTROL_ROWS.length + 1) * ROW_HEIGHT + NOTE_GAP;
    CONTROL_NOTES.forEach((note, row) => {
      this.texts.push(addCenteredPixelText(scene, notesTop + row * ROW_HEIGHT, note, { color: COLORS.muted }));
    });
  }

  destroy(): void {
    this.texts.forEach((text) => text.destroy());
  }
}
