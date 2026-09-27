import * as Phaser from 'phaser';

import { ActionInput } from '@shared/phaser/actionInput';
import { Menu } from '@shared/phaser/menu';
import { addPixelText } from '@shared/phaser/pixelText';
import { Typewriter } from '@shared/phaser/typewriter';

import { COLORS, DIALOGUE, DIALOGUE_CONTROLS, ROOM, SCREEN } from '../config';
import { ANSWER_ROWS, pageOf, type Choice, type DialogueRequest } from '../systems/dialogue';
import { SCENES } from './sceneKeys';

/** Shown in the box's corner once a page is fully out and there is more to read. */
const MORE_MARK = '>';

/**
 * The dialogue box, laid over the frozen world: who is talking, and what they say typed out a
 * page at a time. Advancing shows the whole page, then the next one. A talk may end with a YES /
 * NO question, whose answer may lead to more pages. When it is over, the world goes on.
 */
export class DialogueScene extends Phaser.Scene {
  // Assigned in init() and create(), which Phaser always runs before update().
  private request!: DialogueRequest;
  private controls!: ActionInput<keyof typeof DIALOGUE_CONTROLS>;
  private paragraphs: readonly string[] = [];
  private pageIndex = 0;
  private choice: Choice | undefined;
  private typewriter: Typewriter | null = null;
  private lineLabels: Phaser.GameObjects.BitmapText[] = [];
  private more: Phaser.GameObjects.BitmapText | null = null;
  private menu: Menu | null = null;
  private boxTop = 0;
  /** Whatever opened the box may still be held on the first frame, so it is skipped. */
  private primed = false;

  constructor() {
    super(SCENES.dialogue);
  }

  init(data: DialogueRequest): void {
    this.request = data;
  }

  create(): void {
    const { margin, width, height, padding, alpha } = DIALOGUE;
    const left = (SCREEN.width - width) / 2;
    this.boxTop = this.request.position === 'top' ? ROOM.hudHeight + margin : SCREEN.height - margin - height;

    this.add
      .graphics()
      .fillStyle(COLORS.dialogueFrame)
      .fillRect(left, this.boxTop, width, height)
      .fillStyle(COLORS.dialogueBox, alpha)
      .fillRect(left + 1, this.boxTop + 1, width - 2, height - 2);
    if (this.request.speaker) addPixelText(this, left + padding, this.boxTop + padding, this.request.speaker.toUpperCase(), { color: COLORS.speaker });

    this.more = addPixelText(this, 0, 0, MORE_MARK, { color: COLORS.text }).setVisible(false);
    this.more.setPosition(left + width - padding - this.more.width, this.boxTop + height - padding - this.more.height);
    this.time.addEvent({
      delay: DIALOGUE.moreBlinkMs,
      loop: true,
      callback: () => this.more?.setAlpha(this.more.alpha > 0 ? 0 : 1),
    });

    this.controls = new ActionInput(this, DIALOGUE_CONTROLS);
    this.paragraphs = this.request.paragraphs;
    this.choice = this.request.choice;
    this.menu = null;
    this.primed = false;
    this.showPage(0);
  }

  override update(_time: number, delta: number): void {
    this.controls.update();
    if (this.menu) {
      this.menu.update();
      return;
    }
    this.typewriter?.update(delta);
    const finished = this.typewriter?.isFinished ?? true;
    const isLast = this.pageIndex === this.paragraphs.length - 1;

    if (finished && isLast && this.choice) {
      this.ask(this.choice);
      return;
    }
    this.more?.setVisible(finished && !isLast);

    if (!this.primed) {
      this.primed = true;
      return;
    }
    if (!this.controls.justPressed('advance')) return;
    if (!finished) this.typewriter?.finish();
    else if (isLast) this.close();
    else this.showPage(this.pageIndex + 1);
  }

  /** Types out one paragraph, below the speaker's name if there is one. */
  private showPage(index: number): void {
    this.pageIndex = index;
    this.lineLabels.forEach((label) => label.destroy());
    const lines = pageOf(this.paragraphs[index] ?? '');
    const { padding, lineHeight } = DIALOGUE;
    const left = (SCREEN.width - DIALOGUE.width) / 2 + padding;
    const top = this.firstLineY();
    this.lineLabels = lines.map((_, row) => addPixelText(this, left, top + row * lineHeight, '', { color: COLORS.text }));
    this.typewriter = new Typewriter(this.lineLabels, lines, DIALOGUE.charsPerSecond);
  }

  /** The question's page is out: YES and NO appear in the rows under it. */
  private ask(choice: Choice): void {
    this.choice = undefined;
    this.more?.setVisible(false);
    const firstAnswerRow = DIALOGUE.linesPerPage - ANSWER_ROWS;
    this.menu = new Menu(
      this,
      [
        { label: 'YES', onSelect: () => this.answer(choice, true) },
        { label: 'NO', onSelect: () => this.answer(choice, false) },
      ],
      {
        y: this.firstLineY() + firstAnswerRow * DIALOGUE.lineHeight,
        lineHeight: DIALOGUE.lineHeight,
        onCancel: () => this.answer(choice, false),
      },
    );
  }

  private answer(choice: Choice, yes: boolean): void {
    this.menu?.destroy();
    this.menu = null;
    this.paragraphs = choice.onAnswer(yes);
    if (this.paragraphs.length === 0) this.close();
    else {
      // The key that chose the answer must not also skip the reply.
      this.primed = false;
      this.showPage(0);
    }
  }

  /** Text starts under the speaker's name, or at the top of the box for a sign. */
  private firstLineY(): number {
    const { padding, lineHeight } = DIALOGUE;
    return this.boxTop + padding + (this.request.speaker ? lineHeight : 0);
  }

  private close(): void {
    this.request.onClose?.();
    this.lineLabels = [];
    this.typewriter = null;
    this.scene.stop();
    this.scene.resume(SCENES.world);
  }
}
