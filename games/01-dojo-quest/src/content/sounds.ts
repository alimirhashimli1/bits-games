import type { SoundSpec } from '@shared/audio/audioEngine';
import { note } from '@shared/audio/notes';

/**
 * Every sound in Dojo Quest, written as data and synthesised at run time.
 *
 * The shapes follow the action: strikes fall in pitch, blocks are short and bright, and
 * anything wooden or iron carries a burst of filtered noise.
 */
export const SOUNDS = {
  /** The swing itself, before anything connects. */
  swingPunch: {
    tones: [{ wave: 'sawtooth', freq: 340, toFreq: 120, durationMs: 90, volume: 0.1 }],
    noise: [{ durationMs: 70, volume: 0.05, cutoffHz: 1600 }],
  },
  swingKick: {
    tones: [{ wave: 'sawtooth', freq: 260, toFreq: 90, durationMs: 130, volume: 0.12 }],
    noise: [{ durationMs: 110, volume: 0.06, cutoffHz: 1100 }],
  },
  /** A clean hit: a low thump with a crack on top. */
  hit: {
    tones: [{ wave: 'square', freq: 200, toFreq: 60, durationMs: 130, volume: 0.24 }],
    noise: [{ durationMs: 110, volume: 0.2, cutoffHz: 900 }],
  },
  /** Stopped on the guard: brighter, shorter, and it does not fall away. */
  block: {
    tones: [{ wave: 'square', freq: 540, toFreq: 430, durationMs: 70, volume: 0.16 }],
    noise: [{ durationMs: 60, volume: 0.12, cutoffHz: 3200 }],
  },
  knockout: {
    tones: [
      { wave: 'square', freq: 300, toFreq: 60, durationMs: 420, volume: 0.26 },
      { wave: 'triangle', freq: 160, toFreq: 40, durationMs: 500, delayMs: 70, volume: 0.2 },
    ],
    noise: [{ durationMs: 220, volume: 0.18, cutoffHz: 500 }],
  },
  footstep: {
    noise: [{ durationMs: 45, volume: 0.06, cutoffHz: 700 }],
  },
  /** Fists coming up or going down. */
  stance: {
    tones: [{ wave: 'square', freq: 440, toFreq: 640, durationMs: 70, volume: 0.1 }],
  },
  /** The highlight moving down a menu. */
  menuMove: {
    tones: [{ wave: 'square', freq: note('E5'), durationMs: 40, volume: 0.1 }],
  },
  confirm: {
    tones: [
      { wave: 'square', freq: note('C5'), durationMs: 70, volume: 0.16 },
      { wave: 'square', freq: note('G5'), durationMs: 110, delayMs: 70, volume: 0.16 },
    ],
  },
  /** One letter of story text. Very quiet: it plays many times a second. */
  type: {
    tones: [{ wave: 'square', freq: 900, durationMs: 16, volume: 0.04 }],
  },
  /** Iron that holds. */
  cageHit: {
    tones: [{ wave: 'square', freq: 280, toFreq: 190, durationMs: 140, volume: 0.2 }],
    noise: [{ durationMs: 120, volume: 0.16, cutoffHz: 2800 }],
  },
  /** Iron that does not. */
  cageBreak: {
    tones: [
      { wave: 'square', freq: 220, toFreq: 70, durationMs: 300, volume: 0.24 },
      { wave: 'sawtooth', freq: 480, toFreq: 120, durationMs: 380, delayMs: 60, volume: 0.16 },
    ],
    noise: [
      { durationMs: 300, volume: 0.2, cutoffHz: 3600 },
      { durationMs: 220, delayMs: 140, volume: 0.16, cutoffHz: 700 },
    ],
  },
  /** The portcullis coming down. */
  gateSlam: {
    tones: [{ wave: 'square', freq: 150, toFreq: 45, durationMs: 280, volume: 0.28 }],
    noise: [{ durationMs: 240, volume: 0.24, cutoffHz: 600 }],
  },
  /** The hawk, on its way in. */
  hawkCry: {
    tones: [
      { wave: 'sawtooth', freq: 1500, toFreq: 800, durationMs: 160, volume: 0.1 },
      { wave: 'sawtooth', freq: 1300, toFreq: 650, durationMs: 150, delayMs: 130, volume: 0.09 },
    ],
  },
  /** Kenji walks Mei out of the fortress. */
  victorySting: {
    tones: [
      { wave: 'square', freq: note('C4'), durationMs: 130, volume: 0.2 },
      { wave: 'square', freq: note('E4'), durationMs: 130, delayMs: 130, volume: 0.2 },
      { wave: 'square', freq: note('G4'), durationMs: 130, delayMs: 260, volume: 0.2 },
      { wave: 'square', freq: note('C5'), durationMs: 420, delayMs: 390, volume: 0.22 },
      { wave: 'triangle', freq: note('C3'), durationMs: 800, delayMs: 390, volume: 0.16 },
    ],
  },
  defeatSting: {
    tones: [
      { wave: 'square', freq: note('G3'), durationMs: 200, volume: 0.2 },
      { wave: 'square', freq: note('E3'), durationMs: 200, delayMs: 200, volume: 0.2 },
      { wave: 'square', freq: note('C3'), durationMs: 620, delayMs: 400, volume: 0.22 },
      { wave: 'triangle', freq: note('C2'), durationMs: 900, delayMs: 400, volume: 0.18 },
    ],
  },
} as const satisfies Record<string, SoundSpec>;
