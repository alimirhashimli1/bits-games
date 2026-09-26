import { isHighScore, loadHighScores, type RacePlace } from '../systems/scores/highScores';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { HighScoresScene } from './HighScoresScene';
import { InitialsEntryScene } from './InitialsEntryScene';

/** After the ending or Game Over: initials for a score that makes the table, or else the table to beat. */
export function afterRace(game: GameContext, score: number, place: RacePlace): Scene {
  return isHighScore(loadHighScores(), score) ? new InitialsEntryScene(game, score, place) : new HighScoresScene(game);
}
