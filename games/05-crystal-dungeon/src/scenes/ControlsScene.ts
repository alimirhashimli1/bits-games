import { ControlsScene as SharedControlsScene } from '@shared/phaser/controlsScene';

import { COLORS } from '../config';
import { CONTROLS_TABLE } from '../content/controls';
import { SCENES } from './sceneKeys';

/** The controls table, reached from the title menu. */
export class ControlsScene extends SharedControlsScene {
  constructor() {
    super({
      key: SCENES.controls,
      backKey: SCENES.title,
      controls: CONTROLS_TABLE,
      backgroundColor: COLORS.screen,
    });
  }
}
