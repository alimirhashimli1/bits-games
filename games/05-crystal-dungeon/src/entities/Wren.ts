import * as Phaser from 'phaser';

import { COMBAT, DEPTHS, ITEM_USE, ROOM, WREN } from '../config';
import { WREN_ANIMATIONS, WREN_SHEET } from '../content/sprites/wren';
import { knockbackVelocity, rectAround, type Rect } from '../systems/combat';
import type { Facing } from '../systems/facing';
import { cornerSlide, nextFacing, walkVelocity, type SolidCheck, type Vector } from '../systems/playerMovement';
import type { Cell } from '../systems/worldMap';
import { Sword } from './Sword';

/**
 * - walking: steered by the player (standing still counts).
 * - swinging: rooted to the spot until the swing animation ends.
 * - knockedBack: pushed away by a hit, briefly out of the player's hands.
 * - defeated: spinning and falling. Nothing else happens to her.
 */
type WrenMode = 'walking' | 'swinging' | 'usingItem' | 'knockedBack' | 'defeated';

const SWING_KEYS = new Set(Object.values(WREN_ANIMATIONS.swing).map((animation) => animation.key));
/** Frames of the swing in which the sword is held out. */
const THRUST_FRAME_PREFIX = 'thrust-';

/**
 * Wren in the world: a physics sprite whose body covers only her feet. Each frame the scene
 * tells her which way the player is pushing, and she sets her velocity, facing and animation.
 */
