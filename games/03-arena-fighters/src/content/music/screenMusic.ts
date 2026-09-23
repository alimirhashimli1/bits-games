import { line, type MusicTrack } from '@shared/audio/music';

import { BASS, HARMONY, LEAD, LONG_DRONE, LOOP_STEPS, PULSE_BASS, SOFT_LEAD } from './voices';

/**
 * The loops for the screens between fights. Most of them are deliberately plainer than the arena
 * loops: they play while somebody is reading, and the tournament itself should still be the
 * loudest thing in the game. Choosing is the exception, since picking a fighter is part of the
 * build-up rather than a wait, and its loop is written to sound like one.
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
 * Choosing: the mode, the fighter, the arena, and the online lobby. A fanfare in D minor over a
 * marching bass, a bar to each chord: the home chord, the one below it, the one below that, and
 * then the dominant with the leading note in it, which will not sit still and drags the loop
 * round to the start again. Slower than the tune it replaced, and pitched to sound like the
 * tournament being announced rather than a menu waiting to be got through.
 *
 * The tune and the harmony under it both ring on past their step, the way a horn does, which
 * is what keeps a fanfare from sounding like a list of notes.
 */
export const SELECT_MUSIC: MusicTrack = {
  stepMs: 150,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['D5', null, 'A5', null, 'D6', null, null, 'C6',
        'A#5', null, null, 'A5', null, 'F5', null, null,
        'C6', null, null, 'A5', null, 'C6', null, 'D6',
        'A5', null, 'G5', null, 'F5', null, 'E5', null],
      { ...LEAD, steps: 2 },
    ),
    ...line(
      ['A4', null, null, null, 'F5', null, null, null,
        'F4', null, null, null, 'D5', null, null, null,
        'A4', null, null, null, 'F5', null, null, null,
        'E4', null, null, null, 'C#5', null, null, null],
      { ...HARMONY, steps: 4 },
    ),
    ...line(
      ['D2', null, 'D2', null, 'A2', null, 'D2', null,
        'A#1', null, 'A#1', null, 'F2', null, 'A#1', null,
        'F1', null, 'F1', null, 'C2', null, 'F2', null,
        'A1', null, 'A1', null, 'E2', null, 'A1', null],
      BASS,
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
