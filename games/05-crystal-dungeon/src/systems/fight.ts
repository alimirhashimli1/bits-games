import type * as Phaser from 'phaser';

import { PEBBLE, ROOM, SPARK, SWORD } from '../config';
import type { Enemy, EnemySenses } from '../entities/enemies/Enemy';
import { createEnemy } from '../entities/enemies';
import { Pebble } from '../entities/Pebble';
import { Pickup } from '../entities/Pickup';
import { puffAt } from '../entities/Puff';
import { Spark } from '../entities/Spark';
import type { Wren } from '../entities/Wren';
import { middleOf, type Random } from './ai/gridWalk';
import { centreOf, knockbackAway, overlaps, shieldBlocks, type Rect } from './combat';
import { rollDrop } from './drops';
import type { EnemyKind } from './enemyKinds';
import { FACING_VECTORS, OPPOSITE_FACING, type Facing } from './facing';
import { canCarryBombs, canCollect, collectDrop, hasFullHealth, loseHealth, type GameState } from './gameState';
import type { Cell, HiddenSpot, RoomDefinition } from './worldMap';

const ROOM_WIDTH = ROOM.columns * ROOM.tileSize;
const ROOM_HEIGHT = ROOM.rows * ROOM.tileSize;
/** The spark starts this far in front of the middle of Wren's frame. */
const SPARK_START_DISTANCE = 12;

export interface FightHooks {
  /** Her health or something she carries changed: the HUD needs redrawing. */
  readonly onStateChanged: () => void;
  /** Her last half heart is gone. */
  readonly onWrenDefeated: () => void;
  /** Whether a room pixel is on a solid tile. */
  readonly isSolidAt: (x: number, y: number) => boolean;
  readonly random: Random;
}

/**
 * Everything that can hurt or be hurt on the screen on show: Wren's sword and spark against
 * the enemies, the enemies and their pebbles against Wren, and what defeated enemies drop. The
 * World scene owns the screen; this owns the fighting on it.
 */
export class Fight {
  /** Enemies on this screen. A physics group, so walls stop them and defeated ones leave it by themselves. */
  readonly enemies: Phaser.Physics.Arcade.Group;
  private spark: Spark | null = null;
  private pebbles: Pebble[] = [];
  private pickups: Pickup[] = [];
  /** Hidden spots on this screen still to be found. */
  private hidden: HiddenSpot[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly wren: Wren,
    private readonly state: GameState,
    private readonly hooks: FightHooks,
  ) {
    this.enemies = scene.physics.add.group({ collideWorldBounds: true });
  }

  /**
   * Puts a screen's enemies in place (unless `withEnemies` is false: a cleared dungeon room), and
   * the pickups placed in it that she has not taken yet, each in the middle of its cell.
   */
  populate(room: RoomDefinition, now: number, withEnemies: boolean): void {
    (withEnemies ? (room.enemies ?? []) : []).forEach(({ kind, column, row }) => {
      const { x, y } = middleOf({ column, row });
      this.addEnemy(kind, x, y);
    });
    (room.pickups ?? [])
      .filter(({ id }) => !this.state.collected.includes(id))
      .forEach(({ id, drop, column, row }) => {
        const { x, y } = middleOf({ column, row });
        this.pickups.push(new Pickup(this.scene, x, y, drop, now, id));
      });
    this.hidden = (room.hidden ?? []).filter(({ id }) => !this.state.collected.includes(id));
  }

  addEnemy(kind: EnemyKind, x: number, y: number): void {
    this.enemies.add(createEnemy(kind, this.scene, x, y));
  }

  /** A swing at full health throws a spark, one at a time. */
  throwSparkIfFull(): void {
    if (this.spark || !hasFullHealth(this.state)) return;
    const facing = this.wren.facing;
    const { x, y } = FACING_VECTORS[facing];
    this.spark = new Spark(this.scene, this.wren.x + x * SPARK_START_DISTANCE, this.wren.y + y * SPARK_START_DISTANCE, facing);
  }

  /** Takes health from Wren and knocks her `direction`, unless she is still blinking from the last hit. */
  hurtWren(damage: number, direction: Facing, now: number): void {
    if (this.wren.isInvincible(now)) return;
    const defeated = loseHealth(this.state, damage);
    this.hooks.onStateChanged();
    if (defeated) this.hooks.onWrenDefeated();
    else this.wren.knockBack(direction, now);
  }

  update(now: number, deltaMs: number): void {
    const senses: EnemySenses = {
      now,
      deltaMs,
      wren: { x: this.wren.x, y: this.wren.y },
      isOpen: (cell) => this.isOpen(cell),
      random: this.hooks.random,
      spitPebble: (x, y, direction) => this.pebbles.push(new Pebble(this.scene, x, y, direction)),
    };
    this.livingEnemies().forEach((enemy) => enemy.tick(senses));

    const reach = this.wren.sword.reach(this.wren.x, this.wren.y);
    if (reach) {
      this.livingEnemies()
        .filter((enemy) => enemy.canBeHit(now) && overlaps(reach, enemy.hurtBox()))
        .forEach((enemy) => this.hit(enemy, SWORD.damage, this.wren.facing, now));
      this.revealHidden(reach, now);
    }

    this.moveSpark(now, deltaMs);
    this.movePebbles(now, deltaMs);

    const wrenBox = this.wren.hurtBox();
    const toucher = this.livingEnemies().find((enemy) => enemy.contactDamage > 0 && overlaps(wrenBox, enemy.hurtBox()));
    if (toucher) this.hurtWren(toucher.contactDamage, knockbackAway(centreOf(toucher.hurtBox()), centreOf(wrenBox)), now);

    this.updatePickups(now);
  }

