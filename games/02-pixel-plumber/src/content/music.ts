import { line, type MusicTrack } from '@shared/audio/music';

import { MUSIC } from '../config';

/**
 * Pixel Plumber's loops, all original: a square-wave tune over a triangle bass, one for each
 * world, one for the Sludge Baron's hall, and one each for the title and the ending. Each is
 * 32 steps long, except the boss loop, which goes round twice as often.
 */

const LEAD = { wave: 'square', volume: 0.09 } as const;
const BASS = { wave: 'triangle', volume: 0.14, steps: 2 } as const;

/** The title: an easy walk in C, with the bass on the beat. */
export const TITLE_MUSIC: MusicTrack = {
  stepMs: 190,
  steps: 32,
  notes: [
    ...line(
      ['C5', null, 'E5', 'G5', null, 'E5', 'D5', null, 'C5', null, 'A4', 'G4', null, null, null, null,
        'F4', null, 'A4', 'C5', null, 'B4', 'A4', null, 'G4', null, 'D5', null, 'C5', null, null, null],
      LEAD,
    ),
    ...line(
      ['C3', null, 'G2', null, 'C3', null, 'G2', null, 'A2', null, 'E2', null, 'A2', null, 'E2', null,
        'F2', null, 'C3', null, 'F2', null, 'C3', null, 'G2', null, 'D3', null, 'G2', null, 'B2', null],
      BASS,
    ),
  ],
};

/** World 1, the streets: bright and bouncy, in C major. */
export const STREETS_MUSIC: MusicTrack = {
  stepMs: 125,
  steps: 32,
  notes: [
    ...line(
      ['E5', null, 'G5', 'E5', 'C5', null, 'D5', 'E5', 'F5', null, 'E5', 'D5', 'C5', null, 'G4', null,
        'A4', null, 'C5', 'A4', 'G4', null, 'E4', 'G4', 'F4', 'G4', 'A4', 'B4', 'C5', null, null, null],
      LEAD,
    ),
    ...line(
      ['C3', null, 'G3', null, 'C3', null, 'G3', null, 'F2', null, 'C3', null, 'F2', null, 'C3', null,
        'A2', null, 'E3', null, 'A2', null, 'E3', null, 'G2', null, 'D3', null, 'G2', null, 'B2', null],
      BASS,
    ),
  ],
};

/** World 2, the sewers: sparse and low, in A minor, with room for the drips. */
export const SEWERS_MUSIC: MusicTrack = {
  stepMs: 160,
  steps: 32,
  notes: [
    ...line(
      ['A4', null, null, 'C5', null, 'B4', null, 'G4', null, null, 'A4', null, 'E4', null, null, null,
        'F4', null, null, 'A4', null, 'G4', null, 'E4', null, null, 'D4', null, 'E4', null, null, null],
      { wave: 'square', volume: 0.08 },
    ),
    ...line(
      ['A2', null, 'A3', null, 'A2', null, 'A3', null, 'A2', null, 'A3', null, 'G2', null, 'G3', null,
        'F2', null, 'F3', null, 'F2', null, 'F3', null, 'E2', null, 'E3', null, 'E2', null, 'G#2', null],
      BASS,
    ),
  ],
};

/** World 3, the rooftops at dusk: a longer, swinging line in F. */
export const ROOFTOPS_MUSIC: MusicTrack = {
  stepMs: 145,
  steps: 32,
  notes: [
    ...line(
      ['A4', 'C5', 'F5', null, 'E5', 'C5', 'D5', null, 'C5', 'A4', 'G4', null, 'A4', null, null, null,
        'A#4', 'D5', 'F5', null, 'E5', 'D5', 'C5', null, 'A4', 'G4', 'F4', null, 'G4', null, null, null],
      LEAD,
    ),
    ...line(
      ['F2', null, 'C3', null, 'F2', null, 'C3', null, 'D2', null, 'A2', null, 'D2', null, 'A2', null,
        'A#2', null, 'F3', null, 'A#2', null, 'F3', null, 'C3', null, 'G2', null, 'C3', null, 'E2', null],
      BASS,
    ),
  ],
};

/** World 4, the boiler works: tense, in E minor, with the bass pumping like a piston. */
export const BOILER_MUSIC: MusicTrack = {
  stepMs: 120,
  steps: 32,
  notes: [
    ...line(
      ['E4', null, 'E4', 'G4', 'F#4', null, 'E4', null, 'B3', null, 'E4', null, 'D#4', null, null, null,
        'E4', null, 'E4', 'A4', 'G4', null, 'F#4', null, 'E4', null, 'D#4', 'E4', 'B3', null, null, null],
      LEAD,
    ),
    ...line(
      ['E2', 'E3', 'E2', 'E3', 'E2', 'E3', 'E2', 'E3', 'C2', 'C3', 'C2', 'C3', 'B1', 'B2', 'B1', 'B2',
        'E2', 'E3', 'E2', 'E3', 'A1', 'A2', 'A1', 'A2', 'C2', 'C3', 'B1', 'B2', 'B1', 'B2', 'B1', 'B2'],
      { wave: 'triangle', volume: 0.14 },
    ),
  ],
};

/** The Sludge Baron's hall: short, fast and leaning on the note a semitone up. */
export const BOSS_MUSIC: MusicTrack = {
  stepMs: 105,
  steps: 16,
  notes: [
    ...line(
      ['E4', 'F4', 'E4', 'B3', 'E4', 'F4', 'G4', 'F4', 'E4', 'F4', 'E4', 'B3', 'D4', 'C4', 'B3', null],
      { wave: 'square', volume: 0.09 },
    ),
    ...line(['E2', null, 'E2', null, 'F2', null, 'E2', null, 'E2', null, 'E2', null, 'B1', null, 'C2', null], BASS),
  ],
};

/** The ending: warm and slow, in C, while the town lights up. */
export const ENDING_MUSIC: MusicTrack = {
  stepMs: 230,
  steps: 32,
  notes: [
    ...line(
      ['E5', null, 'D5', 'C5', 'D5', null, 'E5', null, 'G5', null, 'E5', null, 'D5', null, null, null,
        'C5', null, 'D5', 'E5', 'F5', null, 'E5', 'D5', 'C5', null, 'G4', null, 'C5', null, null, null],
      LEAD,
    ),
    ...line(
      ['C3', null, null, null, 'A2', null, null, null, 'F2', null, null, null, 'G2', null, null, null,
        'C3', null, null, null, 'A2', null, null, null, 'F2', null, null, null, 'G2', null, 'C3', null],
      { wave: 'triangle', volume: 0.14, steps: 4 },
    ),
  ],
};

/** Each world's loop, by its number. */
export const WORLD_MUSIC: Readonly<Record<string, MusicTrack>> = {
  '1': STREETS_MUSIC,
  '2': SEWERS_MUSIC,
  '3': ROOFTOPS_MUSIC,
  '4': BOILER_MUSIC,
};

const hurriedTracks = new WeakMap<MusicTrack, MusicTrack>();

/**
 * The same loop played faster, for when the clock runs low. Always the same object for the
 * same track, because the player carries on with a track it is already playing and restarts
 * for a new one.
 */
export function hurried(track: MusicTrack): MusicTrack {
  const known = hurriedTracks.get(track);
  if (known) return known;
  const faster = { ...track, stepMs: track.stepMs / MUSIC.hurryTempo };
  hurriedTracks.set(track, faster);
  return faster;
}
