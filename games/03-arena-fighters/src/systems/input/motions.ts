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
 * The directions appear in order within the motion window, with anything in between, and the
 * last one is a fresh tap: it must have been pressed, not merely held, just before the button.
 * That is what keeps walking forward and pressing punch a normal attack, while D and then F
 * one after the other is a special. Being forgiving about what comes in between is what makes
 * motions come out on a keyboard, where a roll from ↓ to → passes through ↘ on its own.
 */
function hasSequence({ directions: wanted }: Motion, directions: readonly number[]): boolean {
  const newest = directions.length - 1;
  const earliest = Math.max(0, directions.length - INPUT_READING.motionWindowSteps);
  let index = newest;
  for (let step = wanted.length - 1; step >= 0; step -= 1) {
    while (index >= earliest && directions[index] !== wanted[step]) index -= 1;
    if (index < earliest) return false;
    if (step === wanted.length - 1 && !freshlyTapped(directions, index, wanted[step] ?? NEUTRAL)) return false;
    index -= 1;
  }
  return true;
}

/**
 * The run of `direction` ending at `index` began within the tap window, so the player pressed it
 * for this move rather than having held it all along.
 */
function freshlyTapped(directions: readonly number[], index: number, direction: number): boolean {
  let start = index;
  while (start > 0 && directions[start - 1] === direction) start -= 1;
  return directions.length - start <= INPUT_READING.tapSteps;
}
