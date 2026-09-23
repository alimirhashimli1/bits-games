import type { SoundSpec, ToneSpec } from '@shared/audio/audioEngine';
import { note } from '@shared/audio/notes';

/**
 * Every sound in Arena Fighters, written as data and synthesised when it plays, exactly as the
 * art is drawn in code rather than loaded from files.
 *
 * The fight has a voice of its own: a swing is air (filtered noise, high for a fist and wider
 * for a leg), a blow that lands is air plus a pitched thump that falls, and a block is the same
 * thump with the air taken out of it, so the ear can tell a hit from a guard without looking.
 * Anything a special move does is pitched, so specials stand out from normals. The announcer
 * has no voice, so the calls of the round are short horn jingles instead.
 */

/** A little tune: one note after another, `stepMs` apart. The announcer's whole vocabulary. */
function jingle(
  names: readonly (string | null)[],
  { stepMs, volume, wave = 'square', holdMs }: { stepMs: number; volume: number; wave?: ToneSpec['wave']; holdMs?: number },
): ToneSpec[] {
  return names.flatMap((name, index) =>
    name ? [{ wave, freq: note(name), durationMs: holdMs ?? stepMs, delayMs: index * stepMs, volume }] : [],
  );
}

export const SOUNDS = {
  // --- swings that find nothing ----------------------------------------
  /** A jab cutting the air: short, high and dry. */
  punchLight: {
    noise: [{ durationMs: 70, volume: 0.07, cutoffHz: 5200 }],
    tones: [{ wave: 'square', freq: 640, toFreq: 900, durationMs: 50, volume: 0.03 }],
  },
  /** A heavy punch moves more air and takes longer over it. */
  punchHeavy: {
    noise: [{ durationMs: 130, volume: 0.1, cutoffHz: 3400 }],
    tones: [{ wave: 'square', freq: 360, toFreq: 620, durationMs: 90, volume: 0.04 }],
  },
  /** A leg is broader than a fist, so a kick hisses lower and wider. */
  kickLight: {
    noise: [{ durationMs: 95, volume: 0.08, cutoffHz: 3000 }],
    tones: [{ wave: 'triangle', freq: 420, toFreq: 700, durationMs: 70, volume: 0.03 }],
  },
  kickHeavy: {
    noise: [{ durationMs: 165, volume: 0.11, cutoffHz: 2100 }],
    tones: [{ wave: 'triangle', freq: 240, toFreq: 480, durationMs: 120, volume: 0.05 }],
  },

  // --- blows that land --------------------------------------------------
  /** A clean smack: a crack of air over a thump that falls away. */
  hitLight: {
    noise: [{ durationMs: 55, volume: 0.16, cutoffHz: 4200 }],
    tones: [{ wave: 'square', freq: 520, toFreq: 190, durationMs: 90, volume: 0.12 }],
  },
  /** Something that really connects: lower, longer, with the floor in it. */
  hitHeavy: {
    noise: [
      { durationMs: 80, volume: 0.2, cutoffHz: 2600 },
      { durationMs: 180, delayMs: 40, volume: 0.09, cutoffHz: 700 },
    ],
    tones: [
      { wave: 'triangle', freq: 260, toFreq: 70, durationMs: 190, volume: 0.2 },
      { wave: 'square', freq: 180, toFreq: 60, durationMs: 130, volume: 0.08 },
    ],
  },
  /** Caught on the guard: the thump without the crack, and nothing left ringing. */
  block: {
    noise: [{ durationMs: 45, volume: 0.09, cutoffHz: 1100 }],
    tones: [{ wave: 'square', freq: 300, toFreq: 220, durationMs: 60, volume: 0.1 }],
  },

  // --- being moved about ------------------------------------------------
  /** Leaving the floor. */
  jump: {
    tones: [{ wave: 'square', freq: 300, toFreq: 620, durationMs: 120, volume: 0.05 }],
  },
  /** Landing on your feet: a scuff, no more. */
  land: {
    noise: [{ durationMs: 70, volume: 0.07, cutoffHz: 800 }],
  },
  /** Sent off your feet: a rising whoosh as the body turns over. */
  knockdown: {
    noise: [{ durationMs: 200, volume: 0.1, cutoffHz: 2400 }],
    tones: [{ wave: 'triangle', freq: 320, toFreq: 120, durationMs: 220, volume: 0.08 }],
  },
  /** And then the floor. */
  bodyDrop: {
    noise: [{ durationMs: 190, volume: 0.22, cutoffHz: 460 }],
    tones: [{ wave: 'triangle', freq: 110, toFreq: 48, durationMs: 200, volume: 0.16 }],
  },

  // --- throws -----------------------------------------------------------
  /** Hands closing on a shirt. */
  throwGrab: {
    noise: [{ durationMs: 60, volume: 0.12, cutoffHz: 1600 }],
    tones: [{ wave: 'square', freq: 200, toFreq: 320, durationMs: 80, volume: 0.09 }],
  },
  /** Both let go at once: two quick knocks, and nobody wins it. */
  throwBreak: {
    tones: [
      { wave: 'square', freq: 520, durationMs: 40, volume: 0.1 },
      { wave: 'square', freq: 660, durationMs: 55, delayMs: 70, volume: 0.1 },
    ],
    noise: [{ durationMs: 50, volume: 0.08, cutoffHz: 2600 }],
  },

  // --- what special moves do --------------------------------------------
  /** Something thrown, leaving the hand and running away from the ear. */
  projectileFire: {
    tones: [
      { wave: 'sawtooth', freq: 820, toFreq: 300, durationMs: 220, volume: 0.09 },
      { wave: 'square', freq: 410, toFreq: 150, durationMs: 220, volume: 0.05 },
    ],
    noise: [{ durationMs: 110, volume: 0.07, cutoffHz: 3600 }],
  },
  /** And where it lands. */
  projectileBurst: {
    noise: [
      { durationMs: 130, volume: 0.18, cutoffHz: 3000 },
      { durationMs: 260, delayMs: 60, volume: 0.1, cutoffHz: 800 },
    ],
    tones: [{ wave: 'triangle', freq: 220, toFreq: 60, durationMs: 250, volume: 0.12 }],
  },
  /** A rising special: up and out of trouble. */
  rising: {
    tones: [
      { wave: 'square', freq: 300, toFreq: 880, durationMs: 200, volume: 0.09 },
      { wave: 'triangle', freq: 150, toFreq: 440, durationMs: 220, volume: 0.07 },
    ],
  },
  /** A dash or a charge: everything sliding forward at once. */
  dash: {
    noise: [{ durationMs: 230, volume: 0.11, cutoffHz: 1800 }],
    tones: [{ wave: 'sawtooth', freq: 180, toFreq: 420, durationMs: 210, volume: 0.06 }],
  },
  /** Dropping out of the sky. */
  dive: {
    tones: [{ wave: 'sawtooth', freq: 900, toFreq: 180, durationMs: 300, volume: 0.08 }],
    noise: [{ durationMs: 180, delayMs: 60, volume: 0.08, cutoffHz: 4000 }],
  },
  /** Going somewhere else entirely: the sound leaves before the fighter does. */
  teleport: {
    tones: [
      { wave: 'sine', freq: 1200, toFreq: 220, durationMs: 180, volume: 0.09 },
      { wave: 'sine', freq: 300, toFreq: 1400, durationMs: 200, delayMs: 160, volume: 0.07 },
    ],
    noise: [{ durationMs: 120, volume: 0.05, cutoffHz: 6000 }],
  },
  /** A stance taken up, waiting for something to answer. */
  counter: {
    tones: [
      { wave: 'sine', freq: note('A5'), durationMs: 220, volume: 0.07 },
      { wave: 'sine', freq: note('E6'), durationMs: 280, delayMs: 60, volume: 0.05 },
    ],
  },
  /** Kicking off a wall. */
  wallLeap: {
    tones: [{ wave: 'square', freq: 220, toFreq: 760, durationMs: 150, volume: 0.08 }],
    noise: [{ durationMs: 60, volume: 0.08, cutoffHz: 1400 }],
  },
  /**
   * Health coming back: a short run up the scale, deliberately not the notes the announcer
   * uses for a round won, so that being healed is never mistaken for having won something.
   */
  heal: {
    tones: jingle(['G4', 'C5', 'D5', 'G5'], { stepMs: 70, volume: 0.07, wave: 'sine', holdMs: 220 }),
  },
  /** A command throw catching: heavier than a grab, because it is about to hurt. */
  commandThrow: {
    tones: [{ wave: 'triangle', freq: 170, toFreq: 300, durationMs: 140, volume: 0.13 }],
    noise: [{ durationMs: 90, volume: 0.14, cutoffHz: 1200 }],
  },

  // --- the announcer, who has horns instead of a voice ------------------
  /** The round being called, before the fighters are let go. */
  roundCall: {
    tones: jingle(['G4', 'C5', 'E5'], { stepMs: 130, volume: 0.09, holdMs: 200 }),
  },
  /** FIGHT: two notes, and no more waiting. */
  fightCall: {
    tones: [
      ...jingle(['G5'], { stepMs: 90, volume: 0.11, holdMs: 90 }),
      ...jingle([null, 'C6'], { stepMs: 90, volume: 0.12, holdMs: 320 }),
    ],
  },
  /** A knockout: everything at once, then the room falling quiet. */
  koCall: {
    tones: [
      { wave: 'square', freq: note('C5'), toFreq: note('C3'), durationMs: 520, volume: 0.13 },
      { wave: 'triangle', freq: note('C4'), toFreq: note('C2'), durationMs: 560, volume: 0.12 },
    ],
    noise: [{ durationMs: 320, volume: 0.16, cutoffHz: 900 }],
  },
  /** Time: a flat, unhappy pair of notes. */
  timeUpCall: {
    tones: [
      { wave: 'sawtooth', freq: note('A#4'), durationMs: 300, volume: 0.09 },
      { wave: 'sawtooth', freq: note('A4'), durationMs: 420, delayMs: 300, volume: 0.09 },
    ],
  },
  /** A round taken. */
  roundWinCall: {
    tones: jingle(['C5', 'E5', 'G5', 'C6'], { stepMs: 110, volume: 0.09, holdMs: 240 }),
  },
  /** The match taken: the same idea, but it goes somewhere. */
  matchWinCall: {
    tones: [
      ...jingle(['C5', 'E5', 'G5', 'C6', null, 'G5', 'C6'], { stepMs: 130, volume: 0.09, holdMs: 220 }),
      ...jingle([null, null, null, null, null, null, 'E6'], { stepMs: 130, volume: 0.08, holdMs: 620 }),
    ],
  },
  /** Nobody took it. */
  drawCall: {
    tones: [
      { wave: 'square', freq: note('D#5'), durationMs: 260, volume: 0.09 },
      { wave: 'square', freq: note('D5'), durationMs: 520, delayMs: 260, volume: 0.09 },
    ],
  },

  // --- screens ----------------------------------------------------------
  /** The highlight moving down a menu, or a cursor moving across the grid. */
  menuMove: {
    tones: [{ wave: 'square', freq: 520, durationMs: 45, volume: 0.06 }],
  },
  confirm: {
    tones: [
      { wave: 'square', freq: note('E5'), durationMs: 55, volume: 0.08 },
      { wave: 'square', freq: note('B5'), durationMs: 130, delayMs: 55, volume: 0.08 },
    ],
  },
  back: {
    tones: [
      { wave: 'square', freq: note('B4'), durationMs: 55, volume: 0.07 },
      { wave: 'square', freq: note('E4'), durationMs: 120, delayMs: 55, volume: 0.07 },
    ],
  },
  /** A fighter settled on: heavier than a confirm, because it cannot be taken back lightly. */
  lockIn: {
    tones: jingle(['E5', 'A5', 'C#6'], { stepMs: 70, volume: 0.09, holdMs: 200 }),
    noise: [{ durationMs: 60, volume: 0.06, cutoffHz: 2000 }],
  },
  /** The two fighters put up against each other. */
  versusClash: {
    tones: [
      { wave: 'sawtooth', freq: note('A3'), toFreq: note('A4'), durationMs: 420, volume: 0.1 },
      { wave: 'square', freq: note('E4'), durationMs: 260, delayMs: 380, volume: 0.1 },
      { wave: 'square', freq: note('A4'), durationMs: 420, delayMs: 520, volume: 0.1 },
    ],
    noise: [{ durationMs: 220, delayMs: 380, volume: 0.1, cutoffHz: 2400 }],
  },
  /** One second gone from the arcade continue count. */
  continueTick: {
    tones: [{ wave: 'square', freq: note('A5'), durationMs: 70, volume: 0.07 }],
  },
  /** A room opened, or joined: the line is live. */
  connected: {
    tones: jingle(['D5', 'A5', 'D6'], { stepMs: 80, volume: 0.08, holdMs: 220 }),
  },
  /** Something online went wrong. */
  netFailed: {
    tones: [
      { wave: 'sawtooth', freq: note('D4'), durationMs: 180, volume: 0.09 },
      { wave: 'sawtooth', freq: note('G#3'), durationMs: 380, delayMs: 180, volume: 0.09 },
    ],
  },
} as const satisfies Readonly<Record<string, SoundSpec>>;

export type SoundName = keyof typeof SOUNDS;
