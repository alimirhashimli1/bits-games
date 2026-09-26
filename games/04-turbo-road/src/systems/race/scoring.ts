import { CAR, RACE } from '../../config';

/** How a race ended at a goal: the score so far, in whole points, and the time left on the clock. */
export interface RaceResult {
  readonly score: number;
  readonly secondsLeft: number;
}

/**
 * Points for driving `distance` world units at `speed`: the full rate at top speed, and less
 * the slower the car goes, so the score rewards driving fast, not just far.
 */
export function distancePoints(distance: number, speed: number): number {
  return distance * RACE.pointsPerUnit * Math.min(1, speed / CAR.gears.high.topSpeed);
}

/** Points for the seconds left on the clock at a finish line. */
export function timeBonus(secondsLeft: number): number {
  return secondsLeft * RACE.timeBonusPerSecond;
}
