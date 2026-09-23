/**
 * The voices every loop in the game is written for. Keeping them in one place is what makes
 * sixteen arenas sound like sixteen rooms in one game rather than sixteen different games:
 * a square-wave tune over a triangle bass, and the arena decides the key, the speed and the
 * shape, not the instruments.
 */

/** The tune, in the square wave the whole console is built on. */
export const LEAD = { wave: 'square', volume: 0.075 } as const;

/** A softer tune, for the quieter rooms, where a square wave would be too bright. */
export const SOFT_LEAD = { wave: 'triangle', volume: 0.095 } as const;

/** A second voice under the tune, quiet enough to be felt rather than followed. */
export const HARMONY = { wave: 'square', volume: 0.04 } as const;

/** The usual bass: one note every two steps. */
export const BASS = { wave: 'triangle', volume: 0.13, steps: 2 } as const;

/** A bass on every step, for the rooms that need driving along. */
export const PULSE_BASS = { wave: 'triangle', volume: 0.12, steps: 1 } as const;

/** A held note under the slow rooms, four steps at a time. */
export const DRONE_BASS = { wave: 'triangle', volume: 0.11, steps: 4 } as const;

/** And eight, where even four would be too busy. */
export const LONG_DRONE = { wave: 'triangle', volume: 0.1, steps: 8 } as const;

/** Every loop is this many steps long, so the bars line up wherever the music changes. */
export const LOOP_STEPS = 32;
