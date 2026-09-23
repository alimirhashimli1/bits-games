import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import { PauseScene as SharedPauseScene } from '@shared/phaser/pauseScene';

import { COLORS } from '../config';
import { CONTROLS_TABLE } from '../content/controls';
import { SOUNDS } from '../content/sounds';
import { SCENES } from './sceneKeys';

export type { PauseSceneData } from '@shared/phaser/pauseScene';

/**
 * The pause menu, laid over the frozen fight. The arena's music stops while it is open and
 * starts again when the fight resumes. Online matches never open it: the other browser cannot
 * be stopped, so neither can this one.
 */
export class PauseScene extends SharedPauseScene {
  constructor() {
    super({
      key: SCENES.pause,
      titleKey: SCENES.title,
      controls: CONTROLS_TABLE,
      dimColor: COLORS.background,
      onOpen: () => stopMusic(),
      onQuit: () => stopMusic(),
      onMove: () => playSound(SOUNDS.menuMove),
      onConfirm: () => playSound(SOUNDS.confirm),
    });
  }
}
