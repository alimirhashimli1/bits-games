import { stopMusic } from '@shared/audio/music';
import { drawCenteredPixelText } from '@shared/pixel-font/canvasPixelText';

import { COMET_PALETTE, COMET_STRAIGHT } from '../content/sprites/comet';
import { COLORS, SCREEN } from '../config';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { renderPixelSprite } from '../systems/sprites/pixelSprites';
import { Menu } from '../systems/ui/Menu';
import { clearScreen } from './clearScreen';
import { ControlsScene } from './ControlsScene';
import { HighScoresScene } from './HighScoresScene';
import { RadioScene } from './RadioScene';

const TITLE_Y = 28;
const TITLE_SCALE = 3;
const SUBTITLE_Y = 58;
const COMET_Y = 74;
const MENU_Y = 110;
const MUTE_HINT_Y = 164;

/** The title: start a race, see the best scores, or read the controls. */
export class TitleScene implements Scene {
  private readonly menu: Menu;
  private readonly comet = renderPixelSprite(COMET_STRAIGHT, COMET_PALETTE, 'Comet');

  constructor(game: GameContext) {
    // Back from a race or the radio, the radio goes off.
    stopMusic();
    this.menu = new Menu(
      game.input,
      [
        { label: 'START RACE', onSelect: () => game.scenes.go(new RadioScene(game)) },
        { label: 'HIGH SCORES', onSelect: () => game.scenes.go(new HighScoresScene(game)) },
        { label: 'CONTROLS', onSelect: () => game.scenes.go(new ControlsScene(game)) },
      ],
      { y: MENU_Y },
      SCREEN.width,
    );
  }

  update(): void {
    this.menu.update();
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawCenteredPixelText(context, 'TURBO ROAD', TITLE_Y, { color: COLORS.title, scale: TITLE_SCALE });
    drawCenteredPixelText(context, 'THE SUNWARD RUN', SUBTITLE_Y, { color: COLORS.muted });
    context.drawImage(this.comet, Math.round((SCREEN.width - this.comet.width) / 2), COMET_Y);
    this.menu.draw(context);
    drawCenteredPixelText(context, 'M: SOUND ON / OFF', MUTE_HINT_Y, { color: COLORS.muted });
  }
}
