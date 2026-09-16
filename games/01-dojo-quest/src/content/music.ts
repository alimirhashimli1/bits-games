import { line, type MusicTrack } from '@shared/audio/music';

/**
 * The game's three loops, all in A minor so they sit together, and all sixteen steps long.
 * Each is a melody line over a slower bass line.
 */

/** Title, and again over the rescue: slow, and in no hurry. */
export const TITLE_MUSIC: MusicTrack = {
  stepMs: 220,
  steps: 16,
  notes: [
    ...line(
      ['A4', null, 'C5', null, 'B4', null, 'E4', null, 'A4', null, 'G4', null, 'E4', null, null, null],
      { wave: 'square', volume: 0.12 },
    ),
    ...line([ 'A2', null, null, null, 'E2', null, null, null, 'F2', null, null, null, 'E2', null, null, null], {
      wave: 'triangle',
      volume: 0.14,
      steps: 4,
    }),
  ],
};

/** The climb: the same key, but walking. */
export const CLIMB_MUSIC: MusicTrack = {
  stepMs: 140,
  steps: 16,
  notes: [
    ...line(
      ['A4', 'E4', 'A4', 'C5', 'B4', 'E4', 'B4', 'D5', 'C5', 'E4', 'C5', 'E5', 'B4', 'G4', 'E4', 'D4'],
      { wave: 'square', volume: 0.1 },
    ),
    ...line([ 'A2', null, null, null, 'E2', null, null, null, 'F2', null, null, null, 'G2', null, null, null], {
      wave: 'triangle',
      volume: 0.13,
      steps: 4,
    }),
  ],
};

/** The throne room: faster, lower, and it leans on the flattened second. */
export const BOSS_MUSIC: MusicTrack = {
  stepMs: 110,
  steps: 16,
  notes: [
    ...line(
      ['A3', 'A#3', 'A3', 'E3', 'A3', 'A#3', 'C4', 'A#3', 'A3', 'A#3', 'A3', 'E3', 'G3', 'F3', 'E3', null],
      { wave: 'square', volume: 0.11 },
    ),
    ...line([ 'A1', null, 'A1', null, 'A#1', null, 'A1', null, 'A1', null, 'A1', null, 'E1', null, 'F1', null], {
      wave: 'triangle',
      volume: 0.15,
      steps: 2,
    }),
  ],
};
