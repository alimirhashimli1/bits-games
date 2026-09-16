/** The controls, as rows of [action, keyboard, gamepad], for the controls screen. */
export const CONTROL_ROWS: readonly (readonly [action: string, keyboard: string, gamepad: string])[] = [
  ['WALK / RUN', 'ARROWS', 'D-PAD'],
  ['SWITCH STANCE', 'SHIFT', 'Y'],
  ['PUNCH', 'Z', 'X'],
  ['KICK', 'X', 'A'],
  ['BLOCK', 'C', 'B'],
  ['AIM HIGH / LOW', 'UP / DOWN', 'UP / DOWN'],
  ['PAUSE', 'ESC', 'START'],
  ['MUTE', 'M', '-'],
];

/** Shown under the table: the two rules that decide most fights. */
export const CONTROL_NOTES: readonly string[] = [
  'RUNNING STANCE IS FAST BUT CANNOT FIGHT.',
  'A HIGH GUARD STOPS HIGH AND MID BLOWS.',
];
