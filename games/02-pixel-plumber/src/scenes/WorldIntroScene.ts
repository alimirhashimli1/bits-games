import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import type { ActionInput } from '@shared/phaser/actionInput';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText, addPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';
import { Typewriter } from '@shared/phaser/typewriter';

import { COLORS, SCREEN, SCREEN_CONTROLS, TIMING } from '../config';
import { SOUNDS } from '../content/sounds';
import { WORLD_STORIES } from '../content/story';
import { RUSTY_LOOKS } from '../entities/Rusty';
import { rememberWorld } from '../systems/continuePoint';
import { levelId, type RunState } from '../systems/runState';
import { createScreenInput } from '../systems/screenInput';
import { SCENES } from './sceneKeys';

const STORY_WORLD_Y = 24;
const STORY_NAME_Y = 46;
const STORY_FIRST_LINE_Y = 72;
const STORY_LINE_SPACING = 12;
const PROMPT_Y = 150;

const CARD_LEVEL_Y = 56;
const CARD_NAME_Y = 80;
/** Rusty stands on this line, with his lives beside him. */
const CARD_FEET_Y = 124;
const CARD_LIVES_GAP = 8;
const LIVES_TEXT_HEIGHT = 8;

/** What the intro is given: the run, and whether it has just arrived in a new world. */
export interface WorldIntroData extends RunState {
  /**
   * Set when the run arrives here by starting the game or clearing a level, so the first level
   * of a world opens with its story. Coming back after a lost life skips it.
   */
  readonly story?: boolean;
}

/**
 * The black card before every level, and again after each lost life: the level, the world's
 * name and Rusty with his lives. Before the first level of each world it first tells that
 * part of the story.
 */
export class WorldIntroScene extends Phaser.Scene {
  private controls!: ActionInput<keyof typeof SCREEN_CONTROLS>;
  private run!: RunState;
  private typewriter: Typewriter | undefined;
  private shown: Phaser.GameObjects.GameObject[] = [];
  private leaving = false;

  constructor() {
    super(SCENES.worldIntro);
  }

  create({ story = false, ...run }: WorldIntroData): void {
    this.run = run;
    this.leaving = false;
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);
    this.controls = createScreenInput(this, SCREEN_CONTROLS);
    // The cards are quiet: each level starts its own music.
    stopMusic();

    const id = levelId(run);
    const world = id.charAt(0);
    // Reaching a world is what Continue on the title goes back to.
    rememberWorld(id);
    const worldStory = WORLD_STORIES[world];
    if (story && id.endsWith('-1') && worldStory) this.showStory(world, worldStory.name, worldStory.lines);
    else this.showCard();
  }

  override update(_time: number, deltaMs: number): void {
    this.controls.update();
    const typewriter = this.typewriter;
    if (typewriter) {
      typewriter.update(deltaMs);
      if (!this.controls.justPressed('confirm')) return;
      // The first press finishes the typing, the next moves on to the level card.
      if (typewriter.isFinished) {
        playSound(SOUNDS.confirm);
        this.showCard();
      } else typewriter.finish();
      return;
    }
    if (this.controls.justPressed('confirm')) this.startLevel();
  }

  /** The start of a world: its number and name, and its part of the story typed out. */
  private showStory(world: string, name: string, lines: readonly string[]): void {
    this.shown.push(
      addCenteredPixelText(this, STORY_WORLD_Y, `WORLD ${world}`, { color: COLORS.title, scale: 2 }),
      addCenteredPixelText(this, STORY_NAME_Y, name, { color: COLORS.text }),
    );
    // Each line is centred as if it were already typed out, so the text types from a fixed edge.
    const labels = lines.map((line, index) =>
      addCenteredPixelText(this, STORY_FIRST_LINE_Y + index * STORY_LINE_SPACING, line, { color: COLORS.muted }),
    );
    this.shown.push(...labels);
    this.typewriter = new Typewriter(labels, lines, TIMING.storyCharsPerSecond, () => playSound(SOUNDS.type));
    const prompt = addCenteredPixelText(this, PROMPT_Y, 'PRESS ENTER', { color: COLORS.text });
    blink(this, prompt, TIMING.promptBlinkMs);
    this.shown.push(prompt);
  }

  /** The level, the world's name, and Rusty as he is now with the lives he has left. Moves on by itself. */
  private showCard(): void {
    this.typewriter = undefined;
    this.shown.forEach((object) => object.destroy());
    this.shown = [];

    const id = levelId(this.run);
    addCenteredPixelText(this, CARD_LEVEL_Y, `WORLD ${id}`, { color: COLORS.text, scale: 2 });
    const name = WORLD_STORIES[id.charAt(0)]?.name;
    if (name) addCenteredPixelText(this, CARD_NAME_Y, name, { color: COLORS.muted });

    const look = RUSTY_LOOKS[this.run.power];
    const rusty = this.add.sprite(0, CARD_FEET_Y, look.texture).setOrigin(0.5, 1).play(look.poses.stand);
    const lives = addPixelText(this, 0, CARD_FEET_Y - LIVES_TEXT_HEIGHT, `x ${this.run.lives}`, { color: COLORS.text });
    // Rusty and his lives, centred together.
    const width = rusty.width + CARD_LIVES_GAP + lives.width;
    const left = Math.round((SCREEN.width - width) / 2);
    rusty.setX(left + rusty.width / 2);
    lives.setX(left + rusty.width + CARD_LIVES_GAP);

    this.time.delayedCall(TIMING.worldIntroMs, () => this.startLevel());
  }

  private startLevel(): void {
    if (this.leaving) return;
    this.leaving = true;
    fadeToScene(this, SCENES.level, this.run);
  }
}
