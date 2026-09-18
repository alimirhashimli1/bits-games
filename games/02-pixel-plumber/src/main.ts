import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { BootScene } from './scenes/BootScene';
import { EndingScene } from './scenes/EndingScene';
import { ControlsScene } from './scenes/ControlsScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LevelScene } from './scenes/LevelScene';
import { PauseScene } from './scenes/PauseScene';
import { SpriteGalleryScene } from './scenes/SpriteGalleryScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldIntroScene } from './scenes/WorldIntroScene';

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
    ControlsScene,
    WorldIntroScene,
    LevelScene,
    PauseScene,
    GameOverScene,
    EndingScene,
    SpriteGalleryScene,
  ],
});
