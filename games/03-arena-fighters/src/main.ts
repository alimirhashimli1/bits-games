import '@shared/game-shell/gamePage.css';

import { mountHomeButton } from '@shared/game-shell/homeButton';
import { createPixelGame } from '@shared/phaser/createPixelGame';

import { COLORS, SCREEN } from './config';
import { BootScene } from './scenes/BootScene';
import { ArenaSelectScene } from './scenes/ArenaSelectScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { ContinueScene } from './scenes/ContinueScene';
import { ControlsScene } from './scenes/ControlsScene';
import { FightScene } from './scenes/FightScene';
import { ModeSelectScene } from './scenes/ModeSelectScene';
import { OnlineLobbyScene } from './scenes/OnlineLobbyScene';
import { OptionsScene } from './scenes/OptionsScene';
import { PauseScene } from './scenes/PauseScene';
import { ResultsScene } from './scenes/ResultsScene';
import { SpriteGalleryScene } from './scenes/SpriteGalleryScene';
import { StoryScene } from './scenes/StoryScene';
import { TitleScene } from './scenes/TitleScene';
import { VersusScene } from './scenes/VersusScene';

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
    OptionsScene,
    ControlsScene,
    ModeSelectScene,
    CharacterSelectScene,
    ArenaSelectScene,
    OnlineLobbyScene,
    StoryScene,
    VersusScene,
    FightScene,
    ResultsScene,
    ContinueScene,
    PauseScene,
    SpriteGalleryScene,
  ],
});
