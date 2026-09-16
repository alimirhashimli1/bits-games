import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';

import { HAZARDS, SCREEN } from '../../config';
import { SOUNDS } from '../../content/sounds';
import { HAWK_ANIMATIONS, HAWK_SHEET } from '../../content/sprites/hawk';
import type { Fighter } from '../Fighter';
import type { Hazard, HazardContext, HazardOutcome } from './Hazard';

const SETTINGS = HAZARDS.hawk;

/** Where it waits between dives, clear of both edges of the screen. */
const OFF_LEFT = -24;
const OFF_RIGHT = SCREEN.width + 24;
/** High enough that a climbing hawk is gone. */
const OFF_TOP = -16;
/** Drawn in front of the fighters, below the debug overlay. */
const DEPTH = 50;

type Direction = -1 | 1;

type HawkState =
  | { readonly kind: 'waiting'; readonly untilMs: number }
  | { readonly kind: 'diving'; readonly direction: Direction; readonly targetX: number; readonly hasHit: boolean }
  | { readonly kind: 'fleeing'; readonly direction: Direction };

/**
 * A hawk that circles the fortress and swoops at Kenji's head.
 *
 * It aims the low point of its dive at wherever he stood when it launched, so the dive is
 * visible long before it arrives. There are two ways out: duck under a low guard and it
 * passes overhead, or strike it out of the air, which drives it off until the next dive.
 */
export class Hawk implements Hazard {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private state: HawkState = { kind: 'waiting', untilMs: SETTINGS.waitBeforeFirstDiveMs };
  /** Time spent acting, so a dive is only ever timed while the area is clear. */
  private elapsedMs = 0;

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add
      .sprite(OFF_RIGHT, SETTINGS.cruiseY, HAWK_SHEET.key)
      .setDepth(DEPTH)
      .play(HAWK_ANIMATIONS.fly.key);
  }

  update({ hero, deltaMs, isAreaClear }: HazardContext): HazardOutcome | null {
    if (!isAreaClear) return null;
    this.elapsedMs += deltaMs;

    const state = this.state;
    switch (state.kind) {
      case 'waiting':
        if (this.elapsedMs >= state.untilMs) this.startDive(hero);
        return null;
      case 'diving':
        return this.dive(state, hero, deltaMs);
      case 'fleeing':
        this.flee(state, deltaMs);
        return null;
    }
  }

  dangerZone(): Phaser.Geom.Rectangle | null {
    return this.state.kind === 'diving' ? this.body() : null;
  }

  /** It comes in from the far side of the screen, so it has a long run at him. */
  private startDive(hero: Fighter): void {
    const fromRight = hero.x < SCREEN.width / 2;
    const direction: Direction = fromRight ? -1 : 1;

    this.sprite.setPosition(fromRight ? OFF_RIGHT : OFF_LEFT, SETTINGS.cruiseY).setFlipX(direction < 0);
    this.state = { kind: 'diving', direction, targetX: hero.x, hasHit: false };
    playSound(SOUNDS.hawkCry);
  }

  private dive(
    state: Extract<HawkState, { kind: 'diving' }>,
    hero: Fighter,
    deltaMs: number,
  ): HazardOutcome | null {
    this.sprite.x += (state.direction * this.diveSpeed(state.targetX) * deltaMs) / 1000;
    this.sprite.y = this.swoopHeight(state.targetX);

    if (this.hasLeftTheScreen(state.direction)) {
      this.waitForNextDive();
      return null;
    }

    const body = this.body();
    // A punch or a kick knocks it out of the air.
    const strike = hero.activeHitbox();
    if (strike && Phaser.Geom.Intersects.RectangleToRectangle(strike, body)) {
      hero.markAttackLanded();
      this.state = { kind: 'fleeing', direction: state.direction };
      return 'hit';
    }

    if (state.hasHit) return null;
    // It flies at head height, so a low guard ducks it. The hurtbox covers the whole
    // body and cannot shrink, so ducking is a rule rather than a smaller target.
    if (hero.blockHeight === 'low') return null;

    const hurtbox = hero.hurtbox();
    if (!hurtbox || !Phaser.Geom.Intersects.RectangleToRectangle(body, hurtbox)) return null;

    this.state = { ...state, hasHit: true };
    hero.takeHit({
      damage: SETTINGS.damage,
      knockbackSpeed: state.direction * SETTINGS.knockbackSpeed,
      stunMs: SETTINGS.stunMs,
    });
    return hero.isKnockedOut ? 'knockout' : 'hit';
  }

  /** Struck: it climbs away in the direction it was already going. */
  private flee(state: Extract<HawkState, { kind: 'fleeing' }>, deltaMs: number): void {
    this.sprite.x += (state.direction * SETTINGS.speed * deltaMs) / 1000;
    this.sprite.y -= (SETTINGS.climbSpeed * deltaMs) / 1000;

    if (this.hasLeftTheScreen(state.direction) || this.sprite.y <= OFF_TOP) this.waitForNextDive();
  }

  /**
   * A smooth dip centred on the target, so it drops and climbs instead of turning corners.
   * It then holds striking height across the level stretch, which is what makes it possible
   * to meet it with a punch rather than only to duck.
   */
  private swoopHeight(targetX: number): number {
    const distanceOutsideLevel = Math.max(0, Math.abs(this.sprite.x - targetX) - SETTINGS.levelWidth);
    const closeness = 1 - Math.min(1, distanceOutsideLevel / SETTINGS.swoopWidth);
    const eased = closeness * closeness * (3 - 2 * closeness);
    return SETTINGS.cruiseY + (SETTINGS.strikeY - SETTINGS.cruiseY) * eased;
  }

  /** It flares, slowing to strike, across the level stretch: the warning that the blow is coming. */
  private diveSpeed(targetX: number): number {
    return Math.abs(this.sprite.x - targetX) <= SETTINGS.levelWidth ? SETTINGS.strikeSpeed : SETTINGS.speed;
  }

  private waitForNextDive(): void {
    this.state = { kind: 'waiting', untilMs: this.elapsedMs + SETTINGS.waitBetweenDivesMs };
  }

  private hasLeftTheScreen(direction: Direction): boolean {
    return direction < 0 ? this.sprite.x <= OFF_LEFT : this.sprite.x >= OFF_RIGHT;
  }

  private body(): Phaser.Geom.Rectangle {
    const { width, height } = SETTINGS.body;
    return new Phaser.Geom.Rectangle(
      Math.round(this.sprite.x - width / 2),
      Math.round(this.sprite.y - height / 2),
      width,
      height,
    );
  }
}
