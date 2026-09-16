import type * as Phaser from 'phaser';

/** Makes a game object blink on and off, like a retro "PRESS START" prompt. */
export function blink(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Components.Visible,
  intervalMs: number,
): void {
  scene.time.addEvent({
    delay: intervalMs,
    loop: true,
    callback: () => target.setVisible(!target.visible),
  });
}
