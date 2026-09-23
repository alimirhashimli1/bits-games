import { line, type MusicTrack } from '@shared/audio/music';

import type { ArenaId } from '../arenas/arenaTypes';
import { BASS, DRONE_BASS, HARMONY, LEAD, LONG_DRONE, LOOP_STEPS, PULSE_BASS, SOFT_LEAD } from './voices';

/**
 * A loop for each of the sixteen arenas, all original. Each is thirty-two steps long and made
 * of a tune over a bass, and each takes its character from the place it is fought in: the key,
 * the speed and how much room is left between the notes.
 *
 * They are written to be gone round for the length of a match without wearing, so none of them
 * is busier than the fight in front of it, and the last step of each leads back to the first.
 */

/** Harbour docks at dusk, Brand's home: a slow D minor swell, like water under the boards. */
const DOCKS: MusicTrack = {
  stepMs: 165,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['D5', null, 'F5', null, 'A5', null, 'G5', 'F5', 'E5', null, null, 'D5', null, null, null, null,
        'C5', null, 'E5', null, 'G5', null, 'F5', 'E5', 'D5', null, 'A4', null, 'D5', null, null, null],
      LEAD,
    ),
    ...line(
      ['D2', null, 'D3', null, 'D2', null, 'A2', null, 'A#1', null, 'A#2', null, 'A#1', null, 'F2', null,
        'C2', null, 'C3', null, 'C2', null, 'G2', null, 'D2', null, 'D3', null, 'A2', null, 'C3', null],
      BASS,
    ),
  ],
};

/** Festival plaza with lanterns, Tala's: quick and dancing, in A major. */
const PLAZA: MusicTrack = {
  stepMs: 130,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['A4', 'B4', 'C#5', 'E5', 'A5', null, 'G#5', 'F#5', 'E5', null, 'C#5', 'E5', 'D5', null, 'B4', null,
        'C#5', 'D5', 'E5', 'F#5', 'A5', null, 'G#5', 'E5', 'F#5', null, 'E5', 'C#5', 'A4', null, 'B4', null],
      LEAD,
    ),
    ...line(
      ['A2', null, 'E3', null, 'A2', null, 'E3', null, 'F#2', null, 'C#3', null, 'F#2', null, 'C#3', null,
        'D2', null, 'A2', null, 'D2', null, 'A2', null, 'E2', null, 'B2', null, 'E2', null, 'G#2', null],
      BASS,
    ),
  ],
};

/** Mountain mine, Grom's: slow, low and heavy, with the hammer falling on the beat. */
const MINE: MusicTrack = {
  stepMs: 210,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['E4', null, null, null, 'G4', null, 'E4', null, 'B4', null, null, null, 'A4', null, 'G4', null,
        'E4', null, null, null, 'D4', null, 'E4', null, 'G4', null, null, null, 'E4', null, null, null],
      SOFT_LEAD,
    ),
    ...line(
      ['E2', null, 'E2', null, 'E2', null, 'B1', null, 'C2', null, 'C2', null, 'C2', null, 'G1', null,
        'D2', null, 'D2', null, 'D2', null, 'A1', null, 'E2', null, 'E2', null, 'B1', null, 'B1', null],
      BASS,
    ),
  ],
};

/** Power station, Nova's: fast broken chords in B minor, running like current. */
const POWER_STATION: MusicTrack = {
  stepMs: 110,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['B4', 'D5', 'F#5', 'B5', 'F#5', 'D5', 'B4', 'D5', 'A4', 'C#5', 'E5', 'A5', 'E5', 'C#5', 'A4', 'C#5',
        'G4', 'B4', 'D5', 'G5', 'D5', 'B4', 'G4', 'B4', 'F#4', 'A4', 'C#5', 'F#5', 'C#5', 'A4', 'F#4', 'A4'],
      LEAD,
    ),
    ...line(
      ['B1', null, 'B2', null, 'B1', null, 'B2', null, 'A1', null, 'A2', null, 'A1', null, 'A2', null,
        'G1', null, 'G2', null, 'G1', null, 'G2', null, 'F#1', null, 'F#2', null, 'F#1', null, 'F#2', null],
      BASS,
    ),
  ],
};

/** Bamboo forest, Kestrel's: five notes and a lot of air, over a held bass. */
const BAMBOO: MusicTrack = {
  stepMs: 175,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['G4', null, 'A4', null, 'B4', null, 'D5', null, 'E5', null, 'D5', null, 'B4', null, null, null,
        'A4', null, 'B4', null, 'D5', null, 'B4', null, 'G4', null, 'E4', null, 'G4', null, null, null],
      SOFT_LEAD,
    ),
    ...line(
      ['G2', null, null, null, 'D3', null, null, null, 'E2', null, null, null, 'B2', null, null, null,
        'C3', null, null, null, 'G2', null, null, null, 'D2', null, null, null, 'G2', null, null, null],
      DRONE_BASS,
    ),
  ],
};

