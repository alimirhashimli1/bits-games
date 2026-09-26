import type { RadioSong } from '../../content/radio';
import { FIRST_STAGE } from '../../content/stages/route';
import type { ForkSide, StageId } from '../../content/stages/stage';
import { RACE, STEPS_PER_SECOND } from '../../config';
import { type CarState, STARTING_CAR } from '../driving/carPhysics';
import { branchSide } from '../road/fork';

/** Everything about a race that carries on from one stage to the next. */
export interface RaceRun {
  readonly song: RadioSong;
  /** The stage being driven, or about to be. */
  readonly stage: StageId;
  /** The stages already driven, in order. */
  readonly route: readonly StageId[];
  /** Time left on the clock, in steps. */
  readonly clockSteps: number;
  readonly score: number;
  readonly car: CarState;
}

/** A new race, on the first stage with a full clock and the car on the grid. */
export function startRun(song: RadioSong): RaceRun {
  return {
    song,
    stage: FIRST_STAGE,
    route: [],
    clockSteps: RACE.startSeconds * STEPS_PER_SECOND,
    score: 0,
    car: STARTING_CAR,
  };
}

/** Which way the car went at a fork: the side of the old centre line it crossed the end line on. */
export function forkSideOf(carX: number): ForkSide {
  return branchSide(carX) < 0 ? 'left' : 'right';
}

/**
 * The race carrying on into \`next\`. The car keeps its speed and gear, and its place across
 * the branch it took becomes its place across the new stage's road.
 */
export function continueRun(
  run: RaceRun,
  next: StageId,
  { clockSteps, score, car, branchOffset }: { clockSteps: number; score: number; car: CarState; branchOffset: number },
): RaceRun {
  return {
    ...run,
    stage: next,
    route: [...run.route, run.stage],
    clockSteps,
    score,
    car: { ...car, x: car.x - branchSide(car.x) * branchOffset },
  };
}
