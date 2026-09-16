import type * as Phaser from 'phaser';

import { blink } from '@shared/phaser/effects';
import { addCenteredPixelText, addPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { Typewriter } from '@shared/phaser/typewriter';

import { COLORS, STORY, TIMING } from '../../config';

const BOX = { x: 8, y: 8, width: 304, height: 74 } as const;
const BOX_ALPHA = 0.9;
const TEXT_LEFT = BOX.x + 8;
const TITLE_Y = BOX.y + 6;
const FIRST_LINE_Y = BOX.y + 20;
const LINE_HEIGHT = 10;
const PROMPT_Y = BOX.y + BOX.height - 11;

/** Both prompts are the same length, so the centred prompt does not jump when it changes. */
const PROMPT_WHILE_TYPING = 'ENTER: SHOW ALL   ESC: SKIP';
const PROMPT_WHEN_DONE = 'ENTER: CONTINUE   ESC: SKIP';

/** The story text box: a framed panel with a title, typewriter text and a blinking prompt. */
export class StoryTextBox {
  private readonly typewriter: Typewriter;
  private readonly prompt: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene, title: string, lines: readonly string[]) {
    const box = scene.add.graphics();
    box.fillStyle(COLORS.muted).fillRect(BOX.x, BOX.y, BOX.width, BOX.height);
    box.fillStyle(COLORS.background, BOX_ALPHA).fillRect(BOX.x + 1, BOX.y + 1, BOX.width - 2, BOX.height - 2);

    addPixelText(scene, TEXT_LEFT, TITLE_Y, title, { color: COLORS.title });
    const lineLabels = lines.map((_, index) =>
      addPixelText(scene, TEXT_LEFT, FIRST_LINE_Y + index * LINE_HEIGHT, '', { color: COLORS.text }),
    );
    this.typewriter = new Typewriter(lineLabels, lines, STORY.charsPerSecond);

    this.prompt = addCenteredPixelText(scene, PROMPT_Y, PROMPT_WHILE_TYPING, { color: COLORS.muted });
    blink(scene, this.prompt, TIMING.promptBlinkMs);
  }

  update(deltaMs: number): void {
    this.typewriter.update(deltaMs);

    const prompt = this.typewriter.isFinished ? PROMPT_WHEN_DONE : PROMPT_WHILE_TYPING;
    if (this.prompt.text !== prompt) setCenteredPixelText(this.prompt, prompt);
  }

  /** Shows the whole text if it is still typing; returns true when the reader can move on. */
  requestAdvance(): boolean {
    if (this.typewriter.isFinished) return true;

    this.typewriter.finish();
    return false;
  }
}
