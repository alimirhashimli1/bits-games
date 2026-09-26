import { GOALS, STAGES } from '../../content/stages/route';
import type { GoalId, StageId } from '../../content/stages/stage';
import { HIGH_SCORES } from '../../config';

/** Where a race ended: at a goal, or on the stage where the clock ran out. */
export type RacePlace = StageId | GoalId;

/** One line of the table. */
export interface HighScore {
  readonly initials: string;
  readonly score: number;
  readonly place: RacePlace;
}

const INITIALS_PATTERN = new RegExp(`^[A-Z]{${HIGH_SCORES.initialsLength}}$`);

/**
 * The table before anyone has set a score in this browser: the three rivals and two more,
 * low enough that a good first race gets in.
 */
export const DEFAULT_HIGH_SCORES: readonly HighScore[] = [
  { initials: 'SBL', score: 100000, place: 'skylinePier' },
  { initials: 'BRK', score: 80000, place: 'summitLodge' },
  { initials: 'JUN', score: 60000, place: 'starObservatory' },
  { initials: 'KAI', score: 40000, place: 'palmCanyon' },
  { initials: 'ROS', score: 20000, place: 'sunsetCoast' },
];

/** The name of a place, for the table. */
export function placeName(place: RacePlace): string {
  return isGoalId(place) ? GOALS[place].name : STAGES[place].name;
}

/** Own keys only: `'toString' in GOALS` is true, but it is no goal. */
function isGoalId(place: string): place is GoalId {
  return Object.hasOwn(GOALS, place);
}

function isStageId(place: string): place is StageId {
  return Object.hasOwn(STAGES, place);
}

/** True if `score` earns a line in the table. */
export function isHighScore(scores: readonly HighScore[], score: number): boolean {
  if (score <= 0) return false;
  const last = scores[HIGH_SCORES.count - 1];
  return !last || score > last.score;
}

/**
 * The table with `entry` added in its place, and where that is (0 is the top). A new score
 * goes below any equal one already there, which got there first. `rank` is null if it did not
 * make the table.
 */
export function addHighScore(
  scores: readonly HighScore[],
  entry: HighScore,
): { readonly scores: readonly HighScore[]; readonly rank: number | null } {
  const below = scores.findIndex((other) => other.score < entry.score);
  const index = below === -1 ? scores.length : below;
  const table = [...scores.slice(0, index), entry, ...scores.slice(index)].slice(0, HIGH_SCORES.count);
  return { scores: table, rank: index < HIGH_SCORES.count ? index : null };
}

/**
 * The table saved in this browser, or the default one. Storage can be missing or refuse (a
 * private window, blocked site data), and what is stored may be damaged or edited by hand, so
 * anything that is not a proper line is dropped and a failed read gives the default table.
 */
export function loadHighScores(): readonly HighScore[] {
  try {
    const stored = window.localStorage.getItem(HIGH_SCORES.storageKey);
    if (stored === null) return DEFAULT_HIGH_SCORES;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_HIGH_SCORES;
    const valid = parsed.filter(isHighScoreLine);
    return [...valid].sort((a, b) => b.score - a.score).slice(0, HIGH_SCORES.count);
  } catch {
    return DEFAULT_HIGH_SCORES;
  }
}

/** Keeps the table for next time. If the browser refuses, the scores last only until the page closes. */
export function saveHighScores(scores: readonly HighScore[]): void {
  try {
    window.localStorage.setItem(HIGH_SCORES.storageKey, JSON.stringify(scores));
  } catch {
    // The game plays on; the table is simply not remembered.
  }
}

function isHighScoreLine(value: unknown): value is HighScore {
  if (typeof value !== 'object' || value === null) return false;
  const { initials, score, place } = value as Record<string, unknown>;
  return (
    typeof initials === 'string' &&
    INITIALS_PATTERN.test(initials) &&
    typeof score === 'number' &&
    Number.isSafeInteger(score) &&
    score > 0 &&
    typeof place === 'string' &&
    (isStageId(place) || isGoalId(place))
  );
}
