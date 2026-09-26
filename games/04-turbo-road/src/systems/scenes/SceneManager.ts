/** One screen of the game: the title, the race, a menu, ... */
export interface Scene {
  /** Advances the scene by one game step. */
  update(): void;
  draw(context: CanvasRenderingContext2D): void;
  /** Called once as the fade out to the next scene starts, to stop anything the scene left running. */
  leave?(): void;
}

/**
 * Runs one scene at a time and fades through black when switching.
 *
 * The old scene stops updating as soon as the fade out starts, so a second key press cannot
 * start a second switch. By the time the new scene updates, the key that left the old one has
 * been held for the whole fade, so it no longer counts as "just pressed" there either.
 */
export class SceneManager {
  private current: Scene | null = null;
  private next: Scene | null = null;
  /** 0 is fully visible, `fadeSteps` is fully black. */
  private darkness = 0;

  constructor(private readonly fadeSteps: number) {}

  /** Shows the first scene, fading in from black. */
  start(scene: Scene): void {
    this.current = scene;
    this.darkness = this.fadeSteps;
  }

  /** Fades out to black, then switches to `scene`. Ignored while a switch is already under way. */
  go(scene: Scene): void {
    if (this.next) return;
    this.next = scene;
    this.current?.leave?.();
  }

  update(): void {
    if (this.next) {
      this.darkness++;
      if (this.darkness >= this.fadeSteps) {
        this.current = this.next;
        this.next = null;
      }
      return;
    }

    if (this.darkness > 0) this.darkness--;
    this.current?.update();
  }

  draw(context: CanvasRenderingContext2D): void {
    this.current?.draw(context);
    if (this.darkness === 0) return;

    context.globalAlpha = this.darkness / this.fadeSteps;
    context.fillStyle = '#000000';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.globalAlpha = 1;
  }
}
