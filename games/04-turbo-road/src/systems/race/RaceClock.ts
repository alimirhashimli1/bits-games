import { RACE, STEPS_PER_SECOND } from '../../config';

/**
 * The countdown clock. It runs in steps, so it stops whenever the race does, as in a pause or
 * on the route map between stages.
 */
export class RaceClock {
  constructor(private stepsLeft: number) {}

  /** A clock with `seconds` on it. */
  static withSeconds(seconds: number): RaceClock {
    return new RaceClock(seconds * STEPS_PER_SECOND);
  }

  /** Time left, in steps, to carry on into the next stage. */
  get steps(): number {
    return this.stepsLeft;
  }

  /** One step of time passes. The clock stops at zero. */
  tick(): void {
    this.stepsLeft = Math.max(0, this.stepsLeft - 1);
  }

  /** A checkpoint's extra time. */
  extend(seconds: number): void {
    this.stepsLeft += seconds * STEPS_PER_SECOND;
  }

  /** Whole seconds, rounded up, so the clock shows 1 until the very last step, and 0 only when time is up. */
  get seconds(): number {
    return Math.ceil(this.stepsLeft / STEPS_PER_SECOND);
  }

  get isUp(): boolean {
    return this.stepsLeft === 0;
  }

  get isLow(): boolean {
    return this.seconds <= RACE.lowTimeSeconds;
  }
}
