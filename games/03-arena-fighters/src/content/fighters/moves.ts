import type { AnyPoseName } from './poseNames';

/** The parts of a fighter that can strike: the ends of the limbs, and the head. "Near" is the side closer to the viewer. */
export type Limb = 'nearHand' | 'farHand' | 'nearFoot' | 'farFoot' | 'head';

/**
 * How a strike must be blocked: a mid by standing or crouching, a low only crouching, and an
 * overhead only standing. Every jumping attack is an overhead.
 */
export type Guard = 'mid' | 'low' | 'overhead';

/** The part of a move that can hit: a box of this size, in pixels, centred on the striking limb's end. */
export interface Strike {
  readonly limb: Limb;
  readonly width: number;
  readonly height: number;
  /** Health taken on a hit, out of the fighters' full health (see COMBAT in config). */
  readonly damage: number;
  /** Health taken even when blocked. Normals leave it out; special moves chip. */
  readonly chip?: number;
  /** Steps the opponent reels after a hit, or holds their guard after a block. */
  readonly hitstun: number;
  readonly blockstun: number;
  /** Speed, in sub-pixels per step, of the slide that pushes the opponent away. */
  readonly push: number;
  readonly guard: Guard;
  /** Knocks the opponent off their feet instead of making them reel. */
  readonly knockdown?: boolean;
}

/**
 * One pose held for a number of fight steps. Segments with a strike are the move's active
 * frames, and so are those with a grab: a command throw catches an opponent in reach on them.
 */
export interface MoveSegment {
  readonly pose: AnyPoseName;
  readonly steps: number;
  readonly strike?: Strike;
  readonly grab?: boolean;
}

/**
 * What a move can be cut short into once it has connected (hit or blocked): `chain` into
 * another light normal or a special move, as light punches and kicks do, or `special` into a
 * special move only.
 */
export type CancelRule = 'chain' | 'special';

export interface Move {
  readonly segments: readonly MoveSegment[];
  readonly cancel?: CancelRule;
}

/** The twelve normal attacks: standing, crouching and jumping versions of each button. */
export const NORMAL_NAMES = [
  'standLP',
  'standHP',
  'standLK',
  'standHK',
  'crouchLP',
  'crouchHP',
  'crouchLK',
  'crouchHK',
  'jumpLP',
  'jumpHP',
  'jumpLK',
  'jumpHK',
] as const;

export type MoveName = (typeof NORMAL_NAMES)[number];

/** A fighter's full move list: leaving a move out is a type error. */
export type FighterMoves = Readonly<Record<MoveName, Move>>;

export type MovePhase = 'startup' | 'active' | 'recovery';

/** How many steps a move lasts in all. */
export function moveLength(move: Move): number {
  return move.segments.reduce((total, segment) => total + segment.steps, 0);
}

/** The segment shown on a given step of a move (0 = its first step), or the last one after it ends. */
export function segmentAt(move: Move, step: number): MoveSegment | undefined {
  let remaining = step;
  for (const segment of move.segments) {
    if (remaining < segment.steps) return segment;
    remaining -= segment.steps;
  }
  return move.segments[move.segments.length - 1];
}

/** Startup is everything before the first strike or grab, active is the striking and grabbing segments, recovery the rest. */
export function phaseAt(move: Move, step: number): MovePhase {
  const isActive = (segment: MoveSegment): boolean => segment.strike !== undefined || segment.grab === true;
  const firstStrike = move.segments.findIndex(isActive);
  let remaining = step;
  for (const [index, segment] of move.segments.entries()) {
    if (remaining < segment.steps) {
      if (isActive(segment)) return 'active';
      return firstStrike === -1 || index < firstStrike ? 'startup' : 'recovery';
    }
    remaining -= segment.steps;
  }
  return 'recovery';
}
