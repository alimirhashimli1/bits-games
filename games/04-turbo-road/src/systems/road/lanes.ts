import { ROAD } from '../../config';

/** One lane's width, in road half-widths. */
export const LANE_WIDTH = 2 / ROAD.lanes;

/** The centre of a lane, in road half-widths. Lane 0 is the left-hand one. */
export function laneCentre(lane: number): number {
  return -1 + (lane + 0.5) * LANE_WIDTH;
}

/** The lanes next to `lane`, left first. */
export function neighbouringLanes(lane: number): number[] {
  return [lane - 1, lane + 1].filter((next) => next >= 0 && next < ROAD.lanes);
}
