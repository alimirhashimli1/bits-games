import * as Phaser from 'phaser';

import { POWER, RUSTY_BODIES } from '../config';
import {
  RUSTY_BIG_ANIMATIONS,
  RUSTY_BIG_SHEET,
  RUSTY_SMALL_ANIMATIONS,
  RUSTY_SMALL_SHEET,
  RUSTY_STEAM_ANIMATIONS,
  RUSTY_STEAM_SHEET,
} from '../content/sprites/rusty';
import type { MovementPose, MovementResult } from '../systems/playerMovement';
import type { PowerState } from '../systems/powerState';

type BodyShape = keyof typeof RUSTY_BODIES;

type PoseAnimations = Readonly<Record<MovementPose, string>>;

/** Big and steam Rusty have a pose for everything movement asks for. */
function poseAnimations(animations: Readonly<Record<MovementPose, { readonly key: string }>>): PoseAnimations {
  return {
    stand: animations.stand.key,
    walk: animations.walk.key,
    run: animations.run.key,
    skid: animations.skid.key,
    jump: animations.jump.key,
    duck: animations.duck.key,
  };
}

/** Each power state's texture and pose animations. */
const LOOKS: Readonly<Record<PowerState, { readonly texture: string; readonly poses: PoseAnimations }>> = {
  small: {
    texture: RUSTY_SMALL_SHEET.key,
    // Small Rusty has no duck of his own, as in the original: he just stands.
    poses: poseAnimations({ ...RUSTY_SMALL_ANIMATIONS, duck: RUSTY_SMALL_ANIMATIONS.stand }),
  },
  big: { texture: RUSTY_BIG_SHEET.key, poses: poseAnimations(RUSTY_BIG_ANIMATIONS) },
  steam: { texture: RUSTY_STEAM_SHEET.key, poses: poseAnimations(RUSTY_STEAM_ANIMATIONS) },
};

/**
 * Rusty in the level: a physics sprite whose origin is at his feet, so changing size
 * or pose never moves where he stands.
 */
export class Rusty extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  private powerState: PowerState = 'small';
  private shape: BodyShape | undefined;
  private transforming = false;
  /** Game times (`scene.time.now`) until which he blinks after a hit, and shines with the Golden Gasket. */
  private hurtUntil = 0;
  private gasketUntil = 0;
  private tinted = false;

  constructor(scene: Phaser.Scene, feetX: number, feetY: number) {
    super(scene, feetX, feetY, RUSTY_SMALL_SHEET.key);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.applyShape('small');
  }

  get power(): PowerState {
    return this.powerState;
  }

  get isBig(): boolean {
    return this.powerState !== 'small';
  }

  /** True while growing, shrinking or changing colour. The game waits for him. */
  get isTransforming(): boolean {
    return this.transforming;
  }

  /** Nothing can hurt him: just after a hit, or while the Golden Gasket lasts. */
  get isInvincible(): boolean {
    return this.scene.time.now < this.hurtUntil || this.hasGasket;
  }

  get hasGasket(): boolean {
    return this.scene.time.now < this.gasketUntil;
  }

  /** 1 when he faces right, -1 when he faces left. */
  get facing(): 1 | -1 {
    return this.flipX ? -1 : 1;
  }

  /** Changes power state straight away, with no animation. */
  setPower(power: PowerState): void {
    this.powerState = power;
    this.setTexture(LOOKS[power].texture, 'stand');
    this.applyShape(power === 'small' ? 'small' : 'big');
  }

  /**
   * Changes power state the way the original console did: physics freezes while Rusty flickers
   * between his old and new look, then everything carries on.
   */
  transformTo(power: PowerState): void {
    const from = this.powerState;
    if (this.transforming || power === from) return;
    this.transforming = true;
    this.scene.physics.world.pause();
    const finish = () => {
      this.transforming = false;
      this.setPower(power);
      this.scene.physics.world.resume();
    };

    if (from === 'small' || power === 'small') {
      // Growing and shrinking flicker between sizes on the big sheet.
      this.play(power === 'small' ? RUSTY_BIG_ANIMATIONS.shrink.key : RUSTY_BIG_ANIMATIONS.grow.key);
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, finish);
      return;
    }

    // Big and steam Rusty are the same size, so only the colours flicker.
    this.anims.stop();
    const frame = this.frame.name;
    this.scene.time.addEvent({
      delay: POWER.flickerMs,
      repeat: POWER.flickerCount - 1,
      callback: () => {
        const showNew = this.texture.key === LOOKS[from].texture;
        this.setTexture(LOOKS[showNew ? power : from].texture, frame);
      },
    });
    this.scene.time.delayedCall(POWER.flickerMs * POWER.flickerCount, finish);
  }

  /** Starts the blinking after a hit, while nothing can hurt him. */
  startHurtInvincibility(): void {
    this.hurtUntil = this.scene.time.now + POWER.hurtInvincibleMs;
  }

  startGasket(): void {
    this.gasketUntil = this.scene.time.now + POWER.gasketMs;
  }

  /** Shows the pose chosen by movement, and fits the body to it. */
  showPose({ pose, facing }: MovementResult): void {
    this.setFlipX(facing < 0);
    this.play(LOOKS[this.powerState].poses[pose], true);
    if (this.isBig) this.applyShape(pose === 'duck' ? 'duck' : 'big');
  }

  /** Small Rusty's defeat pose. He stops blinking and shining. */
  showDefeat(): void {
    this.hurtUntil = 0;
    this.gasketUntil = 0;
    this.play(RUSTY_SMALL_ANIMATIONS.defeat.key);
  }

  protected override preUpdate(time: number, deltaMs: number): void {
    super.preUpdate(time, deltaMs);
    this.setVisible(time >= this.hurtUntil || Math.floor(time / POWER.hurtBlinkMs) % 2 === 0);
    this.showGasketShine(time);
  }

  /** Flashes through the gasket colours, more slowly once it is about to run out. */
  private showGasketShine(time: number): void {
    const msLeft = this.gasketUntil - time;
    if (msLeft <= 0) {
      if (this.tinted) this.clearTint();
      this.tinted = false;
      return;
    }
    const flashMs = msLeft < POWER.gasketWarningMs ? POWER.gasketWarningFlashMs : POWER.gasketFlashMs;
    const tints = POWER.gasketTints;
    this.setTint(tints[Math.floor(time / flashMs) % tints.length] ?? tints[0]);
    this.tinted = true;
  }

  private applyShape(shape: BodyShape): void {
    if (shape === this.shape) return;
    this.shape = shape;
    const { width, height, offsetX, offsetY } = RUSTY_BODIES[shape];
    this.body.setSize(width, height, false);
    this.body.setOffset(offsetX, offsetY);
  }
}
