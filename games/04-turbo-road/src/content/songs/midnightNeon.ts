import { beat, type MusicTrack, phrase } from '@shared/audio/music';

import { BACKBEAT_SNARE, KICK, SNARE, STRAIGHT_KICK } from './drumKit';

const BARS = 4;
const STEPS_PER_BAR = 16;

/** Night-time synth, in A minor over A minor, F, C and G: a rippling arpeggio under a slow tune. */
export const MIDNIGHT_NEON: MusicTrack = {
  stepMs: 125,
  steps: BARS * STEPS_PER_BAR,
  notes: [
    ...phrase(
      `E5 - - - - - D5 - C5 - - - B4 - A4 -
       C5 - - - - - - - A4 - C5 - F5 - - -
       E5 - - - G5 - - - E5 - D5 - C5 - - -
       D5 - - - - - - - B4 - - - G4 - - -`,
      { wave: 'square', volume: 0.07 },
    ),
    ...phrase(
      `A4 C5 E5 C5 A4 C5 E5 C5 A4 C5 E5 C5 A4 C5 E5 C5
       F4 A4 C5 A4 F4 A4 C5 A4 F4 A4 C5 A4 F4 A4 C5 A4
       G4 C5 E5 C5 G4 C5 E5 C5 G4 C5 E5 C5 G4 C5 E5 C5
       G4 B4 D5 B4 G4 B4 D5 B4 G4 B4 D5 B4 G4 B4 D5 B4`,
      { wave: 'sawtooth', volume: 0.03 },
    ),
    ...phrase(
      `A2 . A2 . A2 . A2 . A2 . A2 . A2 . A2 .
       F2 . F2 . F2 . F2 . F2 . F2 . F2 . F2 .
       C3 . C3 . C3 . C3 . C3 . C3 . C3 . C3 .
       G2 . G2 . G2 . G2 . G2 . G2 . G2 . G2 .`,
      { wave: 'triangle', volume: 0.16 },
    ),
  ],
  hits: [...beat(STRAIGHT_KICK.repeat(BARS), KICK), ...beat(BACKBEAT_SNARE.repeat(BARS), SNARE)],
};
