import type { MotionName } from '../../systems/input/motions';
import { NORMAL_NAMES, type Limb, type Move, type MoveName, type MoveSegment, type Strike } from './moves';

/**
 * Every special move in the game, across all fighters. Names are added as fighters are built;
 * a name's place in this list is also its number in the fight state's checksum.
 */
export const SPECIAL_NAMES = [
  'emberShot',
  'flareRise',
  'whirlKick',
  'cartwheel',
  'boulderToss',
  'ram',
  'quakeStomp',
  'titanRush',
  'lionPalm',
  'risingHeel',
  'cardToss',
  'loadedDice',
  'syringeDart',
  'needleSting',
  'rifleShot',
  'grenadeToss',
  'staticWave',
  'thunderHeel',
  'talonDive',
  'wallLeap',
  'spiritPalm',
  'craneStance',
  'railShot',
  'hookFlip',
  'rushJab',
  'dashUpper',
  'starClutch',
  'cometPress',
  'shadeOrb',
  'veilStep',
  'ironVerdict',
  'crownBreaker',
] as const;

export type SpecialName = (typeof SPECIAL_NAMES)[number];

/** Any attack a fighter can be doing: one of the twelve normals or a special. */
export type AttackName = MoveName | SpecialName;

/** Every attack name, normals first. An attack's place here is its number in the checksum. */
export const ATTACK_NAMES: readonly AttackName[] = [...NORMAL_NAMES, ...SPECIAL_NAMES];

/** A number that differs between the light-button and heavy-button version of a special. */
export interface ByStrength {
  readonly light: number;
  readonly heavy: number;
}

/** Throws something that travels across the arena on its own, like a fireball. */
export interface ProjectileBehaviour {
  readonly kind: 'projectile';
  /** The step of the move on which it leaves the hand. */
  readonly spawnStep: number;
  /** It starts at this limb's end, this many pixels further forward (and `upPx` higher, if given). */
  readonly fromLimb: Limb;
  readonly forwardPx: number;
  readonly upPx?: number;
  /** Sub-pixels per step. */
  readonly speed: ByStrength;
  /** The projectile's box, in pixels, centred on its position. */
  readonly width: number;
  readonly height: number;
  readonly strike: Omit<Strike, 'limb' | 'width' | 'height'>;
  /** Its sprite sheet (see src/content/sprites/projectiles.ts). */
  readonly sprite: string;
  /**
   * Thrown upwards as well as forwards, in sub-pixels per step, and it keeps climbing: a shot
   * angled to catch someone in the air. Left out, it flies level.
   */
  readonly climb?: ByStrength;
  /**
   * Lobbed rather than thrown flat: it leaves the hand rising this fast, in sub-pixels per step,
   * and falls under the fight's gravity, so it only carries so far. Left out, it flies level.
   */
  readonly arc?: ByStrength;
  /**
   * What a lobbed throw does where it lands: it stops there and bursts for this many steps,
   * hitting with a box this size in pixels. Left out, it is simply gone when it touches the floor.
   */
  readonly burst?: {
    readonly steps: number;
    readonly width: number;
    readonly height: number;
  };
}

/**
 * Launches the fighter upwards, striking on the way, like a rising uppercut. The first steps
 * cannot be hit, and the move's last segment is the recovery on landing.
 */
export interface RisingBehaviour {
  readonly kind: 'rising';
  /** The step of the move on which the fighter leaves the ground. */
  readonly launchStep: number;
  /** Upward and forward speed on launch, in sub-pixels per step. */
  readonly rise: ByStrength;
  readonly drift: ByStrength;
  /** Steps from the start of the move during which the fighter has no hurtboxes. */
  readonly invulnerableSteps: ByStrength;
}

/**
 * A leap that turns into a steep dive kick. The fighter leaves the ground on `launchStep` like a
 * jump, and on `diveStep` is driven down and forward, striking all the way down. The move holds
 * its airborne pose until they land, and its last segment is the recovery on landing.
 */
export interface DiveBehaviour {
  readonly kind: 'dive';
  /** The step of the move on which the fighter leaves the ground. */
  readonly launchStep: number;
  /** Upward and forward speed on launch, in sub-pixels per step. */
  readonly rise: ByStrength;
  readonly drift: ByStrength;
  /** The step on which the dive begins, and its forward and downward speed from then on. */
  readonly diveStep: number;
  readonly diveForward: ByStrength;
  readonly diveDown: ByStrength;
}

