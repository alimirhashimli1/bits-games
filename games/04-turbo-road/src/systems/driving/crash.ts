import { CRASH } from '../../config';
import { smoothStep } from '../easing';
import { nearestBranchCentre } from '../road/fork';
import type { CarState } from './carPhysics';

/** A crash under way: the car tumbles, slides to a stop and is put back on the road. */
export interface Crash {
  /** Steps since the hit. */
  readonly step: number;
  /** Where the car was when it hit, so it can ease back to the middle of the road from there. */
  readonly fromX: number;
}

/** How the tumbling car is drawn at this moment. */
export interface TumblePose {
  /** Pixels above the road. */
  readonly lift: number;
  /** Vertical scale: 1 upright, 0 edge-on, -1 upside down, as the car turns end over end. */
  readonly flip: number;
}

export function startCrash(car: CarState): Crash {
  return { step: 0, fromX: car.x };
}

/** True once the tumble is over and the car can drive again. */
export function isCrashOver(crash: Crash): boolean {
  return crash.step >= CRASH.tumbleSteps;
}

/**
 * Advances a crash by one step, and the car with it. The car is put back in the middle of the
 * road, or of the nearest branch where the road has forked, never on the grass between.
 */
export function stepCrash(crash: Crash, car: CarState, branchOffset: number): { crash: Crash; car: CarState } {
  const next = { ...crash, step: crash.step + 1 };
  const middle = nearestBranchCentre(crash.fromX, branchOffset);
  if (isCrashOver(next)) return { crash: next, car: { ...car, speed: 0, x: middle } };

  const progress = next.step / CRASH.tumbleSteps;
  return {
    crash: next,
    car: { ...car, speed: car.speed * CRASH.slideDrag, x: middle + (crash.fromX - middle) * (1 - smoothStep(progress)) },
  };
}

export function tumblePose(crash: Crash): TumblePose {
  const progress = crash.step / CRASH.tumbleSteps;
  return {
    lift: Math.sin(progress * Math.PI) * CRASH.tumbleHeight,
    flip: Math.cos(progress * CRASH.tumbleTurns * Math.PI * 2),
  };
}