/** Mountain monastery, Old Wen's: slow, modal and wide open. */
const MONASTERY: MusicTrack = {
  stepMs: 230,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['D4', null, null, null, 'F4', null, null, 'G4', null, null, 'A4', null, null, null, null, null,
        'C5', null, null, 'A4', null, null, 'G4', null, 'F4', null, null, 'D4', null, null, null, null],
      SOFT_LEAD,
    ),
    ...line(
      ['D2', null, null, null, null, null, null, null, 'A2', null, null, null, null, null, null, null,
        'C2', null, null, null, null, null, null, null, 'D2', null, null, null, null, null, null, null],
      LONG_DRONE,
    ),
  ],
};

/** Airfield hangar, Rook's: clipped and martial, in C minor. */
const HANGAR: MusicTrack = {
  stepMs: 140,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['C5', null, 'C5', 'D#5', 'G5', null, 'F5', 'D#5', 'D5', null, 'D5', 'F5', 'A#4', null, 'C5', null,
        'G#4', null, 'G#4', 'A#4', 'D#5', null, 'D5', 'C5', 'G4', null, 'A#4', null, 'C5', null, null, null],
      LEAD,
    ),
    ...line(
      ['C2', 'C2', null, 'C2', 'G2', null, 'C2', null, 'G#1', 'G#1', null, 'G#1', 'D#2', null, 'G#1', null,
        'A#1', 'A#1', null, 'A#1', 'F2', null, 'A#1', null, 'G1', 'G1', null, 'G1', 'D2', null, 'G2', null],
      PULSE_BASS,
    ),
  ],
};

/** Back-alley boxing gym, Knox's: an F blues that leans on the off-beats. */
const GYM: MusicTrack = {
  stepMs: 150,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['F4', null, 'G#4', 'A#4', null, 'B4', 'A#4', null, 'F4', null, 'A#4', null, 'C5', null, 'A#4', 'G#4',
        'F4', null, 'G#4', 'A#4', null, 'C5', 'D#5', null, 'C5', null, 'A#4', null, 'G#4', null, 'F4', null],
      LEAD,
    ),
    ...line(
      ['F2', null, 'C3', null, 'F2', null, 'C3', null, 'A#1', null, 'F2', null, 'A#1', null, 'F2', null,
        'F2', null, 'C3', null, 'F2', null, 'C3', null, 'C2', null, 'G2', null, 'A#1', null, 'F2', null],
      BASS,
    ),
  ],
};

/** Circus ring, Cometa's: a showman's march in G, all announcement and no doubt. */
const RING: MusicTrack = {
  stepMs: 135,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['G4', 'B4', 'D5', 'G5', null, 'F#5', 'G5', null, 'D5', null, 'B4', null, 'E5', null, 'D5', null,
        'C5', 'E5', 'G5', 'C6', null, 'B5', 'A5', null, 'G5', null, 'D5', null, 'G5', null, 'F#5', null],
      LEAD,
    ),
    ...line(
      ['G2', null, 'D3', null, 'G2', null, 'D3', null, 'E2', null, 'B2', null, 'E2', null, 'B2', null,
        'C2', null, 'G2', null, 'C2', null, 'G2', null, 'D2', null, 'A2', null, 'D2', null, 'F#2', null],
      BASS,
    ),
  ],
};

/** Sunken ruins, Sable's: F# minor, and the tune keeps brushing the note next to it. */
const RUINS: MusicTrack = {
  stepMs: 200,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['F#4', null, null, 'G4', null, null, 'F#4', null, 'C#5', null, null, 'B4', null, null, null, null,
        'A4', null, null, 'A#4', null, null, 'A4', null, 'F#4', null, null, 'E4', null, null, null, null],
      SOFT_LEAD,
    ),
    ...line(
      ['F#1', null, null, null, 'C#2', null, null, null, 'F#1', null, null, null, 'D2', null, null, null,
        'A1', null, null, null, 'E2', null, null, null, 'F#1', null, null, null, 'C#2', null, null, null],
      DRONE_BASS,
    ),
  ],
};

/** Iron foundry, Kanan's: A minor, driven along by a bass that never lets up. */
const FOUNDRY: MusicTrack = {
  stepMs: 120,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['A4', 'A4', null, 'C5', 'E5', null, 'D5', 'C5', 'A4', 'A4', null, 'G4', 'A4', null, null, null,
        'F4', 'F4', null, 'A4', 'C5', null, 'B4', 'A4', 'E4', 'E4', null, 'G4', 'A4', null, null, null],
      LEAD,
    ),
    ...line(
      ['A1', 'A1', 'A2', 'A1', 'A1', 'A1', 'A2', 'A1', 'F1', 'F1', 'F2', 'F1', 'F1', 'F1', 'F2', 'F1',
        'G1', 'G1', 'G2', 'G1', 'G1', 'G1', 'G2', 'G1', 'E1', 'E1', 'E2', 'E1', 'E1', 'E1', 'E2', 'E1'],
      PULSE_BASS,
    ),
  ],
};

