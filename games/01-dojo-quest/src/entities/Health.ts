export interface HealthConfig {
  readonly maxPips: number;
  /** Time to regain one pip while regeneration is allowed. Leave out for no regeneration. */
  readonly regenIntervalMs?: number;
}

/** Health counted in whole pips, with optional slow regeneration. */
export class Health {
  readonly max: number;
  private readonly regenIntervalMs: number | undefined;
  private value: number;
  private regenElapsedMs = 0;

  /** `startPips` defaults to full health, e.g. when health carries over between areas it is less. */
  constructor({ maxPips, regenIntervalMs }: HealthConfig, startPips = maxPips) {
    this.max = maxPips;
    this.value = Math.min(Math.max(0, Math.round(startPips)), maxPips);
    this.regenIntervalMs = regenIntervalMs;
  }

  get current(): number {
    return this.value;
  }

  get isDepleted(): boolean {
    return this.value === 0;
  }

  /** Removes pips and restarts the regeneration timer. */
  damage(pips: number): void {
    this.value = Math.max(0, this.value - pips);
    this.regenElapsedMs = 0;
  }

  /**
   * Regains one pip every interval while `isAllowed` (e.g. outside a fight).
   * When not allowed, or already full, the timer starts over.
   */
  regenerate(deltaMs: number, isAllowed: boolean): void {
    if (this.regenIntervalMs === undefined) return;
    if (!isAllowed || this.value >= this.max) {
      this.regenElapsedMs = 0;
      return;
    }

    this.regenElapsedMs += deltaMs;
    while (this.regenElapsedMs >= this.regenIntervalMs && this.value < this.max) {
      this.value++;
      this.regenElapsedMs -= this.regenIntervalMs;
    }
  }
}
