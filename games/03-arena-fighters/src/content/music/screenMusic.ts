import { line, type MusicTrack } from '@shared/audio/music';

import { BASS, HARMONY, LEAD, LONG_DRONE, LOOP_STEPS, PULSE_BASS, SOFT_LEAD } from './voices';

/**
 * The loops for the screens between fights. They are deliberately plainer than the arena loops:
 * these play while somebody is reading or choosing, and the tournament itself should still be
 * the loudest thing in the game.
 */

/** The title: the tournament's own theme, in C minor, in no hurry at all. */
export const TITLE_MUSIC: MusicTrack = {
  stepMs: 200,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['C5', null, null, 'D#5', null, null, 'G5', null, 'F5', null, 'D#5', null, 'D5', null, null, null,
        'G#4', null, null, 'C5', null, null, 'D#5', null, 'D5', null, 'C5', null, null, null, null, null],
      LEAD,
    ),
    ...line(
      ['C2', null, 'G2', null, 'C2', null, 'G2', null, 'G#1', null, 'D#2', null, 'G#1', null, 'D#2', null,
        'A#1', null, 'F2', null, 'A#1', null, 'F2', null, 'G1', null, 'D2', null, 'G1', null, 'B1', null],
      BASS,
    ),
  ],
};

/**
 * Choosing: the mode, the fighter, the arena, and the online lobby. It has somewhere to be, so
 * that walking the grid feels like something before a fight rather than a pause in one.
 */
export const SELECT_MUSIC: MusicTrack = {
  stepMs: 125,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['A4', 'C5', 'E5', 'A5', null, 'G5', 'E5', null, 'F5', null, 'E5', 'C5', 'D5', null, 'B4', null,
        'C5', 'E5', 'G5', 'C6', null, 'B5', 'G5', null, 'A5', null, 'E5', null, 'A4', null, null, null],
      LEAD,
    ),
    ...line(
      ['A1', 'A1', 'A2', 'A1', 'E2', null, 'A2', null, 'F1', 'F1', 'F2', 'F1', 'C2', null, 'F2', null,
        'C2', 'C2', 'C3', 'C2', 'G2', null, 'C3', null, 'E2', 'E2', 'E3', 'E2', 'B2', null, 'G#2', null],
      PULSE_BASS,
    ),
  ],
};

/** The VS screen: sixteen steps of nothing but a rising line and a heartbeat under it. */
export const VERSUS_MUSIC: MusicTrack = {
  stepMs: 130,
  steps: 16,
  notes: [
    ...line(
      ['A4', null, 'C5', null, 'E5', null, 'F5', null, 'E5', null, 'C5', null, 'A4', null, 'G#4', null],
      LEAD,
    ),
    ...line(['A1', 'A1', null, null, 'A1', 'A1', null, null, 'F1', 'F1', null, null, 'E1', 'E1', null, null], PULSE_BASS),
  ],
};

/** A fighter's story, before the ladder and after the boss: quiet, and out of the way of the words. */
export const STORY_MUSIC: MusicTrack = {
  stepMs: 240,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['A4', null, null, null, 'C5', null, null, null, 'B4', null, null, 'A4', null, null, null, null,
        'G4', null, null, null, 'E4', null, null, null, 'G4', null, null, 'A4', null, null, null, null],
      SOFT_LEAD,
    ),
    ...line(
      ['A1', null, null, null, null, null, null, null, 'F1', null, null, null, null, null, null, null,
        'C2', null, null, null, null, null, null, null, 'E1', null, null, null, null, null, null, null],
      LONG_DRONE,
    ),
  ],
};

/** The results: the fight is over, and this is the room emptying out. */
export const RESULTS_MUSIC: MusicTrack = {
  stepMs: 180,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['F5', null, 'A5', null, 'C6', null, 'A5', 'F5', 'G5', null, null, 'E5', null, null, null, null,
        'D5', null, 'F5', null, 'A5', null, 'G5', 'F5', 'C5', null, null, null, 'F5', null, null, null],
      LEAD,
    ),
    ...line(
      ['F2', null, 'C3', null, 'F2', null, 'C3', null, 'C2', null, 'G2', null, 'C2', null, 'G2', null,
        'A#1', null, 'F2', null, 'A#1', null, 'F2', null, 'F2', null, 'C3', null, 'F2', null, 'A2', null],
      BASS,
    ),
  ],
};

/** The arcade continue count: a loop with a clock in it, going round faster than is comfortable. */
export const CONTINUE_MUSIC: MusicTrack = {
  stepMs: 115,
  steps: 16,
  notes: [
    ...line(['D5', null, 'D#5', null, 'D5', null, 'A#4', null, 'D5', null, 'D#5', null, 'F5', null, 'E5', null], LEAD),
    ...line(['A#4', null, null, null, 'A#4', null, null, null, 'A4', null, null, null, 'A4', null, null, null], HARMONY),
    ...line(['D2', 'D2', null, 'D2', 'D2', 'D2', null, 'D2', 'A#1', 'A#1', null, 'A#1', 'A1', 'A1', null, 'A1'], PULSE_BASS),
  ],
};
