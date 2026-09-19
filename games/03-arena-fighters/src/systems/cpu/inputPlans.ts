import { INPUT_READING } from '../../config';
import { INPUT, type InputBits } from '../input/inputBits';
import { completedMotions, MOTIONS, type MotionName } from '../input/motions';
import type { Facing } from '../sim/fightState';

/** The direction bits for towards and away from the opponent, for a fighter facing `facing`. */
export function forward(facing: Facing): InputBits {
  return facing === 1 ? INPUT.right : INPUT.left;
}

export function back(facing: Facing): InputBits {
  return facing === 1 ? INPUT.left : INPUT.right;
}

/** A keypad direction (5 neutral, 6 forward, 2 down...) as input bits for a fighter facing `facing`. */
export function keypadBits(direction: number, facing: Facing): InputBits {
  const column = (direction - 1) % 3; // 0 back, 1 middle, 2 forward
  const row = Math.floor((direction - 1) / 3); // 0 down, 1 middle, 2 up
  let bits: InputBits = 0;
  if (column === 0) bits |= back(facing);
  if (column === 2) bits |= forward(facing);
  if (row === 0) bits |= INPUT.down;
  if (row === 2) bits |= INPUT.up;
  return bits;
}

/**
 * The inputs, one per step, that perform a motion and press `button` on its last direction:
 * a sequence is played one direction a step, and a charge is held long enough and then released.
 * `history` is the fighter's own inputs so far: a charge already held (say, while blocking) only
 * needs its release.
 */
export function motionInputs(motion: MotionName, facing: Facing, button: InputBits, history: readonly InputBits[]): InputBits[] {
  const shape = MOTIONS[motion];
  if (shape.kind === 'sequence') {
    const steps = shape.directions.map((direction) => keypadBits(direction, facing));
    return [...steps.slice(0, -1), (steps[steps.length - 1] ?? 0) | button];
  }
  const hold = keypadBits(shape.hold[0], facing);
  const release = keypadBits(shape.release[0], facing) | button;
  if (completedMotions([...history, release], facing).includes(motion)) return [release];
  return [...Array.from({ length: INPUT_READING.chargeSteps + 2 }, () => hold), release];
}

/** A pause of `steps` steps with nothing pressed. */
export function wait(steps: number): InputBits[] {
  return Array.from({ length: steps }, () => 0);
}
