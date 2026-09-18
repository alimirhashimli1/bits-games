import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import type { ActionInput } from '@shared/phaser/actionInput';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';
import { Typewriter } from '@shared/phaser/typewriter';

import { COLORS, ENDING, LEVEL, SCREEN, SCREEN_CONTROLS, TIMING } from '../config';
import { ENDING_MUSIC } from '../content/music';
import { ART_COLORS } from '../content/palette';
import { SOUNDS } from '../content/sounds';
import {
  LAMP_SHEET,
  SKYLINE_HEIGHT,
  SKYLINE_SHEET,
  SKYLINE_WINDOWS,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../content/sprites/skyline';
import { TILES_SHEET } from '../content/sprites/tiles';
import { ENDING_HEADING, ENDING_LINES } from '../content/story';
import { RUSTY_LOOKS } from '../entities/Rusty';
import type { PowerState } from '../systems/powerState';
import { forgetWorld } from '../systems/continuePoint';
import { formatScore } from '../systems/score';
import { createScreenInput } from '../systems/screenInput';
import { SCENES } from './sceneKeys';

/** The street is two rows of cobbles along the bottom of the screen; everything stands on it. */
const STREET_TOP = SCREEN.height - LEVEL.tileSize * 2;
const FIRST_LINE_Y = 8;
const LINE_SPACING = 10;
const HEADING_Y = 42;
const SCORE_Y = 54;
const PROMPT_Y = 66;
/** Where Rusty starts, just off the left of the screen. */
const WALK_IN_FROM_X = -12;

/** How the game was won. */
export interface EndingData {
  readonly score: number;
  /** Rusty walks home as he finished the last level. */
  readonly power?: PowerState;
}

type Phase = 'walking' | 'lighting' | 'telling' | 'done';

/**
 * The ending. Rusty walks home along a dark street under a dark town. Then Brasswick's lights
 * come back on, window by window, the street lamps with them and the sky lifts from night to
 * evening, and the end of the story is typed out over it, with his score. Enter skips to the
 * end of all that, and then goes back to the title.
 */
export class EndingScene extends Phaser.Scene {
  private controls!: ActionInput<keyof typeof SCREEN_CONTROLS>;
  private phase: Phase = 'walking';
  private score = 0;
  private rusty!: Phaser.GameObjects.Sprite;
  private standPose = '';
  private walk: Phaser.Tweens.Tween | undefined;
  private lamps: Phaser.GameObjects.Image[] = [];
  private windows!: Phaser.GameObjects.Graphics;
  /** The windows that light up, in the order they do, and how many are lit so far. */
  private windowOrder: number[] = [];
  private litWindows = 0;
  private lighting: Phaser.Time.TimerEvent | undefined;
  private sky: Phaser.Tweens.Tween | undefined;
  private typewriter: Typewriter | undefined;

  constructor() {
    super(SCENES.ending);
  }

  create({ score = 0, power = 'small' }: Partial<EndingData> = {}): void {
    this.score = score;
    this.phase = 'walking';
    // The game is won: the next one starts from the beginning.
    forgetWorld();
    this.litWindows = 0;
    this.typewriter = undefined;
    this.lighting = undefined;
    this.sky = undefined;
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.night);
    playMusic(ENDING_MUSIC);
    this.controls = createScreenInput(this, SCREEN_CONTROLS);

    this.add.image(0, STREET_TOP, SKYLINE_SHEET.key, 'town').setOrigin(0, 1);
    this.windows = this.add.graphics().fillStyle(Phaser.Display.Color.HexStringToColor(ART_COLORS.windowLit).color);
    // Every window lights at a different moment: a fixed shuffle, so the town lights up the same way each time.
    // Some stay dark, so the town does not light up as one even grid.
    this.windowOrder = SKYLINE_WINDOWS.map((_, index) => index)
      .sort((one, other) => ((one * 7919) % 97) - ((other * 7919) % 97) || one - other)
      .slice(0, Math.round(SKYLINE_WINDOWS.length * (1 - ENDING.darkWindowShare)));
    this.lamps = ENDING.lampXs.map((x) => this.add.image(x, STREET_TOP, LAMP_SHEET.key, 'off').setOrigin(0.5, 1));
    for (let row = 0; row < 2; row++) {
      for (let x = 0; x < SCREEN.width; x += LEVEL.tileSize) {
        this.add.image(x, STREET_TOP + row * LEVEL.tileSize, TILES_SHEET.key, 'ground').setOrigin(0, 0);
      }
    }

    const look = RUSTY_LOOKS[power];
    this.standPose = look.poses.stand;
    this.rusty = this.add.sprite(WALK_IN_FROM_X, STREET_TOP, look.texture).setOrigin(0.5, 1).play(look.poses.walk);
    this.walk = this.tweens.add({
      targets: this.rusty,
      x: ENDING.stopX,
      duration: ENDING.walkMs,
      onComplete: () => {
        this.rusty.play(this.standPose);
        this.time.delayedCall(ENDING.pauseMs, () => this.startLighting());
      },
    });
  }

  override update(_time: number, deltaMs: number): void {
    this.controls.update();
    this.typewriter?.update(deltaMs);
    if (this.phase === 'telling' && this.typewriter?.isFinished) this.showFinish();
    if (!this.controls.justPressed('confirm')) return;
    if (this.phase === 'done') fadeToScene(this, SCENES.title);
    else this.skipToEnd();
  }

  /** The lamps come on, the sky lifts, and the windows light one after another. */
  private startLighting(): void {
    if (this.phase !== 'walking') return;
    this.phase = 'lighting';
    for (const lamp of this.lamps) lamp.setFrame('on');

    const night = Phaser.Display.Color.ValueToColor(COLORS.night);
    const evening = Phaser.Display.Color.ValueToColor(COLORS.evening);
    this.sky = this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: ENDING.lightMs,
      onUpdate: (tween) => {
        const { r, g, b } = Phaser.Display.Color.Interpolate.ColorWithColor(night, evening, 1, tween.getValue() ?? 0);
        this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(r, g, b));
      },
    });
    this.lighting = this.time.addEvent({
      delay: ENDING.lightMs / this.windowOrder.length,
      repeat: this.windowOrder.length - 1,
      callback: () => {
        this.lightWindows(this.litWindows + 1);
        if (this.litWindows === this.windowOrder.length) this.startTelling();
      },
    });
  }

  /** Lights the windows up to the `count`th in the order, drawing only the new ones. */
  private lightWindows(count: number): void {
    for (; this.litWindows < count; this.litWindows++) {
      const window = SKYLINE_WINDOWS[this.windowOrder[this.litWindows] ?? 0];
      if (!window) continue;
      const [x, y] = window;
      this.windows.fillRect(x, STREET_TOP - SKYLINE_HEIGHT + y, WINDOW_WIDTH, WINDOW_HEIGHT);
    }
  }

  /** With the town lit, the end of the story is typed out over the sky. */
  private startTelling(): void {
    if (this.phase === 'telling' || this.phase === 'done') return;
    this.phase = 'telling';
    const labels = ENDING_LINES.map((line, index) =>
      addCenteredPixelText(this, FIRST_LINE_Y + index * LINE_SPACING, line, { color: COLORS.text }),
    );
    this.typewriter = new Typewriter(labels, ENDING_LINES, TIMING.storyCharsPerSecond, () => playSound(SOUNDS.type));
  }

  /** The thanks, the score and the way back to the title. */
  private showFinish(): void {
    this.phase = 'done';
    addCenteredPixelText(this, HEADING_Y, ENDING_HEADING, { color: COLORS.title });
    addCenteredPixelText(this, SCORE_Y, `SCORE ${formatScore(this.score)}`, { color: COLORS.text });
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.muted });
    blink(this, prompt, TIMING.promptBlinkMs);
  }

  /** Enter before the end: Rusty home, every light on, the whole story shown. */
  private skipToEnd(): void {
    this.walk?.stop();
    this.rusty.setX(ENDING.stopX).play(this.standPose);
    if (this.phase === 'walking') this.startLighting();
    this.lighting?.remove();
    this.sky?.stop();
    this.cameras.main.setBackgroundColor(COLORS.evening);
    this.lightWindows(this.windowOrder.length);
    this.startTelling();
    this.typewriter?.finish();
    this.showFinish();
  }
}
