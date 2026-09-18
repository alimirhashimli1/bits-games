import { PLATFORMS } from '../config';
import type { PlatformMotion } from '../content/levels/tileLegend';
import type { Cell } from './levelLoader';

/** One cell of a platform's track, as written in a level map. */
export interface TrackCell extends Cell {
  readonly motion: PlatformMotion;
}

/** Where a moving platform starts and how far it rides before it turns back. */
export interface PlatformTrack {
  readonly motion: PlatformMotion;
  /** The platform's left end starts in this cell, with its top on the top of the cell. */
  readonly start: Cell;
  /** How many tiles it rides from the start, right or down, before coming back. */
  readonly travel: number;
}

/**
 * Joins track cells into one track per platform: a run along a row for a sideways platform,
 * a run down a column for a lift. A track that leaves its platform no room to move is refused.
 */
export function platformTracks(cells: readonly TrackCell[]): PlatformTrack[] {
  const at = new Set(cells.map(({ motion, column, row }) => `${motion}:${column},${row}`));
  const tracks: PlatformTrack[] = [];
  for (const { motion, column, row } of cells) {
    const [stepX, stepY] = motion === 'sideways' ? [1, 0] : [0, 1];
    // Only the first cell of a run starts a track.
    if (at.has(`${motion}:${column - stepX},${row - stepY}`)) continue;

    let length = 1;
    while (at.has(`${motion}:${column + stepX * length},${row + stepY * length}`)) length++;
    // A sideways platform covers part of its own track; a lift's track is where its left end goes.
    const travel = motion === 'sideways' ? length - PLATFORMS.widthTiles : length - 1;
    if (travel < 1) throw new Error(`The ${motion} track at column ${column}, row ${row} is too short to move along.`);
    tracks.push({ motion, start: { column, row }, travel });
  }
  return tracks;
}
