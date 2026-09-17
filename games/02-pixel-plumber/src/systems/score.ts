import { SCORING } from '../config';

/** How many digits the score is shown with. */
const SCORE_DIGITS = 6;
/** How many digits the clock is shown with. */
const TIME_DIGITS = 3;

/** What beating one enemy gives. Late in a long run it is a life instead of points. */
export interface ChainReward {
  readonly points: number;
  readonly life: boolean;
}

/** What the `step`-th enemy beaten in one run is worth, counting the first as step 0. */
export function chainReward(step: number): ChainReward {
  const points = SCORING.chainPoints[step];
  return points === undefined ? { points: 0, life: true } : { points, life: false };
}

/**
 * Enemies beaten one after another, as on the original console: each one in the same run is
 * worth more than the last, and the run ends when nothing is beaten for a moment. One run
 * covers a jump from enemy to enemy and a shell sliding through a row of them alike.
 */
export class DefeatChain {
  private step = 0;
  private lastMs = Number.NEGATIVE_INFINITY;

  /** What the enemy beaten now is worth, carrying the run on if the last one was recent enough. */
  next(now: number): ChainReward {
    this.step = now - this.lastMs <= SCORING.chainWindowMs ? this.step + 1 : 0;
    this.lastMs = now;
    return chainReward(this.step);
  }
}

/**
 * What catching the valve wheel is worth. `height` is 0 at the foot of the pole and 1 at the
 * very top, so the higher Rusty grabs it, the bigger the band he lands in.
 */
export function wheelBonus(height: number): number {
  const bands = SCORING.wheelBonus;
  const band = Math.floor(Math.min(Math.max(height, 0), 1) * bands.length);
  return bands[Math.min(band, bands.length - 1)] ?? 0;
}

/** Collecting a coin: coins roll over at 100, and each roll-over is an extra life. */
export function collectCoin(coins: number): { readonly coins: number; readonly life: boolean } {
  const total = coins + 1;
  return total >= SCORING.coinsPerLife ? { coins: 0, life: true } : { coins: total, life: false };
}

/** The score with leading zeros, as the HUD shows it. */
export function formatScore(score: number): string {
  return String(Math.floor(score)).padStart(SCORE_DIGITS, '0');
}

/** The clock with leading zeros, as the HUD shows it. */
export function formatTime(time: number): string {
  return String(Math.max(Math.floor(time), 0)).padStart(TIME_DIGITS, '0');
}
