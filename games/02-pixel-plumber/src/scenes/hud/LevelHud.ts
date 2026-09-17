import type * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS, LEVEL } from '../../config';
import { formatScore, formatTime } from '../../systems/score';

/**
 * Where the counters sit. The level map is one row taller than the screen, so its top row is
 * half hidden behind these two lines, which is where the original console put its counters.
 */
const LABEL_Y = 3;
const VALUE_Y = 11;
/** The middle of each column, in screen pixels. */
const COLUMNS = { score: 31, coins: 91, world: 151, time: 212, lives: 271 } as const;
/** Coins are shown with a leading zero, so the column does not jump about. */
const COIN_DIGITS = 2;

/** What the HUD shows. */
export interface HudValues {
  readonly score: number;
  readonly coins: number;
  readonly time: number;
  readonly lives: number;
}

/** One counter: its text and the point it stays centred on. */
interface Column {
  readonly text: Phaser.GameObjects.BitmapText;
  readonly centerX: number;
}

/** Adds text centred on `centerX`, snapped to a whole pixel and fixed to the screen. */
function addColumn(scene: Phaser.Scene, centerX: number, y: number, text: string, color: number): Column {
  const label = addPixelText(scene, 0, y, text, { color });
  label.setX(Math.round(centerX - label.width / 2)).setScrollFactor(0);
  return { text: label, centerX };
}

function setColumn({ text, centerX }: Column, value: string): void {
  text.setText(value);
  text.setX(Math.round(centerX - text.width / 2));
}

/** The counters along the top of a level: score, coins, world, time and lives. */
export class LevelHud {
  private readonly score: Column;
  private readonly coins: Column;
  private readonly time: Column;
  private readonly lives: Column;
  /** The last values shown, so only what changed is redrawn. */
  private shown: HudValues | undefined;
  private lowTime = false;

  constructor(scene: Phaser.Scene, world: string, values: HudValues) {
    addColumn(scene, COLUMNS.score, LABEL_Y, 'SCORE', COLORS.text);
    addColumn(scene, COLUMNS.coins, LABEL_Y, 'COINS', COLORS.text);
    addColumn(scene, COLUMNS.world, LABEL_Y, 'WORLD', COLORS.text);
    addColumn(scene, COLUMNS.time, LABEL_Y, 'TIME', COLORS.text);
    addColumn(scene, COLUMNS.lives, LABEL_Y, 'RUSTY', COLORS.text);
    addColumn(scene, COLUMNS.world, VALUE_Y, world, COLORS.text);

    this.score = addColumn(scene, COLUMNS.score, VALUE_Y, '', COLORS.text);
    this.coins = addColumn(scene, COLUMNS.coins, VALUE_Y, '', COLORS.title);
    this.time = addColumn(scene, COLUMNS.time, VALUE_Y, '', COLORS.text);
    this.lives = addColumn(scene, COLUMNS.lives, VALUE_Y, '', COLORS.text);
    this.show(values);
  }

  /** Call whenever something changes, and once a frame for the clock. */
  show(values: HudValues): void {
    const before = this.shown;
    if (!before || values.score !== before.score) setColumn(this.score, formatScore(values.score));
    if (!before || values.coins !== before.coins) {
      setColumn(this.coins, `x${String(values.coins).padStart(COIN_DIGITS, '0')}`);
    }
    if (!before || values.lives !== before.lives) setColumn(this.lives, `x${values.lives}`);
    if (!before || values.time !== before.time) {
      setColumn(this.time, formatTime(values.time));
      // The clock turns red for the last of the time, which is all the warning there is until there is sound.
      const low = values.time <= LEVEL.lowTime;
      if (low !== this.lowTime) {
        this.lowTime = low;
        this.time.text.setTint(low ? COLORS.danger : COLORS.text);
      }
    }
    this.shown = values;
  }
}
