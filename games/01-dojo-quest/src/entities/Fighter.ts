import * as Phaser from 'phaser';

import { COMBAT } from '../config';
import {
  attackPhaseAt,
  type AttackHeight,
  type AttackKind,
  type AttackMove,
  type AttackMoveSet,
  type AttackPhase,
  type BlockHeight,
  type Hitbox,
} from './fighterMoves';
import { Health, type HealthConfig } from './Health';

export type Stance = 'running' | 'fighting';
export type Facing = -1 | 1;

/** What a fighter wants to do this frame. Comes from the player's controls or enemy AI. */
export interface FighterIntent {
  /** -1 = move left, 0 = stay, 1 = move right. */
  readonly move: number;
  readonly toggleStance: boolean;
  /** Attack to start this frame. Only works in fighting stance. */
  readonly attack: { readonly kind: AttackKind; readonly height: AttackHeight } | null;
  /** Guard to hold this frame. Only works in fighting stance. */
  readonly block: BlockHeight | null;
}

export interface FighterConfig {
  readonly texture: string;
  /** Animation keys for each movement and reaction state. */
  readonly animations: {
    readonly stand: string;
    readonly run: string;
    readonly toFight: string;
    readonly toStand: string;
    readonly fightIdle: string;
    readonly walk: string;
    readonly hit: string;
    readonly fall: string;
  };
  readonly attacks: AttackMoveSet;
  /** Frames shown while holding a block. */
  readonly blockFrames: Readonly<Record<BlockHeight, string>>;
  /** The body area attacks can hit, relative to the feet while facing right. */
  readonly hurtbox: Hitbox;
  readonly health: HealthConfig;
  /** Speeds in pixels per second. */
  readonly runSpeed: number;
  readonly walkSpeed: number;
  /** The leftmost and rightmost x position the fighter may reach. */
  readonly minX: number;
  readonly maxX: number;
}

export interface FighterSpawn {
  readonly stance?: Stance;
  readonly facing?: Facing;
  /** Starting health in pips; defaults to full. */
  readonly health?: number;
}

export interface CurrentAttack {
  readonly move: AttackMove;
  readonly phase: AttackPhase;
  /** Increases with every attack, so two identical attacks in a row can be told apart. */
  readonly id: number;
}

export interface HitImpact {
  readonly damage: number;
  /** Signed sliding speed in pixels per second; positive pushes to the right. */
  readonly knockbackSpeed: number;
  readonly stunMs: number;
}

type FighterAction =
  | { readonly kind: 'free' }
  | { readonly kind: 'changingStance'; readonly to: Stance }
  | { readonly kind: 'blocking'; readonly height: BlockHeight }
  | {
      readonly kind: 'attacking';
      readonly id: number;
      readonly move: AttackMove;
      readonly startedAtMs: number;
      readonly hasLanded: boolean;
    }
  | { readonly kind: 'hurt'; readonly untilMs: number }
  | { readonly kind: 'knockedOut' };

const FREE: FighterAction = { kind: 'free' };

/**
 * What a fighter announces as it happens. The Fighter makes no sound of its own: scenes
 * listen for these and decide what, if anything, to play.
 */
export const FIGHTER_EVENT = {
  /** Carries the AttackKind that was thrown. */
  attack: 'fighter-attack',
  stanceChange: 'fighter-stance-change',
  footstep: 'fighter-footstep',
} as const;

/** How far a fighter travels between footfalls, so running sounds faster than walking. */
const STRIDE_PX = 10;

/**
 * A martial artist that walks, runs, switches stance, attacks, blocks and takes hits.
 *
 * Running stance is fast and turns to face the direction of travel. Fighting stance
 * is slow and keeps facing the same way, and is the only stance that can attack or
 * block. While attacking, the shown frame follows the attack phase, so the art and
 * the hitbox always match.
 */
