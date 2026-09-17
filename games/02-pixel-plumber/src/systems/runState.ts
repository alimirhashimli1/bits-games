import { RUN } from '../config';
import { LEVEL_IDS, type LevelId } from '../content/levels/levelOrder';
import type { PowerState } from './powerState';

/** Everything that carries over from one level to the next. Passed between scenes as scene data. */
export interface RunState {
  readonly levelIndex: number;
  readonly lives: number;
  readonly coins: number;
  readonly score: number;
  readonly power: PowerState;
}

export function newRun(levelIndex = 0): RunState {
  const clampedIndex = Math.min(Math.max(levelIndex, 0), LEVEL_IDS.length - 1);
  return { levelIndex: clampedIndex, lives: RUN.startingLives, coins: 0, score: 0, power: 'small' };
}

export function levelId(run: RunState): LevelId {
  return LEVEL_IDS[run.levelIndex] ?? LEVEL_IDS[0];
}

/** The run after clearing the current level, or `undefined` once the last level is cleared. Rusty keeps his power. */
export function advanceLevel(run: RunState): RunState | undefined {
  const levelIndex = run.levelIndex + 1;
  return levelIndex < LEVEL_IDS.length ? { ...run, levelIndex } : undefined;
}

/**
 * The run after losing a life, or `undefined` when none are left. Coins and score are kept,
 * as in the original, but Rusty starts again small.
 */
export function loseLife(run: RunState): RunState | undefined {
  const lives = run.lives - 1;
  return lives > 0 ? { ...run, lives, power: 'small' } : undefined;
}

export function gainLife(run: RunState): RunState {
  return { ...run, lives: run.lives + 1 };
}