  /** How many enemies on this screen are still fighting. */
  get enemiesLeft(): number {
    return this.livingEnemies().length;
  }

  /** The enemies on this screen that are still fighting, for the Moonrang and bombs. */
  enemiesOnScreen(): Enemy[] {
    return this.livingEnemies();
  }

  /** Pickups lying on this screen, for the Moonrang to fetch. */
  loosePickups(): readonly Pickup[] {
    return this.pickups.filter((pickup) => pickup.active);
  }

  /** Hits an enemy with an item (a bomb): as a sword hit, it may be defeated and leave something. */
  strike(enemy: Enemy, damage: number, direction: Facing, now: number): void {
    if (enemy.canBeHit(now)) this.hit(enemy, damage, direction, now);
  }

  /** Removes every enemy, projectile and pickup, as the screen changes. */
  clear(): void {
    this.enemies.clear(true, true);
    this.spark?.destroy();
    this.spark = null;
    this.pebbles.forEach((pebble) => pebble.destroy());
    this.pebbles = [];
    this.pickups.forEach((pickup) => pickup.destroy());
    this.pickups = [];
    this.hidden = [];
  }

  /**
   * A sword striking a hidden spot's cell brings out what is hidden there, in a puff. Hidden by
   * something solid, such as a stump, it pops out into the cell on Wren's side, where she can reach it.
   */
  private revealHidden(reach: Rect, now: number): void {
    const struck = this.hidden.filter(({ column, row }) =>
      overlaps(reach, { x: column * ROOM.tileSize, y: row * ROOM.tileSize, width: ROOM.tileSize, height: ROOM.tileSize }),
    );
    const back = FACING_VECTORS[OPPOSITE_FACING[this.wren.facing]];
    for (const { id, drop, column, row } of struck) {
      const spot = middleOf({ column, row });
      const solid = this.hooks.isSolidAt(spot.x, spot.y);
      const { x, y } = solid ? middleOf({ column: column + back.x, row: row + back.y }) : spot;
      puffAt(this.scene, x, y);
      this.pickups.push(new Pickup(this.scene, x, y, drop, now, id));
    }
    this.hidden = this.hidden.filter((spot) => !struck.includes(spot));
  }

  /** Hits an enemy; if that was its last hit it goes up in a puff, perhaps leaving something behind. */
  private hit(enemy: Enemy, damage: number, direction: Facing, now: number): void {
    if (!enemy.takeHit(damage, direction, now)) return;
    const { x, y } = enemy;
    enemy.destroy();
    puffAt(this.scene, x, y);
    const drop = rollDrop(this.hooks.random, canCarryBombs(this.state));
    if (drop) this.pickups.push(new Pickup(this.scene, x, y, drop, now));
  }

  private moveSpark(now: number, deltaMs: number): void {
    const spark = this.spark;
    if (!spark) return;
    spark.fly(deltaMs);
    const target = this.livingEnemies().find((enemy) => enemy.canBeHit(now) && overlaps(spark.hitBox(), enemy.hurtBox()));
    if (target) this.hit(target, SPARK.damage, spark.direction, now);
    if (target || spark.isOutside(ROOM_WIDTH, ROOM_HEIGHT)) {
      spark.destroy();
      this.spark = null;
    }
  }

  /** Pebbles stop at anything solid or the room's edge. Reaching Wren, they hurt her, unless her shield is in the way. */
  private movePebbles(now: number, deltaMs: number): void {
    const wrenBox = this.wren.hurtBox();
    this.pebbles = this.pebbles.filter((pebble) => {
      pebble.fly(deltaMs);
      const gone = pebble.x < 0 || pebble.y < 0 || pebble.x > ROOM_WIDTH || pebble.y > ROOM_HEIGHT;
      const hitWren = !gone && overlaps(pebble.hitBox(), wrenBox);
      if (hitWren && !shieldBlocks(this.wren.facing, this.wren.canAct, pebble.direction)) {
        this.hurtWren(PEBBLE.damage, pebble.direction, now);
      }
      if (gone || hitWren || this.hooks.isSolidAt(pebble.x, pebble.y)) {
        pebble.destroy();
        return false;
      }
      return true;
    });
  }

  private updatePickups(now: number): void {
    const wrenBox = this.wren.hurtBox();
    this.pickups = this.pickups.filter((pickup) => {
      const collected = canCollect(this.state, pickup.drop) && overlaps(pickup.hitBox(), wrenBox);
      if (collected) {
        collectDrop(this.state, pickup.drop);
        if (pickup.id !== undefined) this.state.collected.push(pickup.id);
        this.hooks.onStateChanged();
      }
      if (collected || !pickup.tick(now)) {
        pickup.destroy();
        return false;
      }
      return true;
    });
  }

  /** Ground enemies walk only on open cells inside the room. */
  private isOpen({ column, row }: Cell): boolean {
    if (column < 0 || row < 0 || column >= ROOM.columns || row >= ROOM.rows) return false;
    const { x, y } = middleOf({ column, row });
    return !this.hooks.isSolidAt(x, y);
  }

  private livingEnemies(): Enemy[] {
    // Only enemies are ever added, through addEnemy().
    return (this.enemies.getChildren() as Enemy[]).filter((enemy) => enemy.alive);
  }
}
