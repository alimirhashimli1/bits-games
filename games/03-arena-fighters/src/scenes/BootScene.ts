import * as Phaser from 'phaser';

import { setMuted, toggleMuted, unlockAudio } from '@shared/audio/audioEngine';
import { devStartScene } from '@shared/phaser/devStartScene';
import { registerSprites } from '@shared/phaser/pixelSprites';

import { GLOBAL_KEYS } from '../config';
import { SPRITES } from '../content/sprites';
import { isBossStage } from '../systems/arcade';
import { DEFAULT_MATCH, type MatchResult, type MatchSetup } from '../systems/matchSetup';
import { roomFromUrl } from '../systems/net/roomCode';
import { changeSettings, settings } from '../systems/settings';
import type { StoryRequest } from './StoryScene';
import { devMatchSetup } from './devMatchSetup';
import { SCENES, type SceneKey } from './sceneKeys';

/**
 * Scenes that the `?scene=` development shortcut may jump to. The pause menu is left out: it is
 * laid over a running fight and has nothing to go back to on its own.
 */
const JUMPABLE_SCENES: readonly SceneKey[] = Object.values(SCENES).filter(
  (key) => key !== SCENES.boot && key !== SCENES.pause,
);

/** First scene: turns all pixel art into textures, then opens the title screen. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    registerSprites(this, SPRITES);
    // Browsers keep a page silent until it is used, so the first key press wakes the audio.
    unlockAudio();
    // Sound left off on the options screen, or with M, stays off the next time the game is opened.
    setMuted(!settings().sound);
    // Mute belongs to the whole game rather than to one screen, so it is bound on the window.
    const muteKeys: readonly string[] = GLOBAL_KEYS.mute;
    window.addEventListener('keydown', (event) => {
      if (event.repeat || !muteKeys.includes(event.key.toUpperCase())) return;
      changeSettings({ sound: !toggleMuted() });
    });

    // Development only: the address bar can jump to any scene with any match (see devMatchSetup).
    const jump = devStartScene(JUMPABLE_SCENES);
    if (jump !== undefined) {
      this.scene.start(jump, payloadFor(jump, devMatchSetup()));
      return;
    }
    // A link with a room code on it opens on the fighter select, ready to join that room: the
    // player picks who they are fighting as, and the lobby then knocks at the room.
    if (roomFromUrl() !== undefined) {
      this.scene.start(SCENES.characterSelect, { ...DEFAULT_MATCH, mode: 'online' } satisfies MatchSetup);
      return;
    }
    this.scene.start(SCENES.title);
  }
}

/**
 * What a jumped-to scene is handed. Most take the match itself, but the results want a finished
 * match and the story wants to know which of the two it is showing, so jumping straight to either
 * needs the right shape or the scene would open on nothing.
 */
function payloadFor(scene: SceneKey, setup: MatchSetup): MatchResult | StoryRequest | MatchSetup {
  if (scene === SCENES.results) return { setup, winner: 0 } satisfies MatchResult;
  // `?scene=Story&mode=arcade&p1=tala&rung=7` shows an ending; any earlier rung shows the intro.
  if (scene === SCENES.story) {
    const kind: StoryRequest['kind'] = setup.arcade && isBossStage(setup.arcade) ? 'ending' : 'intro';
    return { kind, setup } satisfies StoryRequest;
  }
  return setup;
}
