import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { ActionInput } from '@shared/phaser/actionInput';
import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText, addPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { ARENA, COLORS, PLAYER_CONTROLS, RESCUE, TIMING, type PlayerAction } from '../config';
import { AREAS, areaAt } from '../content/areas/areas';
import { HERO_FIGHTER } from '../content/fighters/heroFighter';
import { TITLE_MUSIC } from '../content/music';
import { RESCUE_TEXT } from '../content/rescue';
import { SOUNDS } from '../content/sounds';
import { GORRAN_SHEET } from '../content/sprites/gorran';
import { HERO_ANIMATIONS } from '../content/sprites/hero';
import { MEI_ANIMATIONS, MEI_SHEET } from '../content/sprites/mei';
import { TORCH_ANIMATIONS, TORCH_SHEET } from '../content/sprites/torch';
import { Cage } from '../entities/Cage';
import { Fighter } from '../entities/Fighter';
import { addFighterSounds } from '../systems/fighterSounds';
import { readPlayerIntent } from '../systems/playerControls';
import type { GameOverSceneData } from './GameOverScene';
import type { PauseSceneData } from './PauseScene';
import { SCENES } from './sceneKeys';

const LABEL_Y = 28;
const HINT_Y = 128;
/** Just above the cage, roughly over its middle. */
const NAME_X = 232;
const NAME_Y = 94;

/** `breakingOut` while the bars stand, `freed` once Mei is out, `ending` while it plays out. */
type Phase = 'breakingOut' | 'freed' | 'ending';

/**
 * The ending. Gorran is down and Mei is caged behind his throne: Kenji beats the bars off her
 * and then has to cross the last few steps to reach her.
 *
 * Those steps are the whole point. He has spent the night fighting his way up the mountain, and
 * Mei has spent it among men who did the same. If he comes at her with his fists still up she
 * answers the way she has had to answer all night, and that is the end of him. Dropping the
 * fighting stance is the one thing the game never asks for until now.
 */
