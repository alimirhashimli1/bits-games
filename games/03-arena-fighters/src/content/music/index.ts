/**
 * Every loop in the game: one for each arena, and one for each kind of screen between fights.
 * Scenes ask for music through here so that no scene needs to know where a tune is written.
 */
export { ARENA_MUSIC } from './arenaMusic';
export {
  CONTINUE_MUSIC,
  RESULTS_MUSIC,
  SELECT_MUSIC,
  STORY_MUSIC,
  TITLE_MUSIC,
  VERSUS_MUSIC,
} from './screenMusic';
