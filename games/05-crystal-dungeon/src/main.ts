import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { BootScene } from './scenes/BootScene';
import { ControlsScene } from './scenes/ControlsScene';
import { DialogueScene } from './scenes/DialogueScene';
import { EndingScene } from './scenes/EndingScene';
import { GameOverScene } from './scenes/GameOverScene';
import { HudScene } from './scenes/HudScene';
import { InventoryScene } from './scenes/InventoryScene';
import { PauseScene } from './scenes/PauseScene';
import { SpriteGalleryScene } from './scenes/SpriteGalleryScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldScene } from './scenes/WorldScene';

mountHomeButton();

createPixelGame({
  parent: 'game',
  width: SCREEN.width,
  height: SCREEN.height,
  backgroundColor: COLORS.screen,
  // The first scene in the list starts automatically.
  scenes: [
    BootScene,
    TitleScene,
    ControlsScene,
    WorldScene,
    HudScene,
    PauseScene,
    InventoryScene,
    DialogueScene,
    GameOverScene,
    EndingScene,
    SpriteGalleryScene,
  ],
});
