/**
 * Turns the time between screen frames into a whole number of fight steps. The fight runs
 * at the same speed on a 60 Hz and a 144 Hz screen, and leftover time carries over.
 */
export class FixedStepClock {
  private readonly stepMs: number;
  private readonly maxSteps: number;
  private leftoverMs = 0;

  constructor(stepsPerSecond: number, maxStepsPerFrame: number) {
    this.stepMs = 1000 / stepsPerSecond;
    this.maxSteps = maxStepsPerFrame;
  }

  /** How many steps to run for a frame that took `deltaMs`. */
  advance(deltaMs: number): number {
    this.leftoverMs += deltaMs;
    const steps = Math.floor(this.leftoverMs / this.stepMs);
    if (steps > this.maxSteps) {
      // Too far behind (a tab in the background): skip ahead instead of fast-forwarding.
      this.leftoverMs = 0;
      return this.maxSteps;
    }
    this.leftoverMs -= steps * this.stepMs;
    return steps;
  }
}
