import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu, type MenuItem } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, LEVEL, SCREEN } from '../config';
import { LEVEL_IDS } from '../content/levels/levelOrder';
import { TITLE_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { TILES_SHEET } from '../content/sprites/tiles';
import { RUSTY_LOOKS } from '../entities/Rusty';
import { firstLevelOf, savedWorld } from '../systems/continuePoint';
import { newRun } from '../systems/runState';
import { SCENES } from './sceneKeys';
import type { WorldIntroData } from './WorldIntroScene';

const LOGO_Y = 26;
const SUBTITLE_Y = 50;
const MENU_Y = 74;
/** The street along the bottom, with a pipe at each side and Rusty in the middle. */
const STREET_TOP = SCREEN.height - LEVEL.tileSize;
const PIPE_INSET = 24;
const PIPE_TILES_TALL = 2;

/**
 * The title: the logo, a street with Rusty on it, and the menu. Continue appears once a world
 * past the first has been reached, even in an earlier visit.
 */
export class TitleScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.title);
  }

  create(): void {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(COLORS.screen);
    playMusic(TITLE_MUSIC);

    addCenteredPixelText(this, LOGO_Y, 'PIXEL PLUMBER', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, SUBTITLE_Y, 'THE PIPES OF BRASSWICK', { color: COLORS.muted });
    this.addStreet();

    const items: MenuItem[] = [];
    const world = savedWorld();
    const continueFrom = world && firstLevelOf(world);
    if (world && continueFrom) {
      items.push({ label: `CONTINUE WORLD ${world}`, onSelect: () => this.start(LEVEL_IDS.indexOf(continueFrom)) });
    }
    items.push(
      { label: 'NEW GAME', onSelect: () => this.start(0) },
      { label: 'CONTROLS', onSelect: () => fadeToScene(this, SCENES.controls) },
    );
    this.menu = new Menu(this, items, {
      y: MENU_Y,
      color: COLORS.muted,
      selectedColor: COLORS.title,
      onMove: () => playSound(SOUNDS.menuMove),
      onConfirm: () => playSound(SOUNDS.confirm),
    });
  }

  override update(): void {
    this.menu.update();
  }

  /** A fresh run from the first level of a world, opening with that world's story. */
  private start(levelIndex: number): void {
    const intro: WorldIntroData = { ...newRun(levelIndex), story: true };
    fadeToScene(this, SCENES.worldIntro, intro);
  }

  /** Cobbles along the bottom, a brass pipe at each side, and Rusty between them. */
  private addStreet(): void {
    for (let x = 0; x < SCREEN.width; x += LEVEL.tileSize) {
      this.add.image(x, STREET_TOP, TILES_SHEET.key, 'ground').setOrigin(0, 0);
    }
    for (const left of [PIPE_INSET, SCREEN.width - PIPE_INSET - LEVEL.tileSize * 2]) {
      for (let row = 0; row < PIPE_TILES_TALL; row++) {
        const y = STREET_TOP - (PIPE_TILES_TALL - row) * LEVEL.tileSize;
        const [leftFrame, rightFrame] = row === 0 ? ['pipeTopLeft', 'pipeTopRight'] : ['pipeBodyLeft', 'pipeBodyRight'];
        this.add.image(left, y, TILES_SHEET.key, leftFrame).setOrigin(0, 0);
        this.add.image(left + LEVEL.tileSize, y, TILES_SHEET.key, rightFrame).setOrigin(0, 0);
      }
    }
    const look = RUSTY_LOOKS.big;
    this.add.sprite(SCREEN.width / 2, STREET_TOP, look.texture).setOrigin(0.5, 1).play(look.poses.stand);
  }
}
