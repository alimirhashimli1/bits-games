import { BOSS } from '../config';

/** Something the Baron does on a given frame. */
export type BaronAction = 'hop' | 'throw';

/**
 * When the Sludge Baron throws and hops. Each has its own list of pauses, taken in turn and
 * round again, so the fight follows a pattern that can be learnt. Knows nothing about Phaser.
 */
export class BaronPattern {
  private throwTurn = 0;
  private hopTurn = 0;
  private untilThrowMs: number;
  private untilHopMs: number;

  constructor(
    private readonly throwGapsMs: readonly number[] = BOSS.throwGapsMs,
    private readonly hopGapsMs: readonly number[] = BOSS.hopGapsMs,
  ) {
    this.untilThrowMs = gap(throwGapsMs, 0);
    this.untilHopMs = gap(hopGapsMs, 0);
  }

  /** Moves the clock on, and says what he does now: nothing, a throw, a hop, or both. */
  update(deltaMs: number): BaronAction[] {
    const actions: BaronAction[] = [];
    this.untilThrowMs -= deltaMs;
    this.untilHopMs -= deltaMs;
    if (this.untilThrowMs <= 0) {
      this.throwTurn += 1;
      this.untilThrowMs += gap(this.throwGapsMs, this.throwTurn);
      actions.push('throw');
    }
    if (this.untilHopMs <= 0) {
      this.hopTurn += 1;
      this.untilHopMs += gap(this.hopGapsMs, this.hopTurn);
      actions.push('hop');
    }
    return actions;
  }
}

function gap(gaps: readonly number[], turn: number): number {
  const value = gaps[turn % gaps.length];
  if (value === undefined) throw new Error('The Baron needs at least one pause in each pattern.');
  return value;
}

/**
 * How fast a blob is thrown across so that it comes down on a point `distance` pixels away
 * (negative to the left) and `drop` pixels below the hand it left, thrown upwards at
 * `BOSS.sludgeLaunchSpeed` under `gravity`. Kept within the limits in `BOSS`, so a blob
 * thrown at Rusty close up still clears the Baron, and one thrown at him far away falls short.
 */
export function sludgeSpeedX(distance: number, drop: number, gravity: number): number {
  const launch = BOSS.sludgeLaunchSpeed;
  // Up and back down past the hand, and on down to the target: drop = -launch·t + gravity·t²/2.
  const flightSeconds = (launch + Math.sqrt(launch * launch + 2 * gravity * Math.max(drop, 0))) / gravity;
  const speed = Math.abs(distance) / flightSeconds;
  const limited = Math.min(Math.max(speed, BOSS.sludgeMinSpeed), BOSS.sludgeMaxSpeed);
  return distance < 0 ? -limited : limited;
}
