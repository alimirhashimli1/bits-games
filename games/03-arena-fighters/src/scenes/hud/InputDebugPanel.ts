import type * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS, SCREEN } from '../../config';
import { BUTTONS, isHeld, INPUT, newlyPressed, numpadDirection, type Button, type InputBits } from '../../systems/input/inputBits';
import { completedMotions, MOTION_FACING, type MotionName } from '../../systems/input/motions';
import type { PlayerIndex } from '../../systems/matchSetup';
import type { FightState } from '../../systems/sim/fightState';

const BUTTON_LABELS: Readonly<Record<Button, string>> = {
  lightPunch: 'LP',
  heavyPunch: 'HP',
  lightKick: 'LK',
  heavyKick: 'HK',
};

/** Motions in keypad notation, seen from the side the player started on. */
const MOTION_LABELS: Readonly<Record<MotionName, string>> = {
  forward: '6',
  downForward: '26',
};

const PLAYERS: readonly PlayerIndex[] = [0, 1];
const TOP = 48;
const LINE_HEIGHT = 10;
const MARGIN = 6;
const PLAYER_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };

/**
 * Development view of what the fight reads from each player: the direction held (in keypad
 * numbers, from the side that player started on), the buttons down, and the last press with any motions
 * that came with it. Toggled with I, hidden by default.
 */
export class InputDebugPanel {
  private readonly held: Record<PlayerIndex, Phaser.GameObjects.BitmapText>;
  private readonly lastPress: Record<PlayerIndex, Phaser.GameObjects.BitmapText>;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    const line = (player: PlayerIndex, row: number): Phaser.GameObjects.BitmapText =>
      addPixelText(scene, 0, TOP + row * LINE_HEIGHT, '', { color: PLAYER_COLORS[player] })
        .setScrollFactor(0)
        .setVisible(false);
    this.held = { 0: line(0, 0), 1: line(1, 0) };
    this.lastPress = { 0: line(0, 1), 1: line(1, 1) };
  }

  toggle(): void {
    this.visible = !this.visible;
    for (const player of PLAYERS) {
      this.held[player].setVisible(this.visible);
      this.lastPress[player].setVisible(this.visible);
    }
  }

  /** Call after every step, so no press is missed when a frame runs several steps. */
  observe(state: FightState): void {
    for (const player of PLAYERS) {
      const history = state.history[player];
      const input = history[history.length - 1] ?? 0;
      const pressed = newlyPressed(input, history[history.length - 2] ?? 0);
      if (pressed === 0) continue;

      const motions = completedMotions(history, MOTION_FACING[player]).map((name) => MOTION_LABELS[name]);
      const label = [...motions, buttonLabels(pressed)].join(' + ');
      this.setText(this.lastPress[player], player, `LAST ${label}`);
    }
  }

  /** Call once per frame. */
  draw(state: FightState): void {
    for (const player of PLAYERS) {
      const history = state.history[player];
      const input = history[history.length - 1] ?? 0;
      const direction = numpadDirection(input, MOTION_FACING[player]);
      this.setText(this.held[player], player, `HELD ${direction} ${buttonLabels(input)}`.trim());
    }
  }

  /** Player 1's lines sit on the left, player 2's are right-aligned on the right. */
  private setText(label: Phaser.GameObjects.BitmapText, player: PlayerIndex, text: string): void {
    label.setText(text);
    label.setX(player === 0 ? MARGIN : SCREEN.width - MARGIN - label.width);
  }
}

function buttonLabels(bits: InputBits): string {
  return BUTTONS.filter((button) => isHeld(bits, INPUT[button]))
    .map((button) => BUTTON_LABELS[button])
    .join(' ');
}
