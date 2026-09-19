import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { BootScene } from './scenes/BootScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { FightScene } from './scenes/FightScene';
import { ModeSelectScene } from './scenes/ModeSelectScene';
import { ResultsScene } from './scenes/ResultsScene';
import { SpriteGalleryScene } from './scenes/SpriteGalleryScene';
import { TitleScene } from './scenes/TitleScene';
import { VersusScene } from './scenes/VersusScene';

mountHomeButton();

createPixelGame({
  parent: 'game',
  width: SCREEN.width,
  height: SCREEN.height,
  backgroundColor: COLORS.background,
  // The first scene in the list starts automatically.
  scenes: [BootScene, TitleScene, ModeSelectScene, CharacterSelectScene, VersusScene, FightScene, ResultsScene, SpriteGalleryScene],
});
