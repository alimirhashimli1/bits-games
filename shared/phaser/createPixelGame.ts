import * as Phaser from 'phaser';

import { onZoomChange, pixelPerfectZoom } from '@shared/game-shell/pixelZoom';

export interface PixelGameOptions {
  /** Id of the page element that will hold the canvas. */
  readonly parent: string;
  /** Native resolution, in game pixels. */
  readonly width: number;
  readonly height: number;
  readonly backgroundColor: number;
  readonly scenes: Phaser.Types.Scenes.SceneType[];
}

/**
 * Creates a Phaser game that renders at a small native resolution and scales up
 * by whole numbers only, so every game pixel stays a sharp, even square.
 */
export function createPixelGame({ parent, width, height, backgroundColor, scenes }: PixelGameOptions): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.NONE,
      width,
      height,
      zoom: pixelPerfectZoom(width, height),
    },
    scene: scenes,
  });

  onZoomChange(() => game.scale.setZoom(pixelPerfectZoom(width, height)));
  return game;
}
