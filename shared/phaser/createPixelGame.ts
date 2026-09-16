import * as Phaser from 'phaser';

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

  const updateZoom = (): void => {
    game.scale.setZoom(pixelPerfectZoom(width, height));
  };
  window.addEventListener('resize', updateZoom);
  onPixelRatioChange(updateZoom);
  return game;
}

/**
 * The largest zoom that fits the window and makes every game pixel a whole number
 * of *physical* screen pixels.
 *
 * With Windows display scaling at 125%, one CSS pixel is 1.25 screen pixels, so a
 * CSS zoom of 5 would draw each game pixel 6.25 screen pixels wide and look blurry.
 * Instead we choose 6 screen pixels and convert back: a CSS zoom of 4.8.
 */
function pixelPerfectZoom(width: number, height: number): number {
  const pixelRatio = window.devicePixelRatio;
  const screenWidth = window.innerWidth * pixelRatio;
  const screenHeight = window.innerHeight * pixelRatio;
  const screenPixelsPerGamePixel = Math.max(1, Math.floor(Math.min(screenWidth / width, screenHeight / height)));
  return screenPixelsPerGamePixel / pixelRatio;
}

/** Calls `callback` when the pixel ratio changes, e.g. when the window moves to another monitor. */
function onPixelRatioChange(callback: () => void): void {
  const query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  query.addEventListener(
    'change',
    () => {
      callback();
      onPixelRatioChange(callback);
    },
    { once: true },
  );
}
