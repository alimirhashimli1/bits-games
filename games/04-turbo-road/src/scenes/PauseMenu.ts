import { drawCenteredPixelText } from '@shared/pixel-font/canvasPixelText';

import { COLORS, SCREEN } from '../config';
import type { GameContext } from '../systems/scenes/GameContext';
import { drawControlsPanel } from '../systems/ui/ControlsPanel';
import { Menu } from '../systems/ui/Menu';
import { TitleScene } from './TitleScene';

const HEADING_Y = 56;
const MENU_Y = 80;
/** How much the race behind the menu is darkened, and darker still behind the controls. */
const DIM_ALPHA = 0.6;
const CONTROLS_DIM_ALPHA = 0.85;

/**
 * Laid over the race while it is paused: carry on, read the controls, or give up the race and
 * go back to the title. Esc or Start carries on.
 */
export class PauseMenu {
  private readonly menu: Menu;
  private showingControls = false;

  constructor(
    private readonly game: GameContext,
    resume: () => void,
  ) {
    this.menu = new Menu(
      game.input,
      [
        { label: 'CONTINUE', onSelect: resume },
        { label: 'CONTROLS', onSelect: () => (this.showingControls = true) },
        { label: 'QUIT RACE', onSelect: () => game.scenes.go(new TitleScene(game)) },
      ],
      { y: MENU_Y, onCancel: resume },
      SCREEN.width,
    );
  }

  update(): void {
    if (!this.showingControls) {
      this.menu.update();
      return;
    }
    const { input } = this.game;
    if (input.justPressed('confirm') || input.justPressed('cancel')) this.showingControls = false;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.showingControls ? CONTROLS_DIM_ALPHA : DIM_ALPHA;
    context.fillStyle = COLORS.background;
    context.fillRect(0, 0, SCREEN.width, SCREEN.height);
    context.globalAlpha = 1;

    if (this.showingControls) {
      drawControlsPanel(context);
      return;
    }
    drawCenteredPixelText(context, 'PAUSED', HEADING_Y, { color: COLORS.title });
    this.menu.draw(context);
  }
}
