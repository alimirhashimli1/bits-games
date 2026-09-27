import * as Phaser from 'phaser';

import { ROOM, SCREEN_CHANGE, WREN } from '../config';
import type { Wren } from '../entities/Wren';
import { FACING_VECTORS, type Facing } from './facing';

const ROOM_WIDTH = ROOM.columns * ROOM.tileSize;
const ROOM_HEIGHT = ROOM.rows * ROOM.tileSize;

/**
 * Slides from one screen to the next, as on the original console. The next room's layer must
 * already be drawn one screen away in `facing`; the camera moves across to it while Wren is
 * carried over the edge. Then everything is moved back by one screen, so the new room sits at
 * (0, 0) like every room, and `onDone` runs. Her body is off during the slide, so nothing
 * collides with her halfway. `extraCarry` carries her further in, past a dungeon room's wall.
 */
export function scrollToNextScreen(
  scene: Phaser.Scene,
  wren: Wren,
  nextLayer: Phaser.Tilemaps.TilemapLayer,
  facing: Facing,
  extraCarry: number,
  onDone: () => void,
): void {
  const { x, y } = FACING_VECTORS[facing];
  const shiftX = x * ROOM_WIDTH;
  const shiftY = y * ROOM_HEIGHT;
  const carryX = x * (WREN.body.width + SCREEN_CHANGE.carry + extraCarry);
  const carryY = y * (WREN.body.height + SCREEN_CHANGE.carry + extraCarry);

  wren.halt();
  wren.body.enable = false;
  const camera = scene.cameras.main;

  scene.tweens.add({ targets: camera, scrollX: shiftX, scrollY: shiftY, duration: SCREEN_CHANGE.scrollMs });
  scene.tweens.add({
    targets: wren,
    x: wren.x + carryX,
    y: wren.y + carryY,
    duration: SCREEN_CHANGE.scrollMs,
    onComplete: () => {
      camera.setScroll(0, 0);
      nextLayer.setPosition(0, 0);
      wren.body.enable = true;
      wren.body.reset(wren.x - shiftX, wren.y - shiftY);
      onDone();
    },
  });
}

/** Fades to black, runs `swap` while the screen is dark, fades back in, then runs `onDone`. */
export function fadeThroughBlack(scene: Phaser.Scene, swap: () => void, onDone: () => void): void {
  const camera = scene.cameras.main;
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    swap();
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, onDone);
    camera.fadeIn(SCREEN_CHANGE.fadeMs, 0, 0, 0);
  });
  camera.fadeOut(SCREEN_CHANGE.fadeMs, 0, 0, 0);
}
