import type { SoundSpec } from '@shared/audio/audioEngine';
import { note } from '@shared/audio/notes';

/**
 * Every one-off sound in the game, as data for the shared audio engine. The engine note and
 * the tyre squeal are held tones instead: see `systems/audio/RaceAudio.ts`.
 */

/** Into high gear: a short clunk and the note snapping down. */
export const GEAR_UP: SoundSpec = {
  tones: [{ wave: 'square', freq: 520, toFreq: 260, durationMs: 60, volume: 0.1 }],
  noise: [{ durationMs: 40, volume: 0.15, cutoffHz: 900 }],
};

/** Back into low gear: the same clunk, the note snapping up. */
export const GEAR_DOWN: SoundSpec = {
  tones: [{ wave: 'square', freq: 260, toFreq: 520, durationMs: 60, volume: 0.1 }],
  noise: [{ durationMs: 40, volume: 0.15, cutoffHz: 900 }],
};

/** Nudging another car, or scenery at low speed: a dull thud. */
export const BUMP: SoundSpec = {
  tones: [{ wave: 'triangle', freq: 110, toFreq: 55, durationMs: 120, volume: 0.3 }],
  noise: [{ durationMs: 100, volume: 0.3, cutoffHz: 400 }],
};

/** Hitting scenery flat out: a crunch, then the car tumbling over and over. */
export const CRASH: SoundSpec = {
  tones: [{ wave: 'sawtooth', freq: 180, toFreq: 40, durationMs: 700, volume: 0.15 }],
  noise: [
    { durationMs: 450, volume: 0.45, cutoffHz: 2400 },
    { durationMs: 150, delayMs: 500, volume: 0.3, cutoffHz: 600 },
    { durationMs: 150, delayMs: 900, volume: 0.25, cutoffHz: 600 },
  ],
};

/** Through a checkpoint: a bright run up the scale. */
export const CHECKPOINT: SoundSpec = {
  tones: [
    { wave: 'square', freq: note('C5'), durationMs: 90, volume: 0.14 },
    { wave: 'square', freq: note('E5'), durationMs: 90, delayMs: 80, volume: 0.14 },
    { wave: 'square', freq: note('G5'), durationMs: 90, delayMs: 160, volume: 0.14 },
    { wave: 'square', freq: note('C6'), durationMs: 260, delayMs: 240, volume: 0.14 },
  ],
};

/** Each second as the clock runs out. */
export const COUNTDOWN_BEEP: SoundSpec = {
  tones: [{ wave: 'square', freq: note('A5'), durationMs: 80, volume: 0.12 }],
};

/** Out of time: a long falling buzz. */
export const TIME_UP: SoundSpec = {
  tones: [
    { wave: 'sawtooth', freq: note('A3'), toFreq: note('A2'), durationMs: 900, volume: 0.16 },
    { wave: 'square', freq: note('E3'), toFreq: note('E2'), durationMs: 900, volume: 0.08 },
  ],
};

/** Over the finish line: a fanfare. */
export const GOAL: SoundSpec = {
  tones: [
    { wave: 'square', freq: note('G4'), durationMs: 120, volume: 0.14 },
    { wave: 'square', freq: note('C5'), durationMs: 120, delayMs: 120, volume: 0.14 },
    { wave: 'square', freq: note('E5'), durationMs: 120, delayMs: 240, volume: 0.14 },
    { wave: 'square', freq: note('G5'), durationMs: 700, delayMs: 360, volume: 0.14 },
    { wave: 'triangle', freq: note('C3'), durationMs: 1060, volume: 0.2 },
  ],
};

/** A rival left behind: two quick rising notes. */
export const RIVAL_PASSED: SoundSpec = {
  tones: [
    { wave: 'square', freq: note('E5'), durationMs: 70, volume: 0.12 },
    { wave: 'square', freq: note('A5'), durationMs: 120, delayMs: 70, volume: 0.12 },
  ],
};

/** A tick of the time bonus being counted at a goal. */
export const TALLY_TICK: SoundSpec = {
  tones: [{ wave: 'square', freq: note('E6'), durationMs: 30, volume: 0.07 }],
};

/** Moving the cursor in a menu. */
export const MENU_MOVE: SoundSpec = {
  tones: [{ wave: 'square', freq: note('A4'), durationMs: 40, volume: 0.08 }],
};

/** Picking a menu item. */
export const MENU_SELECT: SoundSpec = {
  tones: [
    { wave: 'square', freq: note('A4'), durationMs: 50, volume: 0.1 },
    { wave: 'square', freq: note('E5'), durationMs: 90, delayMs: 50, volume: 0.1 },
  ],
};
