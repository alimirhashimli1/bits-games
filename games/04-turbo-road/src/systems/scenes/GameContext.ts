import type { GameAction } from '../../content/controls';
import type { ActionInput } from '../input/ActionInput';
import type { SceneManager } from './SceneManager';

/** What every scene is given: the player's input and the way to the next scene. */
export interface GameContext {
  readonly input: ActionInput<GameAction>;
  readonly scenes: SceneManager;
}
