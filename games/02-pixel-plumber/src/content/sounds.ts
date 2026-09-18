import type { SoundSpec, ToneSpec } from '@shared/audio/audioEngine';
import { note } from '@shared/audio/notes';

/**
 * Every sound in Pixel Plumber, written as data and synthesised when it plays.
 *
 * Square waves for Rusty and the things he touches, triangle waves for anything big or low,
 * and a burst of filtered noise for anything that breaks, lands or hisses. Rising pitch means
 * something good, falling pitch something lost.
 */

/** A little tune: one square-wave note after another, `stepMs` apart. */
function jingle(names: readonly (string | null)[], stepMs: number, volume: number): ToneSpec[] {
  return names.flatMap((name, index) =>
    name ? [{ wave: 'square' as const, freq: note(name), durationMs: stepMs, delayMs: index * stepMs, volume }] : [],
  );
}

export const SOUNDS = {
  /** A quick upward sweep. Big Rusty's is lower, as a heavier plumber should be. */
  jumpSmall: {
    tones: [{ wave: 'square', freq: 320, toFreq: 760, durationMs: 150, volume: 0.1 }],
  },
  jumpBig: {
    tones: [{ wave: 'square', freq: 220, toFreq: 520, durationMs: 170, volume: 0.1 }],
  },
  /** Landing on an enemy: a soft thump and a short squash. */
  stomp: {
    tones: [{ wave: 'square', freq: 420, toFreq: 180, durationMs: 90, volume: 0.14 }],
    noise: [{ durationMs: 60, volume: 0.1, cutoffHz: 900 }],
  },
  /** A shell sent sliding, or anything knocked over by one. */
  kick: {
    tones: [{ wave: 'square', freq: 700, toFreq: 350, durationMs: 60, volume: 0.13 }],
    noise: [{ durationMs: 40, volume: 0.08, cutoffHz: 2400 }],
  },
  /** A bright little three-note chime, the last held: the most-heard sound in the game. */
  coin: {
    tones: [
      { wave: 'square', freq: note('D6'), durationMs: 45, volume: 0.09 },
      { wave: 'square', freq: note('F#6'), durationMs: 45, delayMs: 45, volume: 0.09 },
      { wave: 'square', freq: note('A6'), durationMs: 180, delayMs: 90, volume: 0.09 },
    ],
  },
  /** Head against something that gives nothing. */
  bump: {
    tones: [{ wave: 'triangle', freq: 180, toFreq: 120, durationMs: 80, volume: 0.22 }],
    noise: [{ durationMs: 50, volume: 0.08, cutoffHz: 600 }],
  },
  /** A brick breaking up: a crack and falling rubble. */
  brickBreak: {
    tones: [{ wave: 'square', freq: 260, toFreq: 70, durationMs: 180, volume: 0.12 }],
    noise: [
      { durationMs: 90, volume: 0.2, cutoffHz: 2600 },
      { durationMs: 220, delayMs: 60, volume: 0.12, cutoffHz: 900 },
    ],
  },
  /** A power-up rising out of its block. */
  itemAppears: {
    tones: jingle(['C4', 'E4', 'G4', 'C5', 'D4', 'F#4', 'A4', 'D5'], 45, 0.08),
  },
  /** Growing, or turning to steam: a run up two octaves, like pressure building in a pipe. */
  powerUp: {
    tones: jingle(['F4', 'A4', 'C5', 'F5', 'A5', 'C6', 'F6', 'E6', 'F6'], 45, 0.09),
  },
  /** Hit, and a size lost: sliding back down. */
  powerDown: {
    tones: [
      { wave: 'square', freq: 700, toFreq: 180, durationMs: 380, volume: 0.12 },
      { wave: 'square', freq: 520, toFreq: 140, durationMs: 380, delayMs: 60, volume: 0.07 },
    ],
  },
  oneUp: {
    tones: jingle(['A5', 'D6', 'F#6', 'A6', null, 'F#6', 'A6', 'D7'], 70, 0.08),
  },
  /** A puff of steam leaving his hands. */
  steamPuff: {
    tones: [{ wave: 'square', freq: 900, toFreq: 1400, durationMs: 50, volume: 0.06 }],
    noise: [{ durationMs: 90, volume: 0.1, cutoffHz: 4200 }],
  },
  /** Going down a pipe or coming up one: a low, gurgling fall. */
  pipe: {
    tones: [
      { wave: 'triangle', freq: 300, toFreq: 90, durationMs: 160, volume: 0.22 },
      { wave: 'triangle', freq: 300, toFreq: 90, durationMs: 160, delayMs: 200, volume: 0.22 },
      { wave: 'triangle', freq: 300, toFreq: 90, durationMs: 160, delayMs: 400, volume: 0.22 },
    ],
  },
  /** Catching the valve wheel, and winding it down the pole. */
  wheel: {
    tones: [{ wave: 'square', freq: note('C6'), toFreq: note('C4'), durationMs: 900, volume: 0.08 }],
  },
  /** One unit of the clock counted into the score. Very quiet: it plays many times a second. */
  tick: {
    tones: [{ wave: 'square', freq: note('A5'), durationMs: 18, volume: 0.04 }],
  },
  /** The clock has fallen under 100: a warning, like a pressure alarm, before the music speeds up. */
  hurry: {
    tones: jingle(['A5', 'D#6', 'A5', 'D#6', null, 'A5', 'D#6', 'A5', 'D#6'], 70, 0.08),
  },
  /** One letter of story text. */
  type: {
    tones: [{ wave: 'square', freq: 880, durationMs: 16, volume: 0.03 }],
  },
  /** The highlight moving in a menu. */
  menuMove: {
    tones: [{ wave: 'square', freq: note('E5'), durationMs: 40, volume: 0.1 }],
  },
  confirm: {
    tones: jingle(['C5', 'G5'], 70, 0.12),
  },

  /** The Sludge Baron lobbing a blob: a wet, rising slurp. */
  baronThrow: {
    tones: [{ wave: 'sawtooth', freq: 110, toFreq: 260, durationMs: 180, volume: 0.1 }],
    noise: [{ durationMs: 120, volume: 0.06, cutoffHz: 500 }],
  },
  /** Steam hitting him: a hiss and a grunt. */
  baronHit: {
    tones: [{ wave: 'square', freq: 160, toFreq: 110, durationMs: 120, volume: 0.14 }],
    noise: [{ durationMs: 140, volume: 0.12, cutoffHz: 3600 }],
  },
  /** Beaten, falling away: a long slide down. */
  baronBeaten: {
    tones: [
      { wave: 'sawtooth', freq: 300, toFreq: 40, durationMs: 1100, volume: 0.12 },
      { wave: 'triangle', freq: 200, toFreq: 30, durationMs: 1200, delayMs: 100, volume: 0.18 },
    ],
  },
  /** The lever thrown, the pressure let out and the grates crashing down. */
  lever: {
    tones: [{ wave: 'square', freq: 520, toFreq: 260, durationMs: 90, volume: 0.14 }],
    noise: [
      { durationMs: 900, delayMs: 60, volume: 0.14, cutoffHz: 5000 },
      { durationMs: 500, delayMs: 120, volume: 0.22, cutoffHz: 400 },
    ],
  },

  /** A life lost: the music stops for this, a stumble and a slow fall down the scale. */
  defeat: {
    tones: [
      ...jingle(['D5', 'A4', null, 'F5', 'E5', 'D5', 'C#5', null, 'A4', null, 'D4'], 120, 0.1),
      { wave: 'triangle', freq: note('D3'), durationMs: 700, delayMs: 1200, volume: 0.18 },
    ],
  },
  /** At the foot of the pole, before the clock is counted: the main runs clear. */
  levelClear: {
    tones: [
      ...jingle(['D5', 'F#5', 'A5', 'D6', null, 'B5', 'C#6', 'D6', null, 'E6', 'F#6', null], 95, 0.09),
      { wave: 'square', freq: note('A6'), durationMs: 600, delayMs: 1140, volume: 0.09 },
      { wave: 'triangle', freq: note('D3'), durationMs: 380, volume: 0.16 },
      { wave: 'triangle', freq: note('G3'), durationMs: 380, delayMs: 380, volume: 0.16 },
      { wave: 'triangle', freq: note('A3'), durationMs: 380, delayMs: 760, volume: 0.16 },
      { wave: 'triangle', freq: note('D3'), durationMs: 700, delayMs: 1140, volume: 0.16 },
    ],
  },
  /** The last life gone: a slow line down in the minor, over a low drone. */
  gameOver: {
    tones: [
      ...jingle(['A4', null, 'C5', 'B4', null, 'G4', null, 'E4', 'F4', null, 'D#4', null, 'E4'], 160, 0.1),
      { wave: 'triangle', freq: note('A2'), durationMs: 2100, volume: 0.16 },
    ],
  },
} as const satisfies Record<string, SoundSpec>;

export type SoundName = keyof typeof SOUNDS;
