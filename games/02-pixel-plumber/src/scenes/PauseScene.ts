import { playSound } from '@shared/audio/audioEngine';
import { stopMusic } from '@shared/audio/music';
import { PauseScene as SharedPauseScene } from '@shared/phaser/pauseScene';

import { COLORS } from '../config';
import { CONTROLS_TABLE } from '../content/controls';
import { SOUNDS } from '../content/sounds';
import { SCENES } from './sceneKeys';

export type { PauseSceneData } from '@shared/phaser/pauseScene';

/**
 * The shared pause menu, laid over the frozen level. The music stops while it is open; the
 * level starts its loop again when it resumes.
 */
export class PauseScene extends SharedPauseScene {
  constructor() {
    super({
      key: SCENES.pause,
      titleKey: SCENES.title,
      controls: CONTROLS_TABLE,
      dimColor: COLORS.screen,
      onOpen: () => stopMusic(),
      onQuit: () => stopMusic(),
      onMove: () => playSound(SOUNDS.menuMove),
      onConfirm: () => playSound(SOUNDS.confirm),
    });
  }
}