/**
 * A leap backwards to the edge behind the fighter (the arena wall, or as far from the opponent as
 * one screen allows), and a spring off it back the other way. The fighter leaves the ground on
 * `launchStep`, travelling back; the move holds the step before `springStep` until they reach
 * the edge, then jumps to `springStep` as they spring off. Landing, short of the edge or after
 * the spring, ends the move in its recovery, its last segment.
 */
export interface WallLeapBehaviour {
  readonly kind: 'wallLeap';
  readonly launchStep: number;
  /** Upward and backward speed on launch, in sub-pixels per step. */
  readonly rise: ByStrength;
  readonly back: ByStrength;
  readonly springStep: number;
  /** Forward and upward speed off the edge. */
  readonly springForward: ByStrength;
  readonly springUp: ByStrength;
}

/**
 * Vanishes and comes back on the other side of the opponent. The fighter goes on `vanishStep`
 * and reappears on `appearStep`, `behindPx` past the opponent's centre and turned to face them.
 * In between they have no hurtboxes and nothing is drawn of them. The arena walls still hold
 * them in, so against the wall they come back as far over as there is room for.
 */
export interface TeleportBehaviour {
  readonly kind: 'teleport';
  readonly vanishStep: number;
  readonly appearStep: number;
  readonly behindPx: ByStrength;
}

/**
 * Carries the fighter along the floor for part of the move: a travelling kick, a rushing punch,
 * or an evasive roll. It may strike on the way (through its segments), shrug off projectiles,
 * or pass straight through the opponent.
 */
export interface DashBehaviour {
  readonly kind: 'dash';
  /** The fighter travels from this step of the move up to, but not including, `endStep`. */
  readonly startStep: number;
  readonly endStep: number;
  /** Sub-pixels per step. */
  readonly speed: ByStrength;
  /** Projectiles pass through the fighter while they travel. */
  readonly projectileProof?: boolean;
  /** The fighter passes through the opponent while they travel, and may end up behind them. */
  readonly passThrough?: boolean;
  /** The travel ends as soon as the move connects, hit or blocked, like a charge meeting a wall. */
  readonly stopsOnContact?: boolean;
}

/**
 * Grabs an opponent in reach on the move's grab segments, and no block or throw break helps
 * against it. Once caught, the throw plays out `hold` (the thrower's poses), may lift the
 * opponent overhead part-way through, and tosses them into a knockdown at the end. A miss plays
 * out the rest of the move instead, which is the long whiff that makes it risky.
 */
export interface CommandThrowBehaviour {
  readonly kind: 'commandThrow';
  /** Greatest distance between the fighters' centres, in pixels, for the grab to catch. */
  readonly rangePx: ByStrength;
  readonly damage: ByStrength;
  /** The thrower's poses once the opponent is caught. The throw lasts as long as they do. */
  readonly hold: readonly MoveSegment[];
  /**
   * The step of the hold on which the opponent is lifted: this high and this far in front, in
   * pixels. Left out, they stay on their feet until the toss, as in a tackle.
   */
  readonly lift?: { readonly step: number; readonly heightPx: number; readonly forwardPx: number };
  /** The toss at the end, forward and upward, in sub-pixels per step. */
  readonly tossSpeed: number;
  readonly tossPop: number;
}

/**
 * A counter: a stance that catches a blow. If a hand-to-hand strike would land on the fighter
 * from `catchStart` up to (not including) `catchEnd`, it is caught instead: the attacker takes
 * `answer` at once and the move jumps to `answerStep`, where its answering poses begin. Uncaught,
 * the move ends at `answerStep`, and the steps before it are the whiff. Projectiles and throws
 * are not caught.
 */
export interface CounterBehaviour {
  readonly kind: 'counter';
  readonly catchStart: number;
  readonly catchEnd: number;
  readonly answerStep: number;
  readonly answer: Omit<Strike, 'limb' | 'width' | 'height'>;
}

/**
 * A fighter tends to themselves and wins back health on `healStep`, once per round. A hit before
 * then cancels it, and the once is still used up.
 */
export interface HealBehaviour {
  readonly kind: 'heal';
  readonly healStep: number;
  readonly amount: ByStrength;
}

export type SpecialBehaviour =
  | ProjectileBehaviour
  | RisingBehaviour
  | DiveBehaviour
  | WallLeapBehaviour
  | DashBehaviour
  | CommandThrowBehaviour
  | CounterBehaviour
  | TeleportBehaviour
  | HealBehaviour;

/**
 * A fighter's special move. Every special is started with a punch: light or heavy picks the
 * version. Every fighter uses the same two motions, so their specials are entered the same way.
 */
export interface SpecialMove {
  readonly name: SpecialName;
  readonly motion: MotionName;
  readonly move: Move;
  readonly behaviour: SpecialBehaviour;
}
