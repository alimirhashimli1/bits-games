import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { BootScene } from './scenes/BootScene';

mountHomeButton();

createPixelGame({
  parent: 'game',
  width: SCREEN.width,
  height: SCREEN.height,
  backgroundColor: COLORS.background,
  // The first scene in the list starts automatically.
  scenes: [BootScene],
});
