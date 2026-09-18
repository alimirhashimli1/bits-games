import { LEVEL_IDS, type LevelId } from '../content/levels/levelOrder';

/**
 * The world a run can be continued from: the last world reached, remembered in the browser so
 * the title can offer it after a reload. Storage can be missing or refuse (a private window,
 * blocked site data), so every read and write is allowed to fail quietly: the game then simply
 * does not offer a continue.
 */

const STORAGE_KEY = 'pixel-plumber.continue-world';

/** The first level of a world, such as `3-1` for world 3. */
export function firstLevelOf(world: string): LevelId | undefined {
  return LEVEL_IDS.find((id) => id === `${world}-1`);
}

/** Remembers the world of a level that has just started. */
export function rememberWorld(id: LevelId): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, id.charAt(0));
  } catch {
    // Nothing to continue from next time; the game plays on as normal.
  }
}

/** The world to continue from, if one past the first has been reached. */
export function savedWorld(): string | undefined {
  try {
    const world = window.localStorage.getItem(STORAGE_KEY);
    return world && world !== '1' && firstLevelOf(world) ? world : undefined;
  } catch {
    return undefined;
  }
}

/** The game is won: there is nothing left to continue. */
export function forgetWorld(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Already as good as forgotten.
  }
}
