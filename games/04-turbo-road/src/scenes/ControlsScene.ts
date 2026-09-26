import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { drawControlsPanel } from '../systems/ui/ControlsPanel';
import { clearScreen } from './clearScreen';
import { TitleScene } from './TitleScene';

/** The controls, from the title menu. START or Esc goes back. */
export class ControlsScene implements Scene {
  constructor(private readonly game: GameContext) {}

  update(): void {
    const { input } = this.game;
    if (input.justPressed('confirm') || input.justPressed('cancel')) this.game.scenes.go(new TitleScene(this.game));
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawControlsPanel(context);
  }
}
