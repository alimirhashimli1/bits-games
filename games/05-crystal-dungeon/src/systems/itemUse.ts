import * as Phaser from 'phaser';

import { BOMB, DEPTHS, LANTERN, MOONRANG, ROOM } from '../config';
import { FLAME_ANIMATIONS, FLAME_SHEET } from '../content/sprites/effects';
import { blastAt, Bomb } from '../entities/Bomb';
import type { Enemy } from '../entities/enemies/Enemy';
import { Moonrang } from '../entities/Moonrang';
import type { Wren } from '../entities/Wren';
import { centreOf, knockbackAway, overlaps } from './combat';
import { FACING_VECTORS } from './facing';
import type { Fight } from './fight';
import type { GameState } from './gameState';
import type { ItemKind } from './items';

const ROOM_WIDTH = ROOM.columns * ROOM.tileSize;
const ROOM_HEIGHT = ROOM.rows * ROOM.tileSize;

/** What the Moonrang brings back. Heart containers, bombs and dungeon treasures stay where they lie. */
const FETCHABLE = new Set(['gem', 'heart', 'key']);

export interface ItemHooks {
  /** Whether a room pixel is on a solid tile. */
  readonly isSolidAt: (x: number, y: number) => boolean;
  /** A bomb went off at (x, y): open whatever cracked walls are within \`radius\`. */
  readonly onBlast: (x: number, y: number, radius: number) => void;
  /** The Lantern's flame burns at (x, y): light a dark room, or a torch there. */
  readonly onLight: (x: number, y: number) => void;
  /** Her bombs changed: the HUD needs redrawing. */
  readonly onStateChanged: () => void;
}

/**
 * Wren's items in use on the screen on show: the Moonrang in flight, bombs set down, and the
 * Lantern's flame. The World scene decides when she uses one; this does what it does.
 */
export class ItemUse {
  private moonrang: Moonrang | null = null;
  /** Enemies the Moonrang has stunned this throw, so it stuns each one once. */
  private stunnedThisThrow = new Set<Enemy>();
  private bombs: Bomb[] = [];
  private flame: { readonly sprite: Phaser.GameObjects.Sprite; readonly until: number } | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly wren: Wren,
    private readonly fight: Fight,
    private readonly state: GameState,
    private readonly hooks: ItemHooks,
  ) {}

  /** Whether the item can be used now: one Moonrang out at a time, bombs while she has some, one flame at a time. */
  canUse(item: ItemKind): boolean {
    switch (item) {
      case 'moonrang':
        return this.moonrang === null;
      case 'bombs':
        return this.state.bombs > 0 && this.bombs.length < BOMB.maxOnScreen;
      case 'lantern':
        return this.flame === null;
    }
  }

  use(item: ItemKind, now: number): void {
    const { x, y } = FACING_VECTORS[this.wren.facing];
    switch (item) {
      case 'moonrang':
        this.moonrang = new Moonrang(this.scene, this.wren.x, this.wren.y, this.wren.facing);
        this.stunnedThisThrow.clear();
        break;
      case 'bombs':
        this.state.bombs -= 1;
        this.hooks.onStateChanged();
        this.bombs.push(new Bomb(this.scene, this.wren.x + x * BOMB.placeDistance, this.wren.y + y * BOMB.placeDistance, now));
        break;
      case 'lantern': {
        const flameX = this.wren.x + x * LANTERN.reach;
        const flameY = this.wren.y + y * LANTERN.reach;
        const sprite = this.scene.add.sprite(flameX, flameY, FLAME_SHEET.key).setDepth(DEPTHS.items).play(FLAME_ANIMATIONS.flicker.key);
        this.flame = { sprite, until: now + LANTERN.flameMs };
        this.hooks.onLight(flameX, flameY);
        break;
      }
    }
  }

  update(now: number, deltaMs: number): void {
    this.flyMoonrang(now, deltaMs);
    this.bombs = this.bombs.filter((bomb) => {
      if (!bomb.tick(now)) return true;
      this.explode(bomb, now);
      return false;
    });
    if (this.flame && now >= this.flame.until) {
      this.flame.sprite.destroy();
      this.flame = null;
    }
  }

  /** Takes everything off the screen, as the screen changes. A thrown Moonrang is back in her hand. */
  clear(): void {
    this.moonrang?.destroy();
    this.moonrang = null;
    this.bombs.forEach((bomb) => bomb.destroy());
    this.bombs = [];
    this.flame?.sprite.destroy();
    this.flame = null;
  }

  /**
   * Out: it turns back at anything solid, the room's edge, or an enemy (which it stuns). Out or
   * back, gems, hearts and keys it touches come along. Back at Wren, it is caught.
   */
  private flyMoonrang(now: number, deltaMs: number): void {
    const moonrang = this.moonrang;
    if (!moonrang) return;
    if (moonrang.fly(deltaMs, { x: this.wren.x, y: this.wren.y })) {
      moonrang.destroy();
      this.moonrang = null;
      return;
    }
    const box = moonrang.hitBox();
    if (!moonrang.isReturning) {
      const outside = moonrang.x < 0 || moonrang.y < 0 || moonrang.x > ROOM_WIDTH || moonrang.y > ROOM_HEIGHT;
      if (outside || this.hooks.isSolidAt(moonrang.x, moonrang.y)) moonrang.turnBack();
      const struck = this.fight.enemiesOnScreen().filter((enemy) => !this.stunnedThisThrow.has(enemy) && overlaps(box, enemy.hurtBox()));
      struck.forEach((enemy) => {
        enemy.stun(now, MOONRANG.stunMs);
        this.stunnedThisThrow.add(enemy);
      });
      if (struck.length > 0) moonrang.turnBack();
    }
    this.fight
      .loosePickups()
      .filter((pickup) => FETCHABLE.has(pickup.drop.kind) && !moonrang.isCarrying(pickup) && overlaps(box, pickup.hitBox()))
      .forEach((pickup) => moonrang.carry(pickup));
  }

  /** Everything whose middle is within the blast is hurt, Wren too, and cracked walls within it open. */
  private explode(bomb: Bomb, now: number): void {
    const { x, y } = bomb;
    bomb.destroy();
    blastAt(this.scene, x, y);
    const within = (point: { readonly x: number; readonly y: number }): boolean =>
      Phaser.Math.Distance.Between(x, y, point.x, point.y) <= BOMB.radius;
    for (const enemy of this.fight.enemiesOnScreen()) {
      const middle = centreOf(enemy.hurtBox());
      if (within(middle)) this.fight.strike(enemy, BOMB.damage, knockbackAway({ x, y }, middle), now);
    }
    const wrenMiddle = centreOf(this.wren.hurtBox());
    if (within(wrenMiddle)) this.fight.hurtWren(BOMB.wrenDamage, knockbackAway({ x, y }, wrenMiddle), now);
    this.hooks.onBlast(x, y, BOMB.radius);
  }
}
