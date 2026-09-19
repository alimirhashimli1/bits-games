/**
 * One player's input for one step of the fight, packed into a single number. Every source
 * (keyboard, gamepad, CPU, online opponent) produces this, so the fight cannot tell them apart.
 */
export type InputBits = number;

export const INPUT = {
  up: 1,
  down: 2,
  left: 4,
  right: 8,
  lightPunch: 16,
  heavyPunch: 32,
  lightKick: 64,
  heavyKick: 128,
} as const;

export type InputName = keyof typeof INPUT;
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Button = Exclude<InputName, Direction>;

export const BUTTONS: readonly Button[] = ['lightPunch', 'heavyPunch', 'lightKick', 'heavyKick'];

const DIRECTION_BITS = INPUT.up | INPUT.down | INPUT.left | INPUT.right;

export function isHeld(bits: InputBits, flag: number): boolean {
  return (bits & flag) !== 0;
}

/** Buttons down now that were not down the step before. */
export function newlyPressed(bits: InputBits, previous: InputBits): InputBits {
  return bits & ~previous & ~DIRECTION_BITS;
}

/**
 * Opposite directions held together cancel out: left + right is neither, and up + down is up.
 * Otherwise a player could walk and hold back to block at the same time.
 */
export function cleanDirections(bits: InputBits): InputBits {
  let clean = bits;
  if (isHeld(clean, INPUT.left) && isHeld(clean, INPUT.right)) clean &= ~(INPUT.left | INPUT.right);
  if (isHeld(clean, INPUT.up) && isHeld(clean, INPUT.down)) clean &= ~INPUT.down;
  return clean;
}

/** 1 when holding towards the direction faced, -1 when holding away, 0 otherwise. */
export function horizontalIntent(bits: InputBits, facing: 1 | -1): -1 | 0 | 1 {
  const towardsRight = isHeld(bits, INPUT.right) ? 1 : isHeld(bits, INPUT.left) ? -1 : 0;
  if (towardsRight === 0) return 0;
  return towardsRight === facing ? 1 : -1;
}

/**
 * The direction as a number laid out like a keypad, seen from a fighter facing right:
 * 5 is neutral, 6 forward, 4 back, 2 down, 8 up, 3 down-forward and so on. This is the
 * usual way to write fighting-game motions, so ↓ ↘ → is 2 3 6 whichever way you face.
 */
export function numpadDirection(bits: InputBits, facing: 1 | -1): number {
  const vertical = isHeld(bits, INPUT.up) ? 1 : isHeld(bits, INPUT.down) ? -1 : 0;
  return 5 + horizontalIntent(bits, facing) + 3 * vertical;
}
