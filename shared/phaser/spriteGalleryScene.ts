import * as Phaser from 'phaser';

import { ActionInput, type ActionBindings } from './actionInput';
import { addPixelText } from './pixelText';

/** One gallery cell: a looping animation, or a single frame of a texture. Labels are at most 8 characters. */
export type GalleryEntry =
  | { readonly label: string; readonly texture: string; readonly animation: string }
  | { readonly label: string; readonly texture: string; readonly frame: string };

export interface SpriteGalleryOptions {
  readonly key: string;
  readonly entries: readonly GalleryEntry[];
  readonly backgroundColor: number;
  readonly labelColor: number;
  /** The "PAGE 1/2" label in the last cell. */
  readonly pageColor: number;
}

const COLUMNS = 6;
const ROWS = 4;
const LABEL_MARGIN = 2;
/** Space under each sprite's feet. */
const FLOOR_MARGIN = 3;
/** Pause before one-shot animations play again. */
const REPLAY_DELAY_MS = 600;
/** The last cell of each page says which page it is. */
const PER_PAGE = COLUMNS * ROWS - 1;

/** Enter, Space, or A / Start on a gamepad shows the next page. */
const GALLERY_CONTROLS: ActionBindings<'next'> = {
  next: { keys: ['ENTER', 'SPACE'], buttons: [0, 9] },
};

/**
 * Development tool (open with `?scene=SpriteGallery`): plays every animation in a game on one
 * screen, a page at a time. Each game makes its own by extending this with its entries.
 */
export class SpriteGalleryScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private controls!: ActionInput<'next'>;
  private shown: Phaser.GameObjects.GameObject[] = [];
  private page = 0;

  constructor(private readonly options: SpriteGalleryOptions) {
    super(options.key);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.options.backgroundColor);
    this.controls = new ActionInput(this, GALLERY_CONTROLS);
    // Read once straight away, so a button still held from the previous screen is not a new press.
    this.controls.update();
    this.showPage(0);
  }

  override update(): void {
    this.controls.update();
    if (this.controls.justPressed('next')) this.showPage(this.page + 1);
  }

  private get pageCount(): number {
    return Math.ceil(this.options.entries.length / PER_PAGE);
  }

  private showPage(page: number): void {
    this.shown.forEach((object) => object.destroy());
    this.shown = [];
    this.page = page % this.pageCount;

    const { entries, labelColor, pageColor } = this.options;
    entries.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach((entry, index) => {
      const { left, top, width, height } = this.cell(index);
      const sprite = this.add.sprite(left + width / 2, top + height - FLOOR_MARGIN, entry.texture).setOrigin(0.5, 1);
      if ('animation' in entry) sprite.play({ key: entry.animation, repeat: -1, repeatDelay: REPLAY_DELAY_MS });
      else sprite.setFrame(entry.frame);

      this.shown.push(addPixelText(this, left + LABEL_MARGIN, top + LABEL_MARGIN, entry.label, { color: labelColor }), sprite);
    });

    const { left, top } = this.cell(PER_PAGE);
    this.shown.push(
      addPixelText(this, left + LABEL_MARGIN, top + LABEL_MARGIN, `PAGE ${this.page + 1}/${this.pageCount}`, {
        color: pageColor,
      }),
    );
  }

  private cell(index: number): { left: number; top: number; width: number; height: number } {
    const width = this.scale.width / COLUMNS;
    const height = this.scale.height / ROWS;
    return {
      left: Math.floor((index % COLUMNS) * width),
      top: Math.floor(Math.floor(index / COLUMNS) * height),
      width,
      height,
    };
  }
}
