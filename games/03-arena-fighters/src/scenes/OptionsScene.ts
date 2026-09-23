import * as Phaser from 'phaser';

import { playSound, setMuted } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu, type MenuItem } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, type ChosenCpuLevel } from '../config';
import { SELECT_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import {
  changeSettings,
  CPU_LEVEL_CHOICES,
  ROUNDS_TO_WIN_CHOICES,
  ROUND_SECONDS_CHOICES,
  settings,
  stepChoice,
} from '../systems/settings';
import { SCENES } from './sceneKeys';

const HEADING_Y = 34;
const MENU_Y = 72;
const HINT_Y = 148;

const LEVEL_NAMES: Readonly<Record<ChosenCpuLevel, string>> = {
  easy: 'EASY',
  normal: 'NORMAL',
  hard: 'HARD',
};

/**
 * The settings, each changed with left and right (or confirm, which steps forward, so the
 * screen can also be used one button at a time). Every change is remembered straight away,
 * which is why there is nothing to save and nothing to lose by leaving.
 *
 * What is set here is what a match is started with: arcade and VS CPU use the difficulty, and
 * every mode uses the round time and the number of rounds. In an online match the two browsers
 * cannot each have their own rules, so the room's host settles them for both.
 */
export class OptionsScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.options);
  }

  create(): void {
    fadeIn(this);
    playMusic(SELECT_MUSIC);
    addCenteredPixelText(this, HEADING_Y, 'OPTIONS', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, HINT_Y, 'LEFT AND RIGHT CHANGE A SETTING', { color: COLORS.muted });

    const items: MenuItem[] = [
      this.setting('DIFFICULTY', () => LEVEL_NAMES[settings().cpuLevel], (step) =>
        changeSettings({ cpuLevel: stepChoice(CPU_LEVEL_CHOICES, settings().cpuLevel, step) }),
      ),
      this.setting('ROUND TIME', () => `${settings().roundSeconds} SEC`, (step) =>
        changeSettings({ roundSeconds: stepChoice(ROUND_SECONDS_CHOICES, settings().roundSeconds, step) }),
      ),
      // Two round wins means a match of at most three rounds, which is how it is usually said.
      this.setting('ROUNDS', () => `BEST OF ${settings().roundsToWin * 2 - 1}`, (step) =>
        changeSettings({ roundsToWin: stepChoice(ROUNDS_TO_WIN_CHOICES, settings().roundsToWin, step) }),
      ),
      this.setting('SOUND', () => (settings().sound ? 'ON' : 'OFF'), () => this.toggleSound()),
      { label: 'BACK', onSelect: () => this.leave() },
    ];

    this.menu = new Menu(this, items, {
      y: MENU_Y,
      color: COLORS.muted,
      selectedColor: COLORS.title,
      onMove: () => playSound(SOUNDS.menuMove),
      onConfirm: () => playSound(SOUNDS.confirm),
      onCancel: () => this.leave(),
    });
  }

  override update(): void {
    this.menu.update();
  }

  /** One row: its name, the value it shows, and what left and right do to it. */
  private setting(label: string, value: () => string, change: (step: -1 | 1) => void): MenuItem {
    return { label, value, onChange: change };
  }

  /** Sound off is the same silence the M key gives; this one is remembered for next time. */
  private toggleSound(): void {
    const sound = !settings().sound;
    changeSettings({ sound });
    setMuted(!sound);
  }

  private leave(): void {
    playSound(SOUNDS.back);
    fadeToScene(this, SCENES.title);
  }
}
