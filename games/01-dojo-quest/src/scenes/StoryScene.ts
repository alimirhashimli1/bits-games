import * as Phaser from 'phaser';

import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { AREA, ARENA, COLORS, KEYS, SCREEN, STORY } from '../config';
import { AREAS, areaAt, type AreaDefinition } from '../content/areas/areas';
import { GUARD_ANIMATIONS, GUARD_SHEET } from '../content/sprites/guard';
import { HERO_ANIMATIONS, HERO_SHEET } from '../content/sprites/hero';
import { TORCH_ANIMATIONS, TORCH_SHEET } from '../content/sprites/torch';
import { chapterAt } from '../content/story';
import type { AreaSceneData } from './AreaScene';
import { StoryTextBox } from './hud/StoryTextBox';
import { SCENES } from './sceneKeys';

/** Darkens the area picture so the text stands out. */
const PICTURE_DIM_ALPHA = 0.45;
const HERO_START_X = -24;
const HERO_STOP_X = 90;

/**
 * The story chapter before an area: the area's own background as the picture, Kenji
 * running in, and the chapter text typed out. Enter shows all text, then continues;
 * Esc skips the chapter.
 */
export class StoryScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private textBox!: StoryTextBox;
  private areaIndex = 0;
  private heroHealth: number | undefined;

  constructor() {
    super(SCENES.story);
  }

  /** Receives the same data as the area it leads to, and passes it on. */
  init(data: AreaSceneData): void {
    this.areaIndex = Phaser.Math.Clamp(Math.floor(data.areaIndex ?? 0), 0, AREAS.length - 1);
    this.heroHealth = data.heroHealth;
  }

  create(): void {
    fadeIn(this);
    this.drawPicture(areaAt(this.areaIndex));

    const chapter = chapterAt(this.areaIndex);
    this.textBox = new StoryTextBox(this, chapter.title, chapter.lines);

    onKeyPress(this, KEYS.confirm, () => {
      if (this.textBox.requestAdvance()) this.continueToArea();
    });
    onKeyPress(this, KEYS.skip, () => this.continueToArea());
  }

  override update(_time: number, deltaMs: number): void {
    this.textBox.update(deltaMs);
  }

  private continueToArea(): void {
    const data: AreaSceneData = { areaIndex: this.areaIndex, heroHealth: this.heroHealth };
    fadeToScene(this, SCENES.area, data);
  }

  private drawPicture(area: AreaDefinition): void {
    area.paint(this.add.graphics());
    area.torches.forEach(([x, y]) => {
      this.add.sprite(x, y, TORCH_SHEET.key).setOrigin(0.5, 1).play(TORCH_ANIMATIONS.burn.key);
    });
    this.add.rectangle(0, 0, SCREEN.width, SCREEN.height, COLORS.background, PICTURE_DIM_ALPHA).setOrigin(0, 0);

    if (area.guard) {
      this.add
        .sprite(AREA.guardStartX, ARENA.groundY, GUARD_SHEET.key)
        .setOrigin(0.5, 1)
        .setFlipX(true)
        .play(GUARD_ANIMATIONS.fightIdle.key);
    }

    const hero = this.add
      .sprite(HERO_START_X, ARENA.groundY, HERO_SHEET.key)
      .setOrigin(0.5, 1)
      .play(HERO_ANIMATIONS.run.key);
    this.tweens.add({
      targets: hero,
      x: HERO_STOP_X,
      duration: STORY.heroRunMs,
      onComplete: () => hero.play(HERO_ANIMATIONS.stand.key),
    });
  }
}
