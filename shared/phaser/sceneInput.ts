import * as Phaser from 'phaser';

/**
 * Calls `callback` when any of the given keys is pressed (Phaser key names such as
 * 'ENTER', 'SPACE' or 'W'). Held-key repeats are ignored, and the listeners are
 * removed automatically when the scene shuts down.
 */
export function onKeyPress(scene: Phaser.Scene, keyNames: readonly string[], callback: () => void): void {
  const keyboard = scene.input.keyboard;
  if (!keyboard) return;

  // Phaser can occasionally hand the same key event to a scene twice; each press must count once.
  const handledEvents = new WeakSet<KeyboardEvent>();
  const handler = (event: KeyboardEvent): void => {
    if (event.repeat || handledEvents.has(event)) return;
    handledEvents.add(event);
    callback();
  };
  const eventNames = keyNames.map((keyName) => `keydown-${keyName}`);

  eventNames.forEach((eventName) => keyboard.on(eventName, handler));
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    eventNames.forEach((eventName) => keyboard.off(eventName, handler));
  });
}
