import { PauseScene as SharedPauseScene } from '@shared/phaser/pauseScene';

import { COLORS } from '../config';
import { CONTROLS_TABLE } from '../content/controls';
import { SCENES } from './sceneKeys';

export type { PauseSceneData } from '@shared/phaser/pauseScene';

/** The shared pause menu, laid over the frozen world. */
export class PauseScene extends SharedPauseScene {
  constructor() {
    super({
      key: SCENES.pause,
      titleKey: SCENES.title,
      controls: CONTROLS_TABLE,
      dimColor: COLORS.dim,
    });
  }
}
