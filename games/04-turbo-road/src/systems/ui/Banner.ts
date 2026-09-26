import { drawCenteredOutlinedText } from './outlinedText';

/** A short message across the screen that clears itself after a while. */
export class Banner {
  private text = '';
  private stepsLeft = 0;

  constructor(
    private readonly y: number,
    private readonly color: string,
    private readonly showSteps: number,
  ) {}

  /** Replaces whatever message is up. It stays for `steps` steps: pass `Infinity` to keep it up. */
  show(text: string, steps = this.showSteps): void {
    this.text = text;
    this.stepsLeft = steps;
  }

  get isShowing(): boolean {
    return this.stepsLeft > 0;
  }

  update(): void {
    this.stepsLeft = Math.max(0, this.stepsLeft - 1);
  }

  draw(context: CanvasRenderingContext2D): void {
    if (this.stepsLeft > 0) drawCenteredOutlinedText(context, this.text, this.y, { color: this.color });
  }
}
