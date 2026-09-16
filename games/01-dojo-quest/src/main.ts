import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { AreaScene } from './scenes/AreaScene';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { PrologueScene } from './scenes/PrologueScene';
import { RaidScene } from './scenes/RaidScene';
import { SpriteGalleryScene } from './scenes/SpriteGalleryScene';
import { StoryScene } from './scenes/StoryScene';
import { TitleScene } from './scenes/TitleScene';
import { VictoryScene } from './scenes/VictoryScene';

mountHomeButton();

createPixelGame({
  parent: 'game',
  width: SCREEN.width,
  height: SCREEN.height,
  backgroundColor: COLORS.background,
  // The first scene in the list starts automatically.
  scenes: [
    BootScene,
    TitleScene,
    RaidScene,
    PrologueScene,
    StoryScene,
    AreaScene,
    GameOverScene,
    VictoryScene,
    SpriteGalleryScene,
  ],
});
