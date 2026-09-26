import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { clearScreen } from './clearScreen';
import { TitleScene } from './TitleScene';

/** The first scene. The sprites the race needs will be drawn here, before the title shows. */
export class BootScene implements Scene {
  constructor(private readonly game: GameContext) {}

  update(): void {
    this.game.scenes.go(new TitleScene(this.game));
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
  }
}
