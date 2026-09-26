import { onZoomChange, pixelPerfectZoom } from '@shared/game-shell/pixelZoom';

/**
 * The game's canvas: drawn at its small native resolution, then shown larger by the
 * pixel-perfect zoom, so every game pixel is a sharp, even square on screen.
 */
export class PixelScreen {
  readonly context: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  private readonly canvas: HTMLCanvasElement;

  constructor(parentId: string, width: number, height: number) {
    const parent = document.getElementById(parentId);
    if (!parent) throw new Error(`The page has no element with id "${parentId}".`);

    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    parent.append(this.canvas);

    const context = this.canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('This browser does not support 2D canvas.');
    // Scaled sprites stay blocky instead of being blurred.
    context.imageSmoothingEnabled = false;
    this.context = context;

    this.fitToWindow();
    onZoomChange(() => this.fitToWindow());
  }

  /** The canvas keeps its native size; only its size on the page changes. */
  private fitToWindow(): void {
    const zoom = pixelPerfectZoom(this.width, this.height);
    this.canvas.style.width = `${this.width * zoom}px`;
    this.canvas.style.height = `${this.height * zoom}px`;
  }
}
