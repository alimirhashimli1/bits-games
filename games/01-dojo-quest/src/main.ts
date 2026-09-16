import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { AreaScene } from './scenes/AreaScene';
import { BootScene } from './scenes/BootScene';
import { ControlsScene } from './scenes/ControlsScene';
import { GameOverScene } from './scenes/GameOverScene';
import { PauseScene } from './scenes/PauseScene';
import { PrologueScene } from './scenes/PrologueScene';
import { RaidScene } from './scenes/RaidScene';
import { RescueScene } from './scenes/RescueScene';
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
    RescueScene,
    ControlsScene,
    PauseScene,
    GameOverScene,
    VictoryScene,
    SpriteGalleryScene,
  ],
});
