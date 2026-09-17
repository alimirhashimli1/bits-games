import { LEVEL } from '../config';

/**
 * The clock at the top of the screen. It counts in its own units, not seconds, as on the
 * original console, and knows nothing about Phaser: the level hands it each frame's time.
 */
export class LevelTimer {
  private unitsLeft: number;

  constructor(startTime: number = LEVEL.startTime) {
    this.unitsLeft = startTime;
  }

  /** Whole units left, which is what the HUD shows. */
  get left(): number {
    return Math.max(Math.ceil(this.unitsLeft), 0);
  }

  get isOut(): boolean {
    return this.unitsLeft <= 0;
  }

  /** True once the clock is low enough to warn about. */
  get isLow(): boolean {
    return this.left <= LEVEL.lowTime;
  }

  /** Call once per frame while the level is running. */
  update(deltaMs: number): void {
    if (this.isOut) return;
    this.unitsLeft = Math.max(this.unitsLeft - deltaMs / LEVEL.timeUnitMs, 0);
  }

  /** Takes one unit off the clock at the end of a level. False once there is nothing left. */
  takeUnit(): boolean {
    const left = this.left;
    if (left <= 0) return false;
    this.unitsLeft = left - 1;
    return true;
  }
}
