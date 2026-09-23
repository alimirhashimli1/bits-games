import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, type ChosenCpuLevel } from '../config';
import { SELECT_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { DEFAULT_MATCH, type GameMode, type MatchSetup } from '../systems/matchSetup';
import { changeSettings, CPU_LEVEL_CHOICES, matchRules, settings } from '../systems/settings';
import { SCENES } from './sceneKeys';

const HEADING_Y = 40;
const MENU_Y = 80;

const MODES: readonly { readonly mode: GameMode; readonly label: string }[] = [
  { mode: 'arcade', label: 'ARCADE' },
  { mode: 'solo', label: 'VS CPU' },
  { mode: 'versus', label: 'VERSUS' },
  { mode: 'online', label: 'ONLINE' },
];

/** How hard the computer plays a solo match. The boss level is not here: it is Vane's alone. */
const LEVELS: readonly { readonly level: ChosenCpuLevel; readonly label: string }[] = [
  { level: 'easy', label: 'EASY' },
  { level: 'normal', label: 'NORMAL' },
  { level: 'hard', label: 'HARD' },
];

/**
 * The ladder, a single match against the computer, two players here, or online by link.
 *
 * VS CPU asks one more question before moving on — how hard the computer plays — so this screen
 * swaps its menu for a second one rather than opening another scene for three words.
 */
export class ModeSelectScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu: Menu | undefined;
  private heading!: Phaser.GameObjects.BitmapText;

  constructor() {
    super(SCENES.modeSelect);
  }

  create(): void {
    fadeIn(this);
    playMusic(SELECT_MUSIC);
    this.heading = addCenteredPixelText(this, HEADING_Y, '', { color: COLORS.title, scale: 2 });
    this.showModes();
  }

  override update(): void {
    this.menu?.update();
  }

  private showModes(): void {
    setCenteredPixelText(this.heading, 'SELECT MODE');
    this.swapMenu(
      MODES.map(({ mode, label }) => ({ label, onSelect: () => this.choose(mode) })),
      () => fadeToScene(this, SCENES.title),
    );
  }

  /**
   * VS CPU only: how well the opponent plays, then on to the fighters. It opens on the
   * difficulty the options screen holds, and a different choice here becomes the new one, so
   * there is one setting rather than two that can disagree.
   */
  private showLevels(): void {
    setCenteredPixelText(this.heading, 'DIFFICULTY');
    this.swapMenu(
      LEVELS.map(({ level, label }) => ({ label, onSelect: () => this.start('solo', level) })),
      () => this.showModes(),
      CPU_LEVEL_CHOICES.indexOf(settings().cpuLevel),
    );
  }

  private choose(mode: GameMode): void {
    if (mode === 'solo') {
      this.showLevels();
      return;
    }
    this.start(mode, settings().cpuLevel);
  }

  private start(mode: GameMode, cpuLevel: ChosenCpuLevel): void {
    changeSettings({ cpuLevel });
    // The options screen decides how long rounds are and how many of them make a match.
    const setup: MatchSetup = { ...DEFAULT_MATCH, mode, cpuLevel, rules: matchRules() };
    fadeToScene(this, SCENES.characterSelect, setup);
  }

  /** Replaces the menu on screen, since a menu draws its own text and cannot be refilled. */
  private swapMenu(
    items: readonly { label: string; onSelect: () => void }[],
    onCancel: () => void,
    startIndex = 0,
  ): void {
    this.menu?.destroy();
    this.menu = new Menu(this, items, {
      y: MENU_Y,
      startIndex,
      color: COLORS.muted,
      selectedColor: COLORS.title,
      onMove: () => playSound(SOUNDS.menuMove),
      onConfirm: () => playSound(SOUNDS.confirm),
      onCancel: () => {
        playSound(SOUNDS.back);
        onCancel();
      },
    });
  }
}
