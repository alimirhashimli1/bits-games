import * as Phaser from 'phaser';

const DEFAULT_FADE_MS = 300;

/**
 * Scenes on their way out, so a second key press cannot start a second transition.
 *
 * A scene counts as leaving until it has actually shut down, not just until its fade ends:
 * `scene.start()` only switches on the next frame, and a press in that gap would otherwise
 * mark the scene as leaving again with nothing left to clear it. Phaser reuses scene
 * objects, so the next visit to that scene would then ignore every transition out of it.
 */
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
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => leavingScenes.delete(scene));

  const camera = scene.cameras.main;
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => scene.scene.start(nextSceneKey, data));
  // `force` interrupts a fade-in that is still running, otherwise the fade-out would be skipped.
  camera.fade(durationMs, 0, 0, 0, true);
}
