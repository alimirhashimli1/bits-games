import { COMBAT, FIGHT_CLOCK, STAGE, SUBPIXELS_PER_PIXEL } from '../../config';
import type { AttackName, SpecialName } from '../../content/fighters/specials';
import type { FighterId } from '../../content/roster';
import type { InputBits } from '../input/inputBits';
import type { MatchRules, PlayerIndex } from '../matchSetup';

export type Posture = 'standing' | 'crouching' | 'airborne';

/** 1 when facing right, -1 when facing left. */
export type Facing = 1 | -1;

/** Whether a move has connected yet. A move hits (or is blocked) once at most. */
export type Contact = 'none' | 'hit' | 'block';

/**
 * A move under way: which one, how many steps into it (0 = its first step), whether it has
 * connected, and for special moves whether it came from the heavy button.
 */
export interface AttackState {
  readonly move: AttackName;
  readonly step: number;
  readonly contact: Contact;
  readonly heavy: boolean;
}

/** Something thrown by a special move, crossing the arena on its own. `x` and `y` are its centre. */
export interface ProjectileState {
  readonly owner: PlayerIndex;
  readonly special: SpecialName;
  readonly heavy: boolean;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
}

export type KnockdownPhase = 'falling' | 'lying' | 'rising';

/**
 * What a fighter is doing apart from moving and attacking. Only a free fighter answers their
 * controls; the others count down (`steps` left) or wait for the floor.
 */
export type Status =
  | { readonly kind: 'free' }
  | { readonly kind: 'hitstun'; readonly steps: number }
  | { readonly kind: 'blockstun'; readonly steps: number }
  /** A knocked-out fighter (`ko`) lies where they fell and does not get up. */
  | { readonly kind: 'knockdown'; readonly phase: KnockdownPhase; readonly steps: number; readonly ko: boolean }
  /**
   * `steps` counts up from the moment of the grab, for the thrower and the one thrown alike.
   * `special` names the command throw under way, or is null for the ordinary throw.
   */
  | { readonly kind: 'throwing'; readonly steps: number; readonly special: SpecialName | null; readonly heavy: boolean }
  | { readonly kind: 'thrown'; readonly steps: number };

export const FREE: Status = { kind: 'free' };

/**
 * One fighter at one step of the fight. Every number is a whole number of sub-pixels:
 * `x` is the centre of the body, `y` the height of the feet above the floor.
 */
export interface FighterState {
  /** Who this is, which decides their moves and their boxes. */
  readonly character: FighterId;
  readonly x: number;
  readonly y: number;
  /** Horizontal speed this step: the walking speed on the ground, the jump's drift in the air. */
  readonly vx: number;
  /** Upward speed, only while airborne. */
  readonly vy: number;
  /** Pushback from a hit or a block, which slows to a stop on the ground. */
  readonly slide: number;
  readonly facing: Facing;
  readonly posture: Posture;
  readonly status: Status;
  readonly attack: AttackState | null;
  /** One attack per jump: set when a jumping attack starts, cleared on landing. */
  readonly airAttackUsed: boolean;
  readonly health: number;
  /** A heal special has been used this round (each fighter may heal once a round). */
  readonly healUsed: boolean;
  /** Hits taken in a row without getting free in between: the opponent's combo. */
  readonly comboHits: number;
}

/**
 * Where a round is: the intro, the fight itself, the moment after a KO or when time runs out,
 * the result, and, after the last round, the end of the match.
 */
export type RoundPhase = 'intro' | 'fight' | 'ko' | 'timeUp' | 'result' | 'matchOver';

/** Who took a round or the match: a player, or nobody. */
export type Winner = PlayerIndex | 'draw';

export interface RoundState {
  /** Counting from 1. */
  readonly number: number;
  readonly phase: RoundPhase;
  /** Steps since the phase began. */
  readonly phaseSteps: number;
  /** Steps left on the round's clock. */
  readonly timer: number;
  /** Set once the round is decided. */
  readonly winner: Winner | null;
}

/** The match rules as the fight uses them: the round's length in steps rather than seconds. */
export interface FightRules {
  readonly roundSteps: number;
  readonly roundsToWin: number;
}

/** Everything the fight needs to carry on. Nothing outside it (clock, screen, randomness) affects a step. */
export interface FightState {
  /** Steps since the fight began. */
  readonly frame: number;
  readonly fighters: readonly [FighterState, FighterState];
  /** Each player's recent inputs, oldest first, for reading motions such as ↓ ↘ →. */
  readonly history: readonly [readonly InputBits[], readonly InputBits[]];
  /** Steps left of the freeze after a blow lands. */
  readonly hitstop: number;
  /** Buttons each player pressed during the freeze, which count as fresh presses once it ends. */
  readonly buffered: readonly [InputBits, InputBits];
  readonly projectiles: readonly ProjectileState[];
  readonly rules: FightRules;
  readonly round: RoundState;
  /** Rounds each player has won. */
  readonly wins: readonly [number, number];
  /** Set once the match is decided. */
  readonly matchWinner: Winner | null;
}

export function toSubpixels(pixels: number): number {
  return pixels * SUBPIXELS_PER_PIXEL;
}

/** Whole pixels, for drawing. */
export function toPixels(subpixels: number): number {
  return Math.floor(subpixels / SUBPIXELS_PER_PIXEL);
}

/** A new match: round 1 about to begin. */
export function createFightState(characters: readonly [FighterId, FighterId], rules: MatchRules): FightState {
  return {
    ...startOfRound(characters),
    frame: 0,
    rules: { roundSteps: rules.roundSeconds * FIGHT_CLOCK.stepsPerSecond, roundsToWin: rules.roundsToWin },
    round: { number: 1, phase: 'intro', phaseSteps: 0, timer: rules.roundSeconds * FIGHT_CLOCK.stepsPerSecond, winner: null },
    wins: [0, 0],
    matchWinner: null,
  };
}

/** Both fighters standing in the middle of the arena, facing each other, at full health, with nothing in the air. */
export function startOfRound(
  characters: readonly [FighterId, FighterId],
): Pick<FightState, 'fighters' | 'history' | 'hitstop' | 'buffered' | 'projectiles'> {
  const middle = toSubpixels(STAGE.width / 2);
  const halfGap = toSubpixels(STAGE.startSeparation / 2);
  const standing = {
    y: 0,
    vx: 0,
    vy: 0,
    slide: 0,
    posture: 'standing',
    status: FREE,
    attack: null,
    airAttackUsed: false,
    healUsed: false,
    health: COMBAT.maxHealth,
    comboHits: 0,
  } as const;
  return {
    fighters: [
      { ...standing, character: characters[0], x: middle - halfGap, facing: 1 },
      { ...standing, character: characters[1], x: middle + halfGap, facing: -1 },
    ],
    history: [[], []],
    hitstop: 0,
    buffered: [0, 0],
    projectiles: [],
  };
}
