import type * as Phaser from 'phaser';

/**
 * Reveals text letter by letter across several lines, like an old game's dialogue box.
 * Call `update()` every frame; `finish()` shows everything at once.
 */
export class Typewriter {
  private readonly labels: readonly Phaser.GameObjects.BitmapText[];
  private readonly lines: readonly string[];
  private readonly charsPerSecond: number;
  private readonly totalChars: number;
  private elapsedMs = 0;
  private shownChars = 0;

  /** `labels[i]` shows `lines[i]`, so both lists must be the same length. */
  constructor(labels: readonly Phaser.GameObjects.BitmapText[], lines: readonly string[], charsPerSecond: number) {
    if (labels.length !== lines.length) {
      throw new Error(`Typewriter needs one label per line (got ${labels.length} labels, ${lines.length} lines).`);
    }
    this.labels = labels;
    this.lines = lines;
    this.charsPerSecond = charsPerSecond;
    this.totalChars = lines.reduce((sum, line) => sum + line.length, 0);
    this.render();
  }

  get isFinished(): boolean {
    return this.shownChars >= this.totalChars;
  }

  update(deltaMs: number): void {
    if (this.isFinished) return;

    this.elapsedMs += deltaMs;
    const chars = Math.min(this.totalChars, Math.floor((this.elapsedMs * this.charsPerSecond) / 1000));
    if (chars === this.shownChars) return;

    this.shownChars = chars;
    this.render();
  }

  finish(): void {
    this.shownChars = this.totalChars;
    this.render();
  }

  private render(): void {
    let remaining = this.shownChars;
    this.lines.forEach((line, index) => {
      this.labels[index]?.setText(line.slice(0, Math.max(0, remaining)));
      remaining -= line.length;
    });
  }
}
