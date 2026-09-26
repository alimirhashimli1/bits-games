import '@shared/game-shell/gamePage.css';

import { toggleMuted, unlockAudio } from '@shared/audio/audioEngine';
import { mountHomeButton } from '@shared/game-shell/homeButton';

import { CONTROLS } from './content/controls';
import { FADE_STEPS, MAX_STEPS_PER_FRAME, SCREEN, STEPS_PER_SECOND } from './config';
import { BootScene } from './scenes/BootScene';
import { startFixedStepLoop } from './systems/fixedStepLoop';
import { ActionInput } from './systems/input/ActionInput';
import { SceneManager } from './systems/scenes/SceneManager';
import { PixelScreen } from './systems/screen/PixelScreen';

mountHomeButton();
// Browsers keep audio silent until the page is used, so the first key press or click wakes it.
unlockAudio();

const screen = new PixelScreen('game', SCREEN.width, SCREEN.height);
const game = { input: new ActionInput(CONTROLS), scenes: new SceneManager(FADE_STEPS) };
game.scenes.start(new BootScene(game));

startFixedStepLoop({
  stepsPerSecond: STEPS_PER_SECOND,
  maxStepsPerFrame: MAX_STEPS_PER_FRAME,
  update: () => {
    game.input.update();
    // Mute belongs to the whole game, not one scene.
    if (game.input.justPressed('mute')) toggleMuted();
    game.scenes.update();
  },
  draw: () => game.scenes.draw(screen.context),
});
