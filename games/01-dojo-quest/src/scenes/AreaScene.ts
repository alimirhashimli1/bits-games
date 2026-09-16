import * as Phaser from 'phaser';

import { playSound, type SoundSpec } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { blink } from '@shared/phaser/effects';
import { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, addPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { onKeyPress } from '@shared/phaser/sceneInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import {
  AREA,
  ARENA,
  BOSS,
  COLORS,
  COMBAT,
  GUARDS,
  KEYS,
  PLAYER_CONTROLS,
  SCREEN,
  type GuardRank,
  type PlayerAction,
} from '../config';
import { AREAS, areaAt, type AreaDefinition } from '../content/areas/areas';
import { BOSS_MUSIC, CLIMB_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { GORRAN_FIGHTER } from '../content/fighters/gorranFighter';
import { buildGuardFighter } from '../content/fighters/guardFighter';
import { HERO_FIGHTER } from '../content/fighters/heroFighter';
import { PIP_WIDTH } from '../content/sprites/hud';
import { TORCH_ANIMATIONS, TORCH_SHEET } from '../content/sprites/torch';
import { Fighter, type Stance } from '../entities/Fighter';
import { createHazard } from '../entities/hazards/createHazard';
import type { Hazard, HazardContext } from '../entities/hazards/Hazard';
import { BossBrain } from '../systems/bossAi';
import { addFighterSounds } from '../systems/fighterSounds';
import { keepApart, resolveAttack, type AttackOutcome } from '../systems/combat';
import { GuardBrain } from '../systems/guardAi';
import { HitboxDebugView } from '../systems/hitboxDebugView';
import { readPlayerIntent } from '../systems/playerControls';
import type { GameOverSceneData } from './GameOverScene';
import { HealthBar, type HealthBarOptions } from './hud/HealthBar';
import type { PauseSceneData } from './PauseScene';
import { SCENES } from './sceneKeys';

export interface AreaSceneData {
  /** Which area to show (index into AREAS). Defaults to the first area. */
  readonly areaIndex?: number;
  /** Kenji's health carried over from the previous area. Defaults to full. */
  readonly heroHealth?: number;
}

const STANCE_LABEL_Y = 8;
/** Longest stance name, so the centred label keeps the same width. */
const STANCE_NAME_LENGTH = 8;
const AREA_NAME_Y = 24;
const BOSS_NAME_Y = 32;
const OUTCOME_LABEL_Y = 40;
const OUTCOME_LABEL_MS = 700;
const EXIT_HINT_X = SCREEN.width - 18;
const EXIT_HINT_Y = 128;

const HINT_TOP = 154;
const HINT_LINE_HEIGHT = 9;
const CONTROLS_HINT = ['ARROWS MOVE  SHIFT STANCE  Z PUNCH  X KICK  C BLOCK', 'UP/DOWN AIM   H HITBOXES'];

const HUD_Y = 172;
const HUD_MARGIN = 4;
const HERO_HEALTH_BAR: HealthBarOptions = { x: HUD_MARGIN, y: HUD_Y, color: COLORS.heroHealth, direction: 1 };
const GUARD_HEALTH_BAR: HealthBarOptions = {
  x: SCREEN.width - HUD_MARGIN - PIP_WIDTH,
  y: HUD_Y,
  color: COLORS.enemyHealth,
  direction: -1,
};

const OUTCOME_TEXT: Readonly<Record<AttackOutcome, string>> = {
  hit: 'HIT!',
  blocked: 'BLOCKED',
  knockout: 'KO!',
};

/** Every blow that lands passes through `showOutcome`, so this is the one place it needs a sound. */
const OUTCOME_SOUND: Readonly<Record<AttackOutcome, SoundSpec>> = {
  hit: SOUNDS.hit,
  blocked: SOUNDS.block,
  knockout: SOUNDS.knockout,
};

interface Opponent {
  readonly fighter: Fighter;
  readonly brain: GuardBrain;
  readonly healthBar: HealthBar;
}

/**
 * One screen of the fortress. Kenji enters on the left; once the area's guard is down,
 * walking off the right edge leads to the next area (or Victory after the last one).
 */
export class AreaScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private area!: AreaDefinition;
  private controls!: ActionInput<PlayerAction>;
  private hero!: Fighter;
  private heroHealthBar!: HealthBar;
  private hitboxView!: HitboxDebugView;
  private stanceLabel!: Phaser.GameObjects.BitmapText;
  private outcomeLabel!: Phaser.GameObjects.BitmapText;
  private exitHint!: Phaser.GameObjects.BitmapText;
  private opponent: Opponent | null = null;
  private hazards: readonly Hazard[] = [];
  private outcomeTimer: Phaser.Time.TimerEvent | null = null;
  private areaIndex = 0;
  private startingHeroHealth: number | undefined;
  private isLeaving = false;

  constructor() {
    super(SCENES.area);
  }

  init(data: AreaSceneData): void {
    this.areaIndex = Phaser.Math.Clamp(Math.floor(data.areaIndex ?? 0), 0, AREAS.length - 1);
    this.startingHeroHealth = data.heroHealth;
  }

  create(): void {
    fadeIn(this);
    this.area = areaAt(this.areaIndex);
    this.isLeaving = false;
    this.outcomeTimer = null;

    this.area.paint(this.add.graphics());
    this.area.torches.forEach(([x, y]) => {
      this.add.sprite(x, y, TORCH_SHEET.key).setOrigin(0.5, 1).play(TORCH_ANIMATIONS.burn.key);
    });

    playMusic(this.area.boss ? BOSS_MUSIC : CLIMB_MUSIC);

    this.controls = new ActionInput(this, PLAYER_CONTROLS);
    this.hero = new Fighter(this, AREA.heroEntryX, ARENA.groundY, HERO_FIGHTER, { health: this.startingHeroHealth });
    addFighterSounds(this.hero);
    this.heroHealthBar = new HealthBar(this, this.hero.health, HERO_HEALTH_BAR);
    this.opponent = this.area.boss ? this.spawnBoss() : this.area.guard ? this.spawnGuard(this.area.guard) : null;
    // Built after the fighters, so a diving hawk or a dropping gate passes in front of them.
    this.hazards = (this.area.hazards ?? []).map((placement) => createHazard(this, placement));
    this.hitboxView = new HitboxDebugView(this, false);
    this.addLabels();

    onKeyPress(this, KEYS.debugHitboxes, () => this.hitboxView.toggle());
    if (import.meta.env.DEV) {
      onKeyPress(this, KEYS.devDefeatGuard, () => {
        this.opponent?.fighter.takeHit({ damage: Number.POSITIVE_INFINITY, knockbackSpeed: 0, stunMs: 0 });
      });
    }
  }

  override update(_time: number, deltaMs: number): void {
    this.controls.update();
    if (this.controls.justPressed('pause')) {
      this.pauseGame();
      return;
    }
    this.hero.step(readPlayerIntent(this.controls), deltaMs);
    if (this.opponent) this.fight(this.opponent, deltaMs);

    const isClear = this.isAreaClear();
    this.updateHazards(isClear, deltaMs);
    this.hero.health.regenerate(deltaMs, isClear);
    this.heroHealthBar.refresh();
    this.exitHint.setAlpha(isClear ? 1 : 0);

    this.hitboxView.draw(this.opponent ? [this.hero, this.opponent.fighter] : [this.hero], this.hazards);
    const text = stanceText(this.hero.stance);
    if (this.stanceLabel.text !== text) this.stanceLabel.setText(text);

    this.goToGameOverOnKnockout();
    this.leaveThroughRightEdge(isClear);
  }

  /** Freezes the fight and lays the pause menu over it. */
  private pauseGame(): void {
    const data: PauseSceneData = { pausedScene: SCENES.area };
    this.scene.pause();
    this.scene.launch(SCENES.pause, data);
  }

  private spawnGuard(rank: GuardRank): Opponent {
    const fighter = new Fighter(this, AREA.guardStartX, ARENA.groundY, buildGuardFighter(rank), {
      stance: 'fighting',
      facing: -1,
    });
    addFighterSounds(fighter);
    return {
      fighter,
      brain: new GuardBrain(GUARDS[rank].tactics, fighter),
      healthBar: new HealthBar(this, fighter.health, GUARD_HEALTH_BAR),
    };
  }

  /** Warlord Gorran, who ends the climb. He fights in two gears, so his brain is his own. */
  private spawnBoss(): Opponent {
    const fighter = new Fighter(this, AREA.guardStartX, ARENA.groundY, GORRAN_FIGHTER, {
      stance: 'fighting',
      facing: -1,
    });
    addFighterSounds(fighter);
    return {
      fighter,
      brain: new BossBrain(BOSS.tactics, fighter),
      healthBar: new HealthBar(this, fighter.health, GUARD_HEALTH_BAR),
    };
  }

  private fight({ fighter: guard, brain, healthBar }: Opponent, deltaMs: number): void {
    guard.faceTowards(this.hero.x);
    guard.step(brain.think(guard, this.hero, deltaMs), deltaMs);
    keepApart(this.hero, guard, COMBAT.minSeparation);

    this.showOutcome(resolveAttack(this.hero, guard));
    this.showOutcome(resolveAttack(guard, this.hero));
    healthBar.refresh();
  }

  /** Hazards only stir once the guard is down, and settle again as soon as Kenji is on his way out. */
  private updateHazards(isClear: boolean, deltaMs: number): void {
    const context: HazardContext = { hero: this.hero, deltaMs, isAreaClear: isClear && !this.isLeaving };
    for (const hazard of this.hazards) this.showOutcome(hazard.update(context));
  }

  private isAreaClear(): boolean {
    return !this.opponent || this.opponent.fighter.isKnockedOut;
  }

  private goToGameOverOnKnockout(): void {
    if (this.isLeaving || !this.hero.isKnockedOut) return;

    this.isLeaving = true;
    // Continuing puts him back at the start of the area he fell in, not at the bottom of the mountain.
    const data: GameOverSceneData = { areaIndex: this.areaIndex };
    this.time.delayedCall(AREA.knockoutDelayMs, () => fadeToScene(this, SCENES.gameOver, data));
  }

  /** Once the area is clear, reaching the right edge moves on to the next area. */
  private leaveThroughRightEdge(isClear: boolean): void {
    if (this.isLeaving || !isClear || this.hero.x < ARENA.maxX) return;

    this.isLeaving = true;
    const nextIndex = this.areaIndex + 1;
    if (nextIndex >= AREAS.length) {
      // Gorran is down. All that is left is the cage behind his throne.
      fadeToScene(this, SCENES.rescue);
      return;
    }
    // Every new area begins with its story chapter, which then opens the area.
    const data: AreaSceneData = { areaIndex: nextIndex, heroHealth: this.hero.health.current };
    fadeToScene(this, SCENES.story, data);
  }

  private showOutcome(outcome: AttackOutcome | null): void {
    if (!outcome) return;

    playSound(OUTCOME_SOUND[outcome]);
    setCenteredPixelText(this.outcomeLabel, OUTCOME_TEXT[outcome]);
    this.outcomeLabel.setVisible(true);
    this.outcomeTimer?.remove();
    this.outcomeTimer = this.time.delayedCall(OUTCOME_LABEL_MS, () => this.outcomeLabel.setVisible(false));
  }

  private addLabels(): void {
    this.stanceLabel = addCenteredPixelText(this, STANCE_LABEL_Y, stanceText(this.hero.stance), {
      color: COLORS.muted,
    });

    const areaName = addCenteredPixelText(this, AREA_NAME_Y, this.area.name, { color: COLORS.title });
    this.tweens.add({ targets: areaName, alpha: 0, delay: AREA.nameShowMs, duration: AREA.nameFadeMs });

    if (this.area.boss) {
      const bossName = addCenteredPixelText(this, BOSS_NAME_Y, 'WARLORD GORRAN', { color: COLORS.danger });
      this.tweens.add({ targets: bossName, alpha: 0, delay: AREA.nameShowMs, duration: AREA.nameFadeMs });
    }

    this.outcomeLabel = addCenteredPixelText(this, OUTCOME_LABEL_Y, '', { color: COLORS.title, scale: 2 }).setVisible(
      false,
    );

    this.exitHint = addPixelText(this, EXIT_HINT_X, EXIT_HINT_Y, '>>', { color: COLORS.title }).setAlpha(0);
    blink(this, this.exitHint, AREA.exitHintBlinkMs);

    // The controls are explained once, in the first area, so later floors stay uncluttered.
    if (this.areaIndex === 0) {
      CONTROLS_HINT.forEach((line, index) => {
        addCenteredPixelText(this, HINT_TOP + index * HINT_LINE_HEIGHT, line, { color: COLORS.text });
      });
    }
  }
}

function stanceText(stance: Stance): string {
  return `STANCE: ${stance.toUpperCase().padEnd(STANCE_NAME_LENGTH)}`;
}
