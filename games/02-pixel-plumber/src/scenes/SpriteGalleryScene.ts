import * as Phaser from 'phaser';

import type { ActionInput } from '@shared/phaser/actionInput';
import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS, SCREEN, SCREEN_CONTROLS } from '../config';
import { ENEMY_ANIMATIONS, ENEMY_SHEET, SPROUT_ANIMATIONS, SPROUT_SHEET } from '../content/sprites/enemies';
import { VALVE_WHEEL_ANIMATIONS, VALVE_WHEEL_SHEET } from '../content/sprites/levelEnd';
import {
  POWER_UP_ANIMATIONS,
  POWER_UP_SHEET,
  STEAM_PUFF_ANIMATIONS,
  STEAM_PUFF_SHEET,
} from '../content/sprites/powerUps';
import {
  RUSTY_BIG_ANIMATIONS,
  RUSTY_BIG_SHEET,
  RUSTY_SMALL_ANIMATIONS,
  RUSTY_SMALL_SHEET,
  RUSTY_STEAM_ANIMATIONS,
  RUSTY_STEAM_SHEET,
} from '../content/sprites/rusty';
import { createScreenInput } from '../systems/screenInput';
import { SCENES } from './sceneKeys';

const COLUMNS = 6;
const ROWS = 4;
const CELL_WIDTH = SCREEN.width / COLUMNS;
const CELL_HEIGHT = SCREEN.height / ROWS;
const LABEL_MARGIN = 2;
/** Space under each sprite's feet. */
const FLOOR_MARGIN = 3;
/** Pause before one-shot animations, like growing, play again. */
const REPLAY_DELAY_MS = 600;
/** The last cell of each page says which page it is. */
const PER_PAGE = COLUMNS * ROWS - 1;

/** Labels are at most 8 characters so they fit inside one cell. */
const GALLERY: ReadonlyArray<readonly [label: string, texture: string, animation: string]> = [
  ['S STAND', RUSTY_SMALL_SHEET.key, RUSTY_SMALL_ANIMATIONS.stand.key],
  ['S WALK', RUSTY_SMALL_SHEET.key, RUSTY_SMALL_ANIMATIONS.walk.key],
  ['S RUN', RUSTY_SMALL_SHEET.key, RUSTY_SMALL_ANIMATIONS.run.key],
  ['S SKID', RUSTY_SMALL_SHEET.key, RUSTY_SMALL_ANIMATIONS.skid.key],
  ['S JUMP', RUSTY_SMALL_SHEET.key, RUSTY_SMALL_ANIMATIONS.jump.key],
  ['S DEFEAT', RUSTY_SMALL_SHEET.key, RUSTY_SMALL_ANIMATIONS.defeat.key],
  ['B STAND', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.stand.key],
  ['B WALK', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.walk.key],
  ['B RUN', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.run.key],
  ['B SKID', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.skid.key],
  ['B JUMP', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.jump.key],
  ['B DUCK', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.duck.key],
  ['GROW', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.grow.key],
  ['SHRINK', RUSTY_BIG_SHEET.key, RUSTY_BIG_ANIMATIONS.shrink.key],
  ['ST STAND', RUSTY_STEAM_SHEET.key, RUSTY_STEAM_ANIMATIONS.stand.key],
  ['ST RUN', RUSTY_STEAM_SHEET.key, RUSTY_STEAM_ANIMATIONS.run.key],
  ['ST JUMP', RUSTY_STEAM_SHEET.key, RUSTY_STEAM_ANIMATIONS.jump.key],
  ['ST DUCK', RUSTY_STEAM_SHEET.key, RUSTY_STEAM_ANIMATIONS.duck.key],
  ['GEAR', POWER_UP_SHEET.key, POWER_UP_ANIMATIONS.gear.key],
  ['VALVE', POWER_UP_SHEET.key, POWER_UP_ANIMATIONS.steamValve.key],
  ['GASKET', POWER_UP_SHEET.key, POWER_UP_ANIMATIONS.goldenGasket.key],
  ['WRENCH', POWER_UP_SHEET.key, POWER_UP_ANIMATIONS.wrench.key],
  ['PUFF', STEAM_PUFF_SHEET.key, STEAM_PUFF_ANIMATIONS.fly.key],
  ['GLOOP', ENEMY_SHEET.key, ENEMY_ANIMATIONS.gloop.key],
  ['GLOOP FL', ENEMY_SHEET.key, ENEMY_ANIMATIONS.gloopFlat.key],
  ['BUG', ENEMY_SHEET.key, ENEMY_ANIMATIONS.shellbug.key],
  ['SHELL', ENEMY_SHEET.key, ENEMY_ANIMATIONS.shell.key],
  ['SLIDING', ENEMY_SHEET.key, ENEMY_ANIMATIONS.shellSliding.key],
  ['FLUTTER', ENEMY_SHEET.key, ENEMY_ANIMATIONS.flutterbug.key],
  ['SPROUT', SPROUT_SHEET.key, SPROUT_ANIMATIONS.snap.key],
  ['SPARK', ENEMY_SHEET.key, ENEMY_ANIMATIONS.spark.key],
  ['CHAIN', ENEMY_SHEET.key, ENEMY_ANIMATIONS.chainLink.key],
  ['WHEEL', VALVE_WHEEL_SHEET.key, VALVE_WHEEL_ANIMATIONS.turn.key],
];

const PAGES = Math.ceil(GALLERY.length / PER_PAGE);

/**
 * Development tool (open with `?scene=SpriteGallery`): plays every animation in the game on
 * one screen. Enter or Space shows the next page.
 */
export class SpriteGalleryScene extends Phaser.Scene {
  private controls!: ActionInput<keyof typeof SCREEN_CONTROLS>;
  private shown: Phaser.GameObjects.GameObject[] = [];
  private page = 0;

  constructor() {
    super(SCENES.spriteGallery);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.controls = createScreenInput(this, SCREEN_CONTROLS);
    this.showPage(0);
  }

  override update(): void {
    this.controls.update();
    if (this.controls.justPressed('confirm')) this.showPage(this.page + 1);
  }

  private showPage(page: number): void {
    this.shown.forEach((object) => object.destroy());
    this.shown = [];
    this.page = page % PAGES;

    const entries = GALLERY.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE);
    entries.forEach(([label, texture, animation], index) => {
      const { left, top } = this.cell(index);
      this.shown.push(
        addPixelText(this, left + LABEL_MARGIN, top + LABEL_MARGIN, label, { color: COLORS.text }),
        this.add
          .sprite(left + CELL_WIDTH / 2, top + CELL_HEIGHT - FLOOR_MARGIN, texture)
          .setOrigin(0.5, 1)
          .play({ key: animation, repeat: -1, repeatDelay: REPLAY_DELAY_MS }),
      );
    });

    const { left, top } = this.cell(PER_PAGE);
    this.shown.push(
      addPixelText(this, left + LABEL_MARGIN, top + LABEL_MARGIN, `PAGE ${this.page + 1}/${PAGES}`, {
        color: COLORS.title,
      }),
    );
  }

  private cell(index: number): { left: number; top: number } {
    return {
      left: Math.floor((index % COLUMNS) * CELL_WIDTH),
      top: Math.floor(index / COLUMNS) * CELL_HEIGHT,
    };
  }
}
