import { INPUT_READING } from '../../config';
import { numpadDirection, type InputBits } from './inputBits';
import type { Facing } from '../sim/fightState';

/** Directions pressed one after another, in keypad numbers (see `numpadDirection`). */
interface SequenceMotion {
  readonly kind: 'sequence';
  readonly directions: readonly number[];
  /** A long motion, given more time (see INPUT_READING). */
  readonly long?: boolean;
}

/** One of `hold` held for a while, then one of `release` pressed. */
interface ChargeMotion {
  readonly kind: 'charge';
  readonly hold: readonly number[];
  readonly release: readonly number[];
}

type Motion = SequenceMotion | ChargeMotion;

/** Keypad number for no direction held. */
const NEUTRAL = 5;

/**
 * The two motions every fighter's specials use, so that each fighter's first and second special
 * are entered the same way. Directions are for a fighter facing right.
 */
export const MOTIONS = {
  /**
   * ← ↙ ↓ ↘ →, read as just ← ↓ →: the diagonals are welcome but not needed, and it gets the
   * long motions' extra time, so tapping ←, ↓, → and then the button one by one works.
   */
  halfCircleForward: { kind: 'sequence', directions: [4, 2, 6], long: true },
  /** Hold ← (or ↙, which keeps the fighter in place), then → */
  chargeBackForward: { kind: 'charge', hold: [1, 4, 7], release: [6] },
} as const satisfies Readonly<Record<string, Motion>>;

export type MotionName = keyof typeof MOTIONS;

const MOTION_NAMES = Object.keys(MOTIONS) as MotionName[];

/**
 * Adds one step's input to a player's history, dropping the oldest once it is full.
 * The history is part of the fight state, so both players online read the same motions.
 */
export function recordInput(history: readonly InputBits[], input: InputBits): readonly InputBits[] {
  const kept = history.length >= INPUT_READING.historySteps ? history.slice(1) : history;
  return [...kept, input];
}

/**
 * The motions finished in the recent history, oldest input first. Directions are read
 * relative to `facing`, and a motion must end within a few steps of the newest input,
 * which is when its button is pressed.
 */
export function completedMotions(history: readonly InputBits[], facing: Facing): MotionName[] {
  const directions = history.map((bits) => numpadDirection(bits, facing));
  return MOTION_NAMES.filter((name) => isCompleted(MOTIONS[name], directions));
}

function isCompleted(motion: Motion, directions: readonly number[]): boolean {
  return motion.kind === 'sequence' ? hasSequence(motion, directions) : hasCharge(motion, directions);
}

/**
 * The directions appear in order within the motion window, with anything in between, and the
 * last one close to the end. Being forgiving about what comes in between is what makes
 * motions come out on a keyboard, where a roll from ↓ to → passes through ↘ on its own.
 */
function hasSequence({ directions: wanted, long }: SequenceMotion, directions: readonly number[]): boolean {
  const windowSteps = long ? INPUT_READING.longMotionWindowSteps : INPUT_READING.motionWindowSteps;
  const leniencySteps = long ? INPUT_READING.longMotionButtonLeniencySteps : INPUT_READING.buttonLeniencySteps;
  const newest = directions.length - 1;
  const earliest = Math.max(0, directions.length - windowSteps);
  let index = newest;
  for (let step = wanted.length - 1; step >= 0; step -= 1) {
    while (index >= earliest && directions[index] !== wanted[step]) index -= 1;
    if (index < earliest) return false;
    if (step === wanted.length - 1 && newest - index > leniencySteps) return false;
    index -= 1;
  }
  return true;
}

/** A release direction near the end, after a charge held long enough and let go only just before. */
function hasCharge({ hold, release }: ChargeMotion, directions: readonly number[]): boolean {
  const newest = directions.length - 1;
  let index = newest;
  while (index >= 0 && newest - index <= INPUT_READING.buttonLeniencySteps && !release.includes(directions[index] ?? NEUTRAL)) {
    index -= 1;
  }
  if (index < 0 || newest - index > INPUT_READING.buttonLeniencySteps) return false;

  // Between letting go of the charge and pressing the release, a few other steps may pass.
  const releaseAt = index;
  while (index >= 0 && releaseAt - index <= INPUT_READING.chargeReleaseSteps && !hold.includes(directions[index] ?? NEUTRAL)) {
    index -= 1;
  }
  let charged = 0;
  while (index >= 0 && hold.includes(directions[index] ?? NEUTRAL)) {
    charged += 1;
    index -= 1;
  }
  return charged >= INPUT_READING.chargeSteps;
}
