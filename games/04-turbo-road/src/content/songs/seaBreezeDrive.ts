import { beat, type MusicTrack, phrase } from '@shared/audio/music';

import { BACKBEAT_SNARE, HAT, KICK, OFFBEAT_HAT, SNARE, STRAIGHT_KICK } from './drumKit';

/** Four bars of sixteen steps. */
const BARS = 4;
const STEPS_PER_BAR = 16;

/** Sunny and easy, in C major, over C, A minor, F and G. */
export const SEA_BREEZE_DRIVE: MusicTrack = {
  stepMs: 115,
  steps: BARS * STEPS_PER_BAR,
  notes: [
    ...phrase(
      `E5 - G5 - C6 - B5 A5 G5 - E5 - D5 - C5 -
       A5 - - - G5 - E5 - C5 - E5 - A4 - - -
       F5 - A5 - C6 - A5 - G5 - F5 - E5 - C5 -
       D5 - E5 - G5 - - - B4 - D5 - G5 - - -`,
      { wave: 'square', volume: 0.07 },
    ),
    ...phrase(
      `C3 . C3 . G2 . C3 . C3 . G2 . C3 . G2 .
       A2 . A2 . E3 . A2 . A2 . E3 . A2 . E3 .
       F2 . F2 . C3 . F2 . F2 . C3 . F2 . C3 .
       G2 . G2 . D3 . G2 . G2 . D3 . G2 . D3 .`,
      { wave: 'triangle', volume: 0.16 },
    ),
  ],
  hits: [
    ...beat(STRAIGHT_KICK.repeat(BARS), KICK),
    ...beat(BACKBEAT_SNARE.repeat(BARS), SNARE),
    ...beat(OFFBEAT_HAT.repeat(BARS), HAT),
  ],
};
