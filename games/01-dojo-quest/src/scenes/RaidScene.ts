import * as Phaser from 'phaser';

import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, KEYS, RAID, VILLAGE } from '../config';
import { RAID_STORY } from '../content/prologue';
import { FIRE_ANIMATIONS, FIRE_SHEET } from '../content/sprites/fire';
import { GUARD_ANIMATIONS, GUARD_SHEET } from '../content/sprites/guard';
import { MEI_ANIMATIONS, MEI_SHEET } from '../content/sprites/mei';
import { FIRE_SPOTS, paintVillage, SMOKE_SPOTS } from '../content/village';
import { StoryTextBox } from './hud/StoryTextBox';
import { SCENES } from './sceneKeys';

/** Where the raiders stop: right beside Mei, not at a polite distance. */
const RAIDER_STOPS = [RAID.meiX + 18, RAID.meiX + 40, RAID.meiX + 62];
/** How close the one who grabs her ends up. */
const SEIZE_GAP = 11;
const OFF_SCREEN_RIGHT = 400;
/** How far Mei jerks sideways while struggling. */
const STRUGGLE_SHAKE = 2;
const SMOKE_RADIUS = 9;
const SMOKE_ALPHA = 0.3;
const SMOKE_RISE = 60;

/**
 * The cold open: Gorran's men come down on the village, set it alight, seize Mei
 * and drag her away. It leads into the opening scene, where Kenji arrives too late.
 */
export class RaidScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private textBox!: StoryTextBox;

  constructor() {
    super(SCENES.raid);
  }

  create(): void {
    fadeIn(this);
    paintVillage(this.add.graphics(), 'intact');

    const mei = this.addMei();
    const raiders = this.addRaiders();
    this.lightTheFires();
    this.addSmoke();
    this.scheduleSeizure(mei, raiders);
    this.scheduleAbduction(mei, raiders);

    this.textBox = new StoryTextBox(this, RAID_STORY.title, RAID_STORY.lines);
    onKeyPress(this, KEYS.confirm, () => {
      if (this.textBox.requestAdvance()) this.showAftermath();
    });
    onKeyPress(this, KEYS.skip, () => this.showAftermath());
  }

  override update(_time: number, deltaMs: number): void {
    this.textBox.update(deltaMs);
  }

  private showAftermath(): void {
    fadeToScene(this, SCENES.prologue);
  }

  private addMei(): Phaser.GameObjects.Sprite {
    return this.add.sprite(RAID.meiX, VILLAGE.groundY, MEI_SHEET.key).setOrigin(0.5, 1).play(MEI_ANIMATIONS.stand.key);
  }

  /** The raiders run in from the right and crowd around Mei. */
  private addRaiders(): Phaser.GameObjects.Sprite[] {
    return RAIDER_STOPS.map((stopX, index) => {
      const raider = this.add
        .sprite(OFF_SCREEN_RIGHT + index * 30, VILLAGE.groundY, GUARD_SHEET.key)
        .setOrigin(0.5, 1)
        .setFlipX(true)
        .play(GUARD_ANIMATIONS.run.key);

      this.tweens.add({
        targets: raider,
        x: stopX,
        duration: RAID.raidersArriveMs,
        onComplete: () => raider.play(GUARD_ANIMATIONS.fightIdle.key),
      });
      return raider;
    });
  }

  /** The nearest raider lunges the last step and grabs her; Mei recoils and fights to get free. */
  private scheduleSeizure(mei: Phaser.GameObjects.Sprite, raiders: readonly Phaser.GameObjects.Sprite[]): void {
    this.time.delayedCall(RAID.seizeAtMs, () => {
      const grabber = raiders[0];
      if (grabber) {
        this.tweens.add({ targets: grabber, x: RAID.meiX + SEIZE_GAP, duration: RAID.seizeMs });
        this.showFrame(grabber, 'punchWindup');
      }

      this.showFrame(mei, 'hit');
      this.tweens.add({
        targets: mei,
        x: { from: RAID.meiX - STRUGGLE_SHAKE, to: RAID.meiX + STRUGGLE_SHAKE },
        duration: RAID.struggleShakeMs,
        yoyo: true,
        repeat: Math.round(RAID.struggleMs / (RAID.struggleShakeMs * 2)),
      });
    });
  }

  /** They march her off towards the cliffs; she is pulled along backwards, still facing the village. */
  private scheduleAbduction(mei: Phaser.GameObjects.Sprite, raiders: readonly Phaser.GameObjects.Sprite[]): void {
    this.time.delayedCall(RAID.abductionAtMs, () => {
      mei.setFlipX(true).play(MEI_ANIMATIONS.walk.key);
      raiders.forEach((raider) => raider.setFlipX(false).play(GUARD_ANIMATIONS.walk.key));

      this.tweens.add({
        targets: [mei, ...raiders],
        x: `+=${OFF_SCREEN_RIGHT - RAID.meiX}`,
        duration: RAID.abductionMs,
      });
    });
  }

  /** Shows one still frame from a fighter sheet (the attack and hit frames are not animations). */
  private showFrame(sprite: Phaser.GameObjects.Sprite, frame: string): void {
    sprite.anims.stop();
    sprite.setFrame(frame);
  }

  /** Fires catch one after another once the raiders reach the village. */
  private lightTheFires(): void {
    FIRE_SPOTS.forEach(([x, scale], index) => {
      const fire = this.add
        .sprite(x, VILLAGE.groundY, FIRE_SHEET.key)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setAlpha(0)
        .play({ key: FIRE_ANIMATIONS.burn.key, startFrame: index % FIRE_ANIMATIONS.burn.frames.length });

      this.tweens.add({
        targets: fire,
        alpha: 1,
        duration: RAID.fireFadeMs,
        delay: RAID.fireStartMs + index * RAID.fireDelayMs,
      });
    });
  }

  private addSmoke(): void {
    SMOKE_SPOTS.forEach(([x, y], index) => {
      const puff = this.add.circle(x, y, SMOKE_RADIUS, COLORS.smoke, 0);
      this.tweens.add({
        targets: puff,
        y: y - SMOKE_RISE,
        alpha: { from: SMOKE_ALPHA, to: 0 },
        duration: VILLAGE.smokeRiseMs,
        delay: RAID.fireStartMs + index * VILLAGE.smokeDelayMs,
        repeat: -1,
      });
    });
  }
}
