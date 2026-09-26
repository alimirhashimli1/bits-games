export interface FixedStepLoopOptions {
  readonly stepsPerSecond: number;
  readonly maxStepsPerFrame: number;
  /** Advances the game by exactly one step. */
  readonly update: () => void;
  /** Draws the current state, once per screen frame. */
  readonly draw: () => void;
}

/**
 * Runs the game at a fixed number of steps per second, whatever the monitor's refresh rate:
 * a 144 Hz screen sometimes runs no step in a frame, a 30 Hz one runs two. Every step is the
 * same length, so speeds and timers never depend on the frame rate.
 */
export function startFixedStepLoop({ stepsPerSecond, maxStepsPerFrame, update, draw }: FixedStepLoopOptions): void {
  const stepMs = 1000 / stepsPerSecond;
  let lastTime: number | null = null;
  let pendingMs = 0;

  const frame = (time: number): void => {
    pendingMs += lastTime === null ? 0 : time - lastTime;
    lastTime = time;

    let steps = 0;
    while (pendingMs >= stepMs && steps < maxStepsPerFrame) {
      update();
      pendingMs -= stepMs;
      steps++;
    }
    // Whatever could not be caught up is dropped, so the game slows down rather than stalls.
    if (steps === maxStepsPerFrame) pendingMs = 0;

    draw();
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}
