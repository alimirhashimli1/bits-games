import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';

import { ARENA, HAZARDS } from '../../config';
import { SOUNDS } from '../../content/sounds';
import type { Fighter } from '../Fighter';
import type { GatePlacement, Hazard, HazardContext, HazardOutcome } from './Hazard';

const SETTINGS = HAZARDS.gate;

const IRON = 0x6f6f82;
const IRON_SHADE = 0x44445a;
const SPIKE = 0x9a9ab0;

/** How much of the raised gate still shows under the arch. */
const RAISED_LIP = 6;
/** Gaps in the grid of bars, in pixels. */
const BAR_SPACING = 8;
const RAIL_OFFSETS = [18, 48];
/**
 * Kenji's height (his hurtbox is 40 pixels tall): while the gap under the gate is at least
 * this tall he can still run under it, and below it the gate is a wall.
 */
const PASS_HEIGHT = 40;
/** Drawn in front of the fighters, below the debug overlay. */
const DEPTH = 50;

type GatePhase = 'open' | 'warning' | 'slamming' | 'shut' | 'rising';

const NEXT_PHASE: Readonly<Record<GatePhase, GatePhase>> = {
  open: 'warning',
  warning: 'slamming',
  slamming: 'shut',
  shut: 'rising',
  rising: 'open',
};

const PHASE_MS: Readonly<Record<GatePhase, number>> = {
  open: SETTINGS.openMs,
  warning: SETTINGS.warningMs,
  slamming: SETTINGS.slamMs,
  shut: SETTINGS.shutMs,
  rising: SETTINGS.riseMs,
};

/**
 * The outer portcullis: an iron grid that hangs in the gateway and drops on whatever is
 * under it. It rattles before every slam, so the timing can be learned, and while it is
 * lower than Kenji it will not let him past. The way through is to cross while it is up,
 * which at walking pace is not quite possible.
 */
export class Gate implements Hazard {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly left: number;
  private readonly width: number;
  private readonly openingTop: number;
  /** Full drop, from the underside of the arch to the floor. */
  private readonly height: number;
  private phase: GatePhase = 'open';
  private phaseMs = 0;
  /** One slam can only catch Kenji once. */
  private hasCrushed = false;

  constructor(scene: Phaser.Scene, { left, width, openingTop }: GatePlacement) {
    this.graphics = scene.add.graphics().setDepth(DEPTH);
    this.left = left;
    this.width = width;
    this.openingTop = openingTop;
    this.height = ARENA.groundY - openingTop;
    this.draw(this.raisedBottom, 0);
  }

  update({ hero, deltaMs, isAreaClear }: HazardContext): HazardOutcome | null {
    if (!isAreaClear) return null;

    this.advance(deltaMs);
    const bottomY = this.bottomY();
    this.draw(bottomY, this.rattle());

    const outcome = this.crush(hero, bottomY);
    this.blockPassage(hero, bottomY);
    return outcome;
  }

  dangerZone(): Phaser.Geom.Rectangle | null {
    return this.phase === 'slamming' ? this.solidArea(this.bottomY()) : null;
  }

  private get raisedBottom(): number {
    return this.openingTop + RAISED_LIP;
  }

  private advance(deltaMs: number): void {
    this.phaseMs += deltaMs;
    while (this.phaseMs >= PHASE_MS[this.phase]) {
      this.phaseMs -= PHASE_MS[this.phase];
      this.phase = NEXT_PHASE[this.phase];
      if (this.phase === 'slamming') {
        this.hasCrushed = false;
        playSound(SOUNDS.gateSlam);
      }
    }
  }

  /** Where the bottom edge of the gate is right now. */
  private bottomY(): number {
    switch (this.phase) {
      case 'open':
      case 'warning':
        return this.raisedBottom;
      case 'slamming':
        return Phaser.Math.Linear(this.raisedBottom, ARENA.groundY, this.phaseMs / PHASE_MS.slamming);
      case 'shut':
        return ARENA.groundY;
      case 'rising':
        return Phaser.Math.Linear(ARENA.groundY, this.raisedBottom, this.phaseMs / PHASE_MS.rising);
    }
  }

  /** The warning shudder before the slam. */
  private rattle(): number {
    if (this.phase !== 'warning') return 0;
    return Math.floor(this.phaseMs / SETTINGS.rattleMs) % 2 === 0 ? -SETTINGS.rattlePixels : SETTINGS.rattlePixels;
  }

  private crush(hero: Fighter, bottomY: number): HazardOutcome | null {
    // Only the falling gate hurts. Once it is down it is just a wall, and walking into
    // a wall should not cost Kenji a pip.
    if (this.phase !== 'slamming' || this.hasCrushed) return null;

    const solid = this.solidArea(bottomY);
    const hurtbox = hero.hurtbox();
    if (!solid || !hurtbox || !Phaser.Geom.Intersects.RectangleToRectangle(solid, hurtbox)) return null;

    this.hasCrushed = true;
    const pushOut = hero.x < this.left + this.width / 2 ? -1 : 1;
    hero.takeHit({
      damage: SETTINGS.damage,
      knockbackSpeed: pushOut * SETTINGS.knockbackSpeed,
      stunMs: SETTINGS.stunMs,
    });
    return hero.isKnockedOut ? 'knockout' : 'hit';
  }

  /** Iron is solid: once the gap is too low to run under, it turns Kenji back. */
  private blockPassage(hero: Fighter, bottomY: number): void {
    if (ARENA.groundY - bottomY >= PASS_HEIGHT) return;
    if (hero.x <= this.left || hero.x >= this.left + this.width) return;

    const nearerEdge = hero.x < this.left + this.width / 2 ? this.left : this.left + this.width;
    hero.pushBy(nearerEdge - hero.x);
  }

  /** The part of the gate inside the gateway, which is the part that can hurt and block. */
  private solidArea(bottomY: number): Phaser.Geom.Rectangle | null {
    const top = Math.max(bottomY - this.height, this.openingTop);
    const bottom = Math.min(bottomY, ARENA.groundY);
    if (bottom <= top) return null;
    return new Phaser.Geom.Rectangle(this.left, Math.round(top), this.width, Math.round(bottom - top));
  }

  /** Bars, cross rails and a toothed beam, drawn only where they are inside the gateway. */
  private draw(bottomY: number, rattleX: number): void {
    const top = bottomY - this.height;
    this.graphics.clear();

    for (let x = this.left + 3; x < this.left + this.width - 2; x += BAR_SPACING) {
      this.fillInsideOpening(IRON, x + rattleX, top, 2, this.height);
    }
    for (const offset of RAIL_OFFSETS) {
      this.fillInsideOpening(IRON_SHADE, this.left + rattleX, top + offset, this.width, 2);
    }
    this.fillInsideOpening(IRON_SHADE, this.left + rattleX, bottomY - 5, this.width, 4);
    for (let x = this.left + 2; x < this.left + this.width; x += BAR_SPACING) {
      this.fillInsideOpening(SPIKE, x + rattleX, bottomY - 2, 2, 2);
    }
  }

  /**
   * Draws a piece of the gate clipped to the gateway, so the raised part is hidden behind
   * the arch without needing a mask, which would blur at the game's whole-pixel zoom.
   */
  private fillInsideOpening(color: number, x: number, top: number, width: number, height: number): void {
    const clippedTop = Math.max(Math.round(top), this.openingTop);
    const clippedBottom = Math.min(Math.round(top + height), ARENA.groundY);
    if (clippedBottom <= clippedTop) return;

    this.graphics.fillStyle(color).fillRect(Math.round(x), clippedTop, width, clippedBottom - clippedTop);
  }
}