/** Rooftops, Mahmood's: quick and light in E, the way you cross them. */
const ROOFTOPS: MusicTrack = {
  stepMs: 125,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['E5', null, 'F#5', 'G#5', 'B5', null, 'A5', 'G#5', 'F#5', null, 'E5', null, 'C#5', null, 'B4', null,
        'A4', null, 'B4', 'C#5', 'E5', null, 'F#5', 'G#5', 'B5', null, 'A5', null, 'E5', null, null, null],
      LEAD,
    ),
    ...line(
      ['E2', null, 'B2', null, 'E2', null, 'B2', null, 'C#2', null, 'G#2', null, 'C#2', null, 'G#2', null,
        'A1', null, 'E2', null, 'A1', null, 'E2', null, 'B1', null, 'F#2', null, 'B1', null, 'D#2', null],
      BASS,
    ),
  ],
};

/** Casino floor, Rajab's: a B flat that never walks in a straight line. */
const CASINO: MusicTrack = {
  stepMs: 145,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['A#4', null, 'D5', 'F5', null, 'D5', 'A#4', null, 'C5', null, 'D#5', 'G5', null, 'D#5', 'C5', null,
        'D5', null, 'F5', 'A#5', null, 'A5', 'G5', 'F5', 'D5', null, 'C5', null, 'A#4', null, 'A4', null],
      LEAD,
    ),
    ...line(
      ['A#1', null, 'F2', null, 'A#1', null, 'F2', null, 'D#2', null, 'A#2', null, 'D#2', null, 'A#2', null,
        'G1', null, 'D2', null, 'G1', null, 'D2', null, 'F2', null, 'C3', null, 'F2', null, 'A2', null],
      BASS,
    ),
  ],
};

/** Clinic street, Azar's: C sharp minor, cold, and as spare as a waiting room. */
const CLINIC: MusicTrack = {
  stepMs: 190,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['C#5', null, null, null, 'G#4', null, null, null, 'B4', null, null, null, 'C#5', null, null, null,
        'E5', null, null, null, 'D#5', null, null, null, 'B4', null, null, null, 'G#4', null, null, null],
      SOFT_LEAD,
    ),
    ...line(
      ['C#2', null, null, null, null, null, null, null, 'A1', null, null, null, null, null, null, null,
        'E2', null, null, null, null, null, null, null, 'G#1', null, null, null, null, null, null, null],
      LONG_DRONE,
    ),
  ],
};

/** Field camp, Osal's: a D major march, with the bass keeping time like boots. */
const FIELD_CAMP: MusicTrack = {
  stepMs: 155,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['D5', null, 'D5', 'E5', 'F#5', null, 'E5', 'D5', 'A4', null, 'A4', 'B4', 'D5', null, 'C#5', null,
        'B4', null, 'B4', 'C#5', 'D5', null, 'C#5', 'B4', 'A4', null, 'E5', null, 'D5', null, null, null],
      LEAD,
    ),
    ...line(
      ['D2', 'D2', null, 'A2', 'D2', null, 'A2', null, 'G1', 'G1', null, 'D2', 'G1', null, 'D2', null,
        'A1', 'A1', null, 'E2', 'A1', null, 'E2', null, 'D2', 'D2', null, 'A2', 'D2', null, 'A2', null],
      PULSE_BASS,
    ),
  ],
};

/**
 * The tower roof, where Magnus Vane waits: C minor, slower and heavier than anything under it,
 * with a third voice holding the chord so the room sounds bigger than the others.
 */
const TOWER_ROOF: MusicTrack = {
  stepMs: 175,
  steps: LOOP_STEPS,
  notes: [
    ...line(
      ['C5', null, 'D#5', null, 'G5', null, 'G#5', 'G5', 'F5', null, 'D#5', null, 'D5', null, null, null,
        'G#4', null, 'C5', null, 'D#5', null, 'D5', 'C5', 'B4', null, null, null, 'G4', null, null, null],
      LEAD,
    ),
    ...line(
      ['G4', null, null, null, 'D#4', null, null, null, 'C4', null, null, null, 'G4', null, null, null,
        'D#4', null, null, null, 'G4', null, null, null, 'G4', null, null, null, 'D4', null, null, null],
      { ...HARMONY, steps: 4 },
    ),
    ...line(
      ['C2', null, 'G2', null, 'C2', null, 'G2', null, 'G#1', null, 'D#2', null, 'G#1', null, 'D#2', null,
        'F1', null, 'C2', null, 'F1', null, 'C2', null, 'G1', null, 'D2', null, 'G1', null, 'B1', null],
      BASS,
    ),
  ],
};

/** Which loop plays in which arena. Every arena has one, so a fight is never fought in silence. */
export const ARENA_MUSIC: Readonly<Record<ArenaId, MusicTrack>> = {
  docks: DOCKS,
  plaza: PLAZA,
  mine: MINE,
  powerStation: POWER_STATION,
  bamboo: BAMBOO,
  monastery: MONASTERY,
  hangar: HANGAR,
  gym: GYM,
  ring: RING,
  ruins: RUINS,
  foundry: FOUNDRY,
  rooftops: ROOFTOPS,
  casino: CASINO,
  clinic: CLINIC,
  fieldCamp: FIELD_CAMP,
  towerRoof: TOWER_ROOF,
};
