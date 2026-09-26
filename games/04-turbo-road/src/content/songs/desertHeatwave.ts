import { beat, type MusicTrack, phrase } from '@shared/audio/music';

import { BACKBEAT_SNARE, HAT, KICK, SNARE, STRAIGHT_KICK } from './drumKit';

const BARS = 4;
const STEPS_PER_BAR = 16;
/** A hat on every eighth note, for drive. */
const EIGHTH_HAT = 'x.x. x.x. x.x. x.x.';

/** Hard and fast, in E minor over E, E, C and D: a galloping bass under a guitar-like riff. */
export const DESERT_HEATWAVE: MusicTrack = {
  stepMs: 105,
  steps: BARS * STEPS_PER_BAR,
  notes: [
    ...phrase(
      `E5 . E5 G5 . E5 A5 . G5 . E5 . D5 - E5 -
       B5 - - - A5 - G5 - A5 - - - E5 - - -
       G5 . G5 A5 . G5 E5 . C5 . E5 . G5 - - -
       F#5 - - - E5 - D5 - F#5 - A5 - B5 - - -`,
      { wave: 'square', volume: 0.07 },
    ),
    ...phrase(
      `E2 . E2 E2 E2 . E2 E2 E2 . E2 E2 G2 . A2 .
       E2 . E2 E2 E2 . E2 E2 E2 . E2 E2 G2 . A2 .
       C3 . C3 C3 C3 . C3 C3 C3 . C3 C3 B2 . G2 .
       D3 . D3 D3 D3 . D3 D3 D3 . D3 D3 F#3 . D3 .`,
      { wave: 'sawtooth', volume: 0.07 },
    ),
  ],
  hits: [
    ...beat(STRAIGHT_KICK.repeat(BARS), KICK),
    ...beat(BACKBEAT_SNARE.repeat(BARS), SNARE),
    ...beat(EIGHTH_HAT.repeat(BARS), HAT),
  ],
};
