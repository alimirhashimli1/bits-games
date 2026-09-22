import { INPUT_READING } from '../../config';
import { numpadDirection, type InputBits } from './inputBits';
import type { PlayerIndex } from '../matchSetup';
import type { Facing } from '../sim/fightState';

/** Directions pressed one after another, in keypad numbers (see `numpadDirection`). */
interface Motion {
  readonly kind: 'sequence';
  readonly directions: readonly number[];
}

/** Keypad number for no direction held. */
const NEUTRAL = 5;

/**
 * The two motions every fighter's specials use, so that each fighter's first and second special
 * are entered the same way. Directions are for a fighter facing right, which on the keyboard is
 * D forward and S down for player 1.
 */
export const MOTIONS = {
  /** → + P, so D then the punch: a tap forward and the button. */
  forward: { kind: 'sequence', directions: [6] },
  /** ↓ → + P, so S, D then the punch. */
  downForward: { kind: 'sequence', directions: [2, 6] },
} as const satisfies Readonly<Record<string, Motion>>;

export type MotionName = keyof typeof MOTIONS;

const MOTION_NAMES = Object.keys(MOTIONS) as MotionName[];

/**
 * The way each player's motions are read, whichever way their fighter happens to be facing:
 * player 1's forward is always →, player 2's always ←, the sides they start the round on. A
 * motion that swapped over when the fighters crossed would be far harder to enter mid-fight.
 */
export const MOTION_FACING: Readonly<Record<PlayerIndex, Facing>> = { 0: 1, 1: -1 };

/** How many directions a motion has: the longer motion wins when an input finishes both. */
export function motionLength(name: MotionName): number {
  return MOTIONS[name].directions.length;
}

/**
 * Adds one step's input to a player's history, dropping the oldest once it is full.
 * The history is part of the fight state, so both players online read the same motions.
 */
export function recordInput(history: readonly InputBits[], input: InputBits): readonly InputBits[] {
  const kept = history.length >= INPUT_READING.historySteps ? history.slice(1) : history;
  return [...kept, input];
}

/**
 * The motions finished in the recent history, oldest input first. Directions are read relative
 * to `facing` (see MOTION_FACING), and a motion must end within a few steps of the newest input,
 * which is when its button is pressed.
 */
export function completedMotions(history: readonly InputBits[], facing: Facing): MotionName[] {
  const directions = history.map((bits) => numpadDirection(bits, facing));
  return MOTION_NAMES.filter((name) => hasSequence(MOTIONS[name], directions));
}

/**
 * The directions appear in order within the motion window, each one following straight on from
 * the one before (see `motionGapSteps`), and the last one is a fresh tap: it must have been
 * pressed, not merely held, just before the button. That is what keeps walking forward and
 * pressing punch a normal attack, and crouching and then D and F a → + P, while S, D and F rolled
 * one into the next is ↓ → + P. A diagonal on the way, such as the ↘ a roll from ↓ to → passes
 * through on a keyboard, counts towards the gap.
 */
function hasSequence({ directions: wanted }: Motion, directions: readonly number[]): boolean {
  const earliest = Math.max(0, directions.length - INPUT_READING.motionWindowSteps);
  let latest = directions.length - 1;
  let limit = earliest;
  for (let step = wanted.length - 1; step >= 0; step -= 1) {
    const direction = wanted[step] ?? NEUTRAL;
    let index = latest;
    while (index >= limit && directions[index] !== direction) index -= 1;
    if (index < limit) return false;
    const start = runStart(directions, index);
    if (step === wanted.length - 1 && directions.length - start > INPUT_READING.tapSteps) return false;
    latest = start - 1;
    limit = Math.max(earliest, latest - INPUT_READING.motionGapSteps);
  }
  return true;
}

/** Where the run of the same direction that includes `index` began. */
function runStart(directions: readonly number[], index: number): number {
  let start = index;
  while (start > 0 && directions[start - 1] === directions[index]) start -= 1;
  return start;
}
