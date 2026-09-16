import * as Phaser from 'phaser';

import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, KEYS, PROLOGUE, VILLAGE } from '../config';
import { VILLAGE_STORY } from '../content/prologue';
import { FIRE_ANIMATIONS, FIRE_SHEET } from '../content/sprites/fire';
import { HERO_ANIMATIONS, HERO_SHEET } from '../content/sprites/hero';
import { FIRE_SPOTS, paintVillage, SMOKE_SPOTS } from '../content/village';
import type { AreaSceneData } from './AreaScene';
import { StoryTextBox } from './hud/StoryTextBox';
import { SCENES } from './sceneKeys';

const HERO_START_X = -24;
const SMOKE_RADIUS = 9;
const SMOKE_ALPHA = 0.3;
const SMOKE_RISE = 60;
/** Embers rise from the fires along the ruins. */
const EMBER_MIN_X = 40;
const EMBER_MAX_X = 280;
const EMBER_MIN_RISE = 40;
const EMBER_MAX_RISE = 90;
const EMBER_MIN_MS = 1800;
const EMBER_MAX_MS = 3200;

/** Kenji comes home to the burning village, too late, and sets off up the mountain. */
export class PrologueScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private textBox!: StoryTextBox;

  constructor() {
    super(SCENES.prologue);
  }

  create(): void {
    fadeIn(this);
    paintVillage(this.add.graphics(), 'burnt');

    this.addFires();
    this.addSmoke();
    this.addEmbers();
    this.addHero();

    this.textBox = new StoryTextBox(this, VILLAGE_STORY.title, VILLAGE_STORY.lines);
    onKeyPress(this, KEYS.confirm, () => {
      if (this.textBox.requestAdvance()) this.startClimb();
    });
    onKeyPress(this, KEYS.skip, () => this.startClimb());
  }

  override update(_time: number, deltaMs: number): void {
    this.textBox.update(deltaMs);
  }

  private startClimb(): void {
    const data: AreaSceneData = { areaIndex: 0 };
    fadeToScene(this, SCENES.story, data);
  }

  private addFires(): void {
    FIRE_SPOTS.forEach(([x, scale], index) => {
      this.add
        .sprite(x, VILLAGE.groundY, FIRE_SHEET.key)
        .setOrigin(0.5, 1)
        .setScale(scale)
        // Different starting frames, so the fires do not flicker in step with each other.
        .play({ key: FIRE_ANIMATIONS.burn.key, startFrame: index % FIRE_ANIMATIONS.burn.frames.length });
    });
  }

  private addSmoke(): void {
    SMOKE_SPOTS.forEach(([x, y], index) => {
      const puff = this.add.circle(x, y, SMOKE_RADIUS, COLORS.smoke, SMOKE_ALPHA);
      this.tweens.add({
        targets: puff,
        y: y - SMOKE_RISE,
        alpha: 0,
        duration: VILLAGE.smokeRiseMs,
        delay: index * VILLAGE.smokeDelayMs,
        repeat: -1,
      });
    });
  }

  private addEmbers(): void {
    for (let index = 0; index < VILLAGE.emberCount; index++) {
      const x = Phaser.Math.Between(EMBER_MIN_X, EMBER_MAX_X);
      const ember = this.add.rectangle(x, VILLAGE.groundY - 4, 1, 1, COLORS.ember);

      this.tweens.add({
        targets: ember,
        y: VILLAGE.groundY - Phaser.Math.Between(EMBER_MIN_RISE, EMBER_MAX_RISE),
        alpha: 0,
        duration: Phaser.Math.Between(EMBER_MIN_MS, EMBER_MAX_MS),
        delay: index * VILLAGE.emberDelayMs,
        repeat: -1,
      });
    }
  }

  private addHero(): void {
    const hero = this.add
      .sprite(HERO_START_X, VILLAGE.groundY, HERO_SHEET.key)
      .setOrigin(0.5, 1)
      .play(HERO_ANIMATIONS.run.key);

    this.tweens.add({
      targets: hero,
      x: PROLOGUE.heroStopX,
      duration: PROLOGUE.heroRunMs,
      onComplete: () => hero.play(HERO_ANIMATIONS.stand.key),
    });
  }
}