export class RescueScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private controls!: ActionInput<PlayerAction>;
  private hero!: Fighter;
  private mei!: Phaser.GameObjects.Sprite;
  private cage!: Cage;
  private hint!: Phaser.GameObjects.BitmapText;
  private nameLabel!: Phaser.GameObjects.BitmapText;
  /** The line on screen now, kept so a new one replaces it instead of printing over it. */
  private label: Phaser.GameObjects.BitmapText | null = null;
  private phase: Phase = 'breakingOut';

  constructor() {
    super(SCENES.rescue);
  }

  create(): void {
    fadeIn(this);
    this.phase = 'breakingOut';
    this.label = null;
    // Back to the theme from the title screen, now that the fighting is over.
    playMusic(TITLE_MUSIC);

    const throneRoom = areaAt(AREAS.length - 1);
    throneRoom.paint(this.add.graphics());
    throneRoom.torches.forEach(([x, y]) => {
      this.add.sprite(x, y, TORCH_SHEET.key).setOrigin(0.5, 1).play(TORCH_ANIMATIONS.burn.key);
    });

    // Gorran, face down where the fight left him.
    this.add.sprite(RESCUE.gorranX, ARENA.groundY, GORRAN_SHEET.key).setOrigin(0.5, 1).setFrame('lying');

    // Hands on the bars, facing the way he will come in.
    this.mei = this.add
      .sprite(RESCUE.cagedMeiX, ARENA.groundY, MEI_SHEET.key)
      .setOrigin(0.5, 1)
      .setFlipX(true)
      .setFrame('caged');
    this.cage = new Cage(this);
    this.nameLabel = addPixelText(this, NAME_X, NAME_Y, RESCUE_TEXT.name, { color: COLORS.text });

    this.controls = new ActionInput(this, PLAYER_CONTROLS);
    // He arrives straight from the fight, so his fists are already up.
    this.hero = new Fighter(this, RESCUE.heroStartX, ARENA.groundY, HERO_FIGHTER, { stance: 'fighting' });
    addFighterSounds(this.hero);

    this.showLabel(RESCUE_TEXT.caged);
    // `blink` owns the hint's `visible` flag, so it is shown and hidden with alpha instead.
    this.hint = addCenteredPixelText(this, HINT_Y, RESCUE_TEXT.hint, { color: COLORS.muted }).setAlpha(0);
    blink(this, this.hint, TIMING.promptBlinkMs);
  }

  override update(_time: number, deltaMs: number): void {
    if (this.phase === 'ending') return;

    this.controls.update();
    if (this.controls.justPressed('pause')) {
      const data: PauseSceneData = { pausedScene: SCENES.rescue };
      this.scene.pause();
      this.scene.launch(SCENES.pause, data);
      return;
    }
    this.hero.step(readPlayerIntent(this.controls), deltaMs);

    if (this.phase === 'breakingOut') {
      this.cage.update(deltaMs);
      this.keepClearOfTheBars();
      this.strikeTheBars();
      return;
    }
    this.checkApproach();
  }

  /** Standing iron is solid, so he cannot simply walk through it to reach her. */
  private keepClearOfTheBars(): void {
    const limit = RESCUE.cage.left - RESCUE.barrierGap;
    if (this.hero.x > limit) this.hero.pushBy(limit - this.hero.x);

    this.hint.setAlpha(this.hero.x > limit - RESCUE.hintDistance ? 1 : 0);
  }

  private strikeTheBars(): void {
    const blow = this.hero.activeHitbox();
    if (!blow || !Phaser.Geom.Intersects.RectangleToRectangle(blow, this.cage.area())) return;

    this.hero.markAttackLanded();
    const broken = this.cage.hit();
    playSound(broken ? SOUNDS.cageBreak : SOUNDS.cageHit);
    if (broken) this.freeMei();
  }

  private freeMei(): void {
    this.phase = 'freed';
    this.hint.setAlpha(0);
    this.showLabel(RESCUE_TEXT.barsBreak);

    this.nameLabel.setAlpha(0);
    // She steps clear of the wreck and simply stands there. Nothing about her is a threat.
    this.mei.play(MEI_ANIMATIONS.walk.key);
    this.tweens.add({
      targets: this.mei,
      x: RESCUE.freeMeiX,
      duration: RESCUE.meiStepOutMs,
      onComplete: () => this.mei.play(MEI_ANIMATIONS.stand.key),
    });
  }

  private checkApproach(): void {
    if (Math.abs(this.hero.x - this.mei.x) > RESCUE.meetDistance) return;

    if (this.hero.stance === 'fighting') this.playMistake();
    else this.playRescue();
  }

  /** Fists up, and she puts him down like everyone else who came at her tonight. */
  private playMistake(): void {
    this.phase = 'ending';
    // Her hands go up first. She is frightened of him, not fighting him.
    this.mei.anims.stop();
    this.mei.setFrame('shield');

    this.time.delayedCall(RESCUE.flinchMs, () => {
      this.mei.setFrame('kickHigh');
      this.hero.takeHit({ damage: Number.POSITIVE_INFINITY, knockbackSpeed: 0, stunMs: 0 });
      this.tweens.add({
        targets: this.hero,
        x: `-=${RESCUE.stumbleDistance}`,
        duration: RESCUE.stumbleMs,
      });
      this.showLabel(RESCUE_TEXT.bad, COLORS.danger);
    });

    // Nothing warned him beforehand, so the game over screen explains what went wrong, and
    // continuing returns to the cage rather than to the fortress he has already cleared.
    const data: GameOverSceneData = { continueScene: SCENES.rescue, reason: RESCUE_TEXT.deathReason };
    this.time.delayedCall(RESCUE.badEndingMs, () => fadeToScene(this, SCENES.gameOver, data));
  }

  /** Hands down, so she knows him, and they go back down the mountain together. */
  private playRescue(): void {
    this.phase = 'ending';
    this.mei.play(MEI_ANIMATIONS.stand.key);
    this.hero.play(HERO_ANIMATIONS.stand.key);
    this.showLabel(RESCUE_TEXT.good, COLORS.success);

    this.time.delayedCall(RESCUE.walkOutDelayMs, () => {
      this.mei.setFlipX(true).play(MEI_ANIMATIONS.walk.key);
      this.hero.setFlipX(true).play(HERO_ANIMATIONS.run.key);
      this.tweens.add({
        targets: [this.hero, this.mei],
        x: `-=${RESCUE.walkOutDistance}`,
        duration: RESCUE.walkOutMs,
      });
    });
    this.time.delayedCall(RESCUE.goodEndingMs, () => fadeToScene(this, SCENES.victory));
  }

  private showLabel(text: string, color: number = COLORS.title): void {
    this.label?.destroy();

    const label = addCenteredPixelText(this, LABEL_Y, text, { color });
    this.label = label;
    this.tweens.add({ targets: label, alpha: 0, delay: RESCUE.labelShowMs, duration: RESCUE.labelFadeMs });
  }
}
