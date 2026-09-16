import * as Phaser from 'phaser';

const DEFAULT_FADE_MS = 300;

/** Scenes currently fading out, so a second key press cannot start a second transition. */
const leavingScenes = new WeakSet<Phaser.Scene>();

/** Fades the scene in from black. Call at the start of `create()`. */
export function fadeIn(scene: Phaser.Scene, durationMs = DEFAULT_FADE_MS): void {
  scene.cameras.main.fadeIn(durationMs, 0, 0, 0);
}

/** Fades the scene out to black, then starts the next scene. */
export function fadeToScene(
  scene: Phaser.Scene,
  nextSceneKey: string,
  data?: object,
  durationMs = DEFAULT_FADE_MS,
): void {
  if (leavingScenes.has(scene)) return;
  leavingScenes.add(scene);

  const camera = scene.cameras.main;
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    leavingScenes.delete(scene);
    scene.scene.start(nextSceneKey, data);
  });
  // `force` interrupts a fade-in that is still running, otherwise the fade-out would be skipped.
  camera.fade(durationMs, 0, 0, 0, true);
}