export class Fighter extends Phaser.GameObjects.Sprite {
  readonly health: Health;
  private readonly config: FighterConfig;
  private currentStance: Stance;
  private action: FighterAction = FREE;
  /** Total time this fighter has been stepped; used to time attacks and stun. */
  private clockMs = 0;
  /** Signed sliding speed after a hit, in pixels per second. */
  private knockbackSpeed = 0;
  private attackCount = 0;
  /** Distance walked since the last footfall. */
  private strideProgressPx = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    groundY: number,
    config: FighterConfig,
    { stance = 'running', facing = 1, health }: FighterSpawn = {},
  ) {
    super(scene, x, groundY, config.texture);
    this.config = config;
    this.health = new Health(config.health, health);
    this.currentStance = stance;
    assertFramesExist(scene, config);

    this.setOrigin(0.5, 1).setFlipX(facing < 0);
    scene.add.existing(this);
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation: Phaser.Animations.Animation) => {
      this.finishStanceChange(animation.key);
    });
    this.play(stance === 'running' ? config.animations.stand : config.animations.fightIdle);
  }

  get stance(): Stance {
    return this.currentStance;
  }

  get facing(): Facing {
    return this.flipX ? -1 : 1;
  }

  get isKnockedOut(): boolean {
    return this.action.kind === 'knockedOut';
  }

  get blockHeight(): BlockHeight | null {
    return this.action.kind === 'blocking' ? this.action.height : null;
  }

  get currentAttack(): CurrentAttack | null {
    if (this.action.kind !== 'attacking') return null;
    const phase = attackPhaseAt(this.action.move, this.clockMs - this.action.startedAtMs);
    return phase ? { move: this.action.move, phase, id: this.action.id } : null;
  }

  /** The world area this fighter's attack can hit right now, or null if it cannot hit. */
  activeHitbox(): Phaser.Geom.Rectangle | null {
    if (this.action.kind !== 'attacking' || this.action.hasLanded) return null;
    const attack = this.currentAttack;
    return attack?.phase === 'active' ? this.toWorldRectangle(attack.move.hitbox) : null;
  }

  /** The world area attacks can hit, or null while knocked out. */
  hurtbox(): Phaser.Geom.Rectangle | null {
    return this.isKnockedOut ? null : this.toWorldRectangle(this.config.hurtbox);
  }

  /** Stops the current attack from hitting again. */
  markAttackLanded(): void {
    if (this.action.kind === 'attacking') this.action = { ...this.action, hasLanded: true };
  }

  /** Applies a clean hit: damage, knockback, then stun or a knockout. */
  takeHit({ damage, knockbackSpeed, stunMs }: HitImpact): void {
    this.health.damage(damage);
    this.knockbackSpeed = knockbackSpeed;

    if (this.health.isDepleted) {
      this.action = { kind: 'knockedOut' };
      this.play(this.config.animations.fall);
      return;
    }
    this.action = { kind: 'hurt', untilMs: this.clockMs + stunMs };
    this.play(this.config.animations.hit);
  }

  /** A blocked hit only slides the fighter back a little; the guard stays up. */
  absorbBlockedHit(knockbackSpeed: number): void {
    this.knockbackSpeed = knockbackSpeed;
  }

  /** Turns to face a world x position, unless attacking, hurt or knocked out. */
  faceTowards(targetX: number): void {
    const kind = this.action.kind;
    if (kind === 'attacking' || kind === 'hurt' || kind === 'knockedOut' || targetX === this.x) return;
    this.setFlipX(targetX < this.x);
  }

  /** Moves sideways, staying inside the arena. */
  pushBy(deltaX: number): void {
    this.x = Phaser.Math.Clamp(this.x + deltaX, this.config.minX, this.config.maxX);
  }

  /** Advances the fighter by one frame. */
  step(intent: FighterIntent, deltaMs: number): void {
    this.clockMs += deltaMs;
    this.slide(deltaMs);

    switch (this.action.kind) {
      case 'knockedOut':
      case 'changingStance':
        return;
      case 'hurt':
        if (this.clockMs < this.action.untilMs) return;
        this.action = FREE;
        break;
      case 'attacking': {
        const attack = this.currentAttack;
        if (attack) {
          this.showAttackFrame(attack);
          return;
        }
        this.action = FREE;
        break;
      }
    }

    if (intent.toggleStance) {
      this.changeStance();
      return;
    }

    if (this.currentStance === 'fighting' && intent.attack) {
      this.startAttack(this.config.attacks[intent.attack.kind][intent.attack.height]);
      return;
    }

    if (this.currentStance === 'fighting' && intent.block) {
      this.action = { kind: 'blocking', height: intent.block };
      this.showFrame(this.config.blockFrames[intent.block]);
      return;
    }

    this.action = FREE;
    this.move(intent.move, deltaMs);
  }

  private move(direction: number, deltaMs: number): void {
    const isMoving = direction !== 0;
    const isRunning = this.currentStance === 'running';

    if (isMoving) {
      if (isRunning) this.setFlipX(direction < 0);
      const speed = isRunning ? this.config.runSpeed : this.config.walkSpeed;
      const distance = (speed * deltaMs) / 1000;
      this.pushBy(direction * distance);
      this.countStride(distance);
    }

    this.play(this.movementAnimation(isMoving), true);
  }

  /** Announces a footfall every stride, rather than every frame the fighter is moving. */
  private countStride(distance: number): void {
    this.strideProgressPx += distance;
    if (this.strideProgressPx < STRIDE_PX) return;

    this.strideProgressPx = 0;
    this.emit(FIGHTER_EVENT.footstep);
  }

  /** Slides after a hit, slowing down steadily until stopped. */
  private slide(deltaMs: number): void {
    if (this.knockbackSpeed === 0) return;

    this.pushBy((this.knockbackSpeed * deltaMs) / 1000);
    const slowdown = (COMBAT.knockbackDeceleration * deltaMs) / 1000;
    this.knockbackSpeed =
      Math.abs(this.knockbackSpeed) <= slowdown ? 0 : this.knockbackSpeed - Math.sign(this.knockbackSpeed) * slowdown;
  }

  private movementAnimation(isMoving: boolean): string {
    const { animations } = this.config;
    if (this.currentStance === 'running') return isMoving ? animations.run : animations.stand;
    return isMoving ? animations.walk : animations.fightIdle;
  }

  private startAttack(move: AttackMove): void {
    this.attackCount++;
    this.action = { kind: 'attacking', id: this.attackCount, move, startedAtMs: this.clockMs, hasLanded: false };
    this.showAttackFrame({ move, phase: 'windup', id: this.attackCount });
    this.emit(FIGHTER_EVENT.attack, move.kind);
  }

  private showAttackFrame({ move, phase }: CurrentAttack): void {
    this.showFrame(phase === 'active' ? move.strikeFrame : move.windupFrame);
  }

  private showFrame(frame: string): void {
    this.anims.stop();
    this.setFrame(frame);
  }

  private toWorldRectangle({ x, y, width, height }: Hitbox): Phaser.Geom.Rectangle {
    const left = this.flipX ? this.x - x - width : this.x + x;
    return new Phaser.Geom.Rectangle(Math.round(left), Math.round(this.y + y), width, height);
  }

  /** Plays the stance transition; the fighter cannot act until it finishes. */
  private changeStance(): void {
    const to: Stance = this.currentStance === 'running' ? 'fighting' : 'running';
    this.action = { kind: 'changingStance', to };
    this.play(this.transitionAnimation(to));
    this.emit(FIGHTER_EVENT.stanceChange, to);
  }

  /** Completes a stance change, but only if it was not interrupted (e.g. by a hit). */
  private finishStanceChange(finishedAnimationKey: string): void {
    if (this.action.kind !== 'changingStance') return;
    if (finishedAnimationKey !== this.transitionAnimation(this.action.to)) return;

    this.currentStance = this.action.to;
    this.action = FREE;
  }

  private transitionAnimation(to: Stance): string {
    return to === 'fighting' ? this.config.animations.toFight : this.config.animations.toStand;
  }
}

/** Fails early, with a clear message, if a move or block refers to a frame the texture does not have. */
function assertFramesExist(scene: Phaser.Scene, config: FighterConfig): void {
  const texture = scene.textures.get(config.texture);
  const moveFrames = Object.values(config.attacks)
    .flatMap((movesByHeight) => Object.values(movesByHeight))
    .flatMap((move) => [move.windupFrame, move.strikeFrame]);

  const missingFrame = [...moveFrames, ...Object.values(config.blockFrames)].find((frame) => !texture.has(frame));
  if (missingFrame) throw new Error(`Fighter "${config.texture}" uses unknown frame "${missingFrame}".`);
}
