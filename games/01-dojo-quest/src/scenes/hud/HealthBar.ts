import type * as Phaser from 'phaser';

import { HEALTH_PIP_SHEET, PIP_FRAME } from '../../content/sprites/hud';
import type { Health } from '../../entities/Health';

/** Distance between the left edges of neighbouring pips. */
const PIP_SPACING = 6;
const EMPTY_PIP_ALPHA = 0.45;
/** Drawn above the fighters and the floor. */
const HUD_DEPTH = 50;

export interface HealthBarOptions {
  /** Top-left corner of the first pip. */
  readonly x: number;
  readonly y: number;
  readonly color: number;
  /** Where the next pips go: 1 = to the right (hero), -1 = to the left (enemy). */
  readonly direction: 1 | -1;
}

/** A row of triangle pips showing a Health value. */
export class HealthBar {
  private readonly health: Health;
  private readonly pips: Phaser.GameObjects.Image[];
  private shownPips = -1;

  constructor(scene: Phaser.Scene, health: Health, { x, y, color, direction }: HealthBarOptions) {
    this.health = health;
    this.pips = Array.from({ length: health.max }, (_, index) =>
      scene.add
        .image(x + direction * index * PIP_SPACING, y, HEALTH_PIP_SHEET.key, PIP_FRAME.full)
        .setOrigin(0, 0)
        .setTint(color)
        .setDepth(HUD_DEPTH),
    );
    this.refresh();
  }

  /** Redraws the pips when the health value has changed. Call once per frame. */
  refresh(): void {
    const current = this.health.current;
    if (current === this.shownPips) return;
    this.shownPips = current;

    this.pips.forEach((pip, index) => {
      const isFull = index < current;
      pip.setFrame(isFull ? PIP_FRAME.full : PIP_FRAME.empty).setAlpha(isFull ? 1 : EMPTY_PIP_ALPHA);
    });
  }

  destroy(): void {
    this.pips.forEach((pip) => pip.destroy());
  }
}
