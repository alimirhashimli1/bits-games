import * as Phaser from 'phaser';

import { COMBAT, DEPTHS, DROPS } from '../config';
import { HEART_SHEET } from '../content/sprites/combat';
import { DUNGEON_ITEM_SHEET, ITEM_SHEET, KEY_SHEET } from '../content/sprites/items';
import { GEM_SHEET, HEART_CONTAINER_SHEET, type GemFrame } from '../content/sprites/pickups';
import type { Rect } from '../systems/combat';
import type { Drop } from '../systems/drops';

const GEM_FRAMES: Readonly<Record<number, GemFrame>> = { 1: 'green', 5: 'blue', 20: 'red' };

/** The texture and frame a pickup is drawn with. */
function lookOf(drop: Drop): readonly [string, string] {
  switch (drop.kind) {
    case 'heart':
      return [HEART_SHEET.key, 'full'];
    case 'gem':
      return [GEM_SHEET.key, GEM_FRAMES[drop.value] ?? 'green'];
    case 'key':
      return [KEY_SHEET.key, 'key'];
    case 'bombs':
      return [ITEM_SHEET.key, 'bombs'];
    case 'heartContainer':
      return [HEART_CONTAINER_SHEET.key, 'container'];
    case 'map':
    case 'compass':
    case 'bossKey':
      return [DUNGEON_ITEM_SHEET.key, drop.kind];
  }
}

/**
 * Something to pick up. One a defeated enemy left lies there for a while, blinks, and vanishes.
 * One placed in the room (it has an `id`) stays until it is taken, and is then gone for good.
 */
export class Pickup extends Phaser.GameObjects.Image {
  readonly drop: Drop;
  /** Only placed pickups have one: it is how the game remembers they were taken. */
  readonly id: string | undefined;
  private readonly droppedAt: number;
  /** Caught by the Moonrang: it no longer runs out, and shows steadily. */
  private held = false;

  constructor(scene: Phaser.Scene, x: number, y: number, drop: Drop, now: number, id?: string) {
    const [texture, frame] = lookOf(drop);
    super(scene, x, y, texture, frame);
    this.drop = drop;
    this.id = id;
    this.droppedAt = now;
    scene.add.existing(this);
    this.setDepth(DEPTHS.enemies);
  }

  /** Stops it running out, for as long as it lasts. */
  hold(): void {
    this.held = true;
    this.setVisible(true);
  }

  /** Blinks near the end of its time. Returns false once its time is up. Placed and held pickups never run out. */
  tick(now: number): boolean {
    if (this.id !== undefined || this.held) return true;
    const age = now - this.droppedAt;
    if (age >= DROPS.lifetimeMs) return false;
    this.setVisible(age < DROPS.blinkFromMs || Math.floor(now / COMBAT.blinkMs) % 2 === 0);
    return true;
  }

  hitBox(): Rect {
    return { x: this.x - DROPS.size / 2, y: this.y - DROPS.size / 2, width: DROPS.size, height: DROPS.size };
  }
}