export class Wren extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  readonly sword: Sword;
  private facingNow: Facing = 'down';
  private mode: WrenMode = 'walking';
  private knockedBackUntil = 0;
  private invincibleUntil = 0;
  private usingUntil = 0;
  /** Called on the first thrust frame of a swing: the moment the spark can be thrown. */
  private onThrust: (() => void) | null = null;

  constructor(scene: Phaser.Scene, cell: Cell) {
    super(scene, 0, 0, WREN_SHEET.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.sword = new Sword(scene);

    const { width, height, offsetX, offsetY } = WREN.body;
    this.body.setSize(width, height, false).setOffset(offsetX, offsetY);
    this.setCollideWorldBounds(true).setDepth(DEPTHS.wren);
    this.placeInCell(cell);
    this.play(WREN_ANIMATIONS.idle.down.key);

    // The swing animation times the sword: it is out exactly while a thrust frame shows.
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, this.onSwingFrame, this);
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.onAnimationComplete, this);
  }

  get facing(): Facing {
    return this.facingNow;
  }

  /** Only while walking (or standing) does she answer the controls. */
  get canAct(): boolean {
    return this.mode === 'walking';
  }

  get isDefeated(): boolean {
    return this.mode === 'defeated';
  }

  isInvincible(now: number): boolean {
    return now < this.invincibleUntil || this.mode === 'defeated';
  }

  /** What enemies hurt her by touching: most of her figure, not just the feet her physics body covers. */
  hurtBox(): Rect {
    return rectAround(this.x, this.y, WREN.hurtBox);
  }

  /**
   * Walks the way the player is pushing (-1, 0 or 1 on each axis). `justPressed` are the
   * directions pressed this frame, which decide her facing.
   */
  walk(direction: Vector, justPressed: readonly Facing[], isSolid: SolidCheck): void {
    this.facingNow = nextFacing(this.facingNow, direction, justPressed);

    const velocity = walkVelocity(direction, WREN.walkSpeed);
    const slide = cornerSlide(this.body, direction, isSolid, ROOM.tileSize, WREN.cornerSlideMargin);
    // A slide keeps her pushing forwards, which the corner stops, and moves her sideways round it.
    const sideways = slide * WREN.walkSpeed;
    if (slide === 0) this.body.setVelocity(velocity.x, velocity.y);
    else if (direction.x !== 0) this.body.setVelocity(velocity.x, sideways);
    else this.body.setVelocity(sideways, velocity.y);

    const moving = direction.x !== 0 || direction.y !== 0;
    const animations = moving ? WREN_ANIMATIONS.walk : WREN_ANIMATIONS.idle;
    this.play(animations[this.facingNow].key, true);
  }

  /** Swings the sword the way she faces. `onThrust` runs as the sword comes out. */
  swing(onThrust: () => void): void {
    this.mode = 'swinging';
    this.onThrust = onThrust;
    this.body.stop();
    this.play(WREN_ANIMATIONS.swing[this.facingNow].key);
  }

  /** Holds her item out the way she faces, rooted to the spot for a moment. `onUse` runs straight away. */
  useItem(now: number, onUse: () => void): void {
    this.mode = 'usingItem';
    this.usingUntil = now + ITEM_USE.poseMs;
    this.body.stop();
    this.play(WREN_ANIMATIONS.useItem[this.facingNow].key);
    onUse();
  }

  /** Knocked `direction` by a hit, then blinking and safe for a while. Her facing does not change. */
  knockBack(direction: Facing, now: number): void {
    this.endSwing();
    this.mode = 'knockedBack';
    this.knockedBackUntil = now + COMBAT.wrenKnockbackMs;
    this.invincibleUntil = now + COMBAT.wrenInvincibleMs;
    const velocity = knockbackVelocity(direction, COMBAT.wrenKnockbackSpeed);
    this.body.setVelocity(velocity.x, velocity.y);
    this.play(WREN_ANIMATIONS.hurt.key);
  }

  /** Spins and falls. `onDone` runs once she lies still. */
  defeat(onDone: () => void): void {
    this.endSwing();
    this.mode = 'defeated';
    this.body.stop();
    this.setVisible(true);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, onDone);
    this.play(WREN_ANIMATIONS.defeat.key);
  }

  /** Ends a knockback when its time is up, blinks while she cannot be hurt, and keeps the sword in her hands. */
  tick(now: number): void {
    const doneUsing = this.mode === 'usingItem' && now >= this.usingUntil;
    if ((this.mode === 'knockedBack' && now >= this.knockedBackUntil) || doneUsing) {
      this.mode = 'walking';
      this.body.stop();
      this.play(WREN_ANIMATIONS.idle[this.facingNow].key);
    }
    const blinking = this.mode !== 'defeated' && now < this.invincibleUntil;
    this.setVisible(!blinking || Math.floor(now / COMBAT.blinkMs) % 2 === 0);
    this.sword.follow(this.x, this.y);
  }

  /** Stands her with her feet in the middle of a cell: her body centred across it and resting on its bottom edge. */
  placeInCell({ column, row }: Cell): void {
    const { width, height, offsetX, offsetY } = WREN.body;
    const x = (column + 0.5) * ROOM.tileSize - (offsetX + width / 2) + this.width / 2;
    const y = (row + 1) * ROOM.tileSize - (offsetY + height) + this.height / 2;
    this.body.reset(x, y);
  }

  /** Turns her to face this way, standing still. */
  face(facing: Facing): void {
    this.facingNow = facing;
    this.play(WREN_ANIMATIONS.idle[facing].key);
  }

  /** Stops her where she is, keeping her animation, e.g. while the screen changes. */
  halt(): void {
    this.body.stop();
  }

  private onSwingFrame(_animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void {
    if (this.mode !== 'swinging') return;
    const thrusting = String(frame.textureFrame).startsWith(THRUST_FRAME_PREFIX);
    if (thrusting && !this.sword.visible) {
      this.sword.holdOut(this.facingNow, this.x, this.y);
      this.onThrust?.();
      this.onThrust = null;
    } else if (!thrusting) {
      this.sword.putAway();
    }
  }

  private onAnimationComplete(animation: Phaser.Animations.Animation): void {
    if (this.mode !== 'swinging' || !SWING_KEYS.has(animation.key)) return;
    this.endSwing();
    this.mode = 'walking';
    this.play(WREN_ANIMATIONS.idle[this.facingNow].key);
  }

  private endSwing(): void {
    this.sword.putAway();
    this.onThrust = null;
  }
}
