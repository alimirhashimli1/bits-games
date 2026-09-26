import type { MusicTrack } from '@shared/audio/music';

import { DESERT_HEATWAVE } from './songs/desertHeatwave';
import { MIDNIGHT_NEON } from './songs/midnightNeon';
import { SEA_BREEZE_DRIVE } from './songs/seaBreezeDrive';

/** A song on the car radio: it loops for the whole race. */
export interface RadioSong {
  readonly title: string;
  /** Where it is on the FM dial, in megahertz. */
  readonly frequency: number;
  readonly music: MusicTrack;
}

/** The ends of the FM dial, in megahertz. */
export const FM_BAND = { low: 88, high: 108 } as const;

/** The three original songs the driver can pick before the start. */
export const RADIO_SONGS: readonly RadioSong[] = [
  { title: 'SEA BREEZE DRIVE', frequency: 89.3, music: SEA_BREEZE_DRIVE },
  { title: 'MIDNIGHT NEON', frequency: 97.7, music: MIDNIGHT_NEON },
  { title: 'DESERT HEATWAVE', frequency: 104.5, music: DESERT_HEATWAVE },
];
