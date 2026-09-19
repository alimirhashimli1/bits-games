import * as Phaser from 'phaser';

import { addCenteredPixelText, addPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';

import { COLORS, SCREEN } from '../config';
import { builtFighter, fighterData } from '../content/fighters/fighterData';
import { segmentAt, type Move } from '../content/fighters/moves';
import type { AnyPoseName } from '../content/fighters/poseNames';
import type { SpecialBehaviour } from '../content/fighters/specials';
import { fighterName, type FighterId } from '../content/roster';
import { fighterAnimationKey, type FighterAnimationName } from '../content/sprites/fighterSprites';
import { DEFAULT_MATCH, type MatchSetup } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';
import { ScreenInput } from './screenInput';

/**
 * A looping animation, or a list of poses stepped through in turn. `key` is the pose Enter holds
 * it on; left out, it is the last pose that differs from the first (the kick at full stretch).
 */
type Preview =
  | { readonly animation: FighterAnimationName }
  | { readonly poses: readonly AnyPoseName[]; readonly key?: AnyPoseName };

type GalleryEntry = readonly [label: string, preview: Preview];

/** Labels are at most 10 characters so they fit over a 64-pixel cell. */
const LABEL_LENGTH = 10;

/** Every fighter's shared animations, reactions and normals. Their special moves follow (see `specialEntries`). */
const GALLERY: readonly GalleryEntry[] = [
  ['IDLE', { animation: 'idle' }],
  ['WALK FWD', { animation: 'walkForward' }],
  ['WALK BACK', { animation: 'walkBack' }],
  ['CROUCH', { poses: ['crouch'] }],
  ['JUMP', { animation: 'jump' }],
  ['BLOCK', { poses: ['blockStand'] }],
  ['BLOCK LOW', { poses: ['blockCrouch'] }],
  ['HIT', { poses: ['idle1', 'hitStand', 'hitStand', 'idle1'] }],
  ['HIT LOW', { poses: ['crouch', 'hitCrouch', 'hitCrouch', 'crouch'] }],
  ['GET UP', { poses: ['fall', 'lying', 'lying', 'getUp', 'idle1'] }],
  ['KNOCKDOWN', { animation: 'knockdown' }],
  ['WIN', { animation: 'win' }],
  ['ST LP', { poses: ['idle1', 'standLP', 'idle1'] }],
  ['ST HP', { poses: ['idle1', 'standHPWindup', 'standHP', 'standHP', 'idle1'] }],
  ['ST LK', { poses: ['idle1', 'standLK', 'standLK', 'idle1'] }],
  ['ST HK', { poses: ['idle1', 'standHKWindup', 'standHK', 'standHK', 'idle1'] }],
  ['CR LP', { poses: ['crouch', 'crouchLP', 'crouch'] }],
  ['CR HP', { poses: ['crouch', 'crouchHP', 'crouchHP', 'crouch'] }],
  ['CR LK', { poses: ['crouch', 'crouchLK', 'crouch'] }],
  ['CR HK', { poses: ['crouch', 'crouchHK', 'crouchHK', 'crouch'] }],
  ['JUMP LP', { poses: ['jumpTuck', 'jumpLP', 'jumpTuck'] }],
  ['JUMP HP', { poses: ['jumpTuck', 'jumpHP', 'jumpHP', 'jumpTuck'] }],
  ['JUMP LK', { poses: ['jumpTuck', 'jumpLK', 'jumpTuck'] }],
  ['JUMP HK', { poses: ['jumpTuck', 'jumpHK', 'jumpHK', 'jumpTuck'] }],
];

const COLUMNS = 5;
const ROWS = 2;
const PER_PAGE = COLUMNS * ROWS;
const CELL_WIDTH = SCREEN.width / COLUMNS;
const HEADER_Y = 4;
const FIRST_ROW_Y = 16;
const ROW_HEIGHT = 76;
/** Space between a cell's label and the sprite under it. */
const LABEL_HEIGHT = 10;
const FOOTER_Y = 170;
const POSE_STEP_MS = 180;

interface PosePreview {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly poses: readonly AnyPoseName[];
  readonly key: AnyPoseName | undefined;
}

/**
 * Development tool (`?scene=SpriteGallery&p1=brand`): every animation, reaction and normal
 * attack of one fighter, ten to a page. ← → change the page, Enter holds every move on its
 * key pose (the hit itself) for a closer look, and Esc goes back to the title.
 */
export class SpriteGalleryScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private screenInput!: ScreenInput;
  private sheetKey!: string;
  private entries: readonly GalleryEntry[] = [];
  private footer!: Phaser.GameObjects.BitmapText;
  private cells: Phaser.GameObjects.GameObject[] = [];
  private posePreviews: PosePreview[] = [];
  private page = 0;
  private poseStep = 0;
  private holding = false;

  constructor() {
    super(SCENES.spriteGallery);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    this.screenInput = new ScreenInput(this);
    const [fighter] = setup.fighters;
    this.sheetKey = builtFighter(fighter);
    this.entries = [...GALLERY, ...specialEntries(fighter)];
    this.page = 0;

    addCenteredPixelText(this, HEADER_Y, `${fighterName(fighter)}: SPRITE GALLERY`, { color: COLORS.title });
    this.footer = addCenteredPixelText(this, FOOTER_Y, '', { color: COLORS.muted });
    this.showPage();

    this.time.addEvent({ delay: POSE_STEP_MS, loop: true, callback: () => this.stepPoses() });
  }

  override update(): void {
    this.screenInput.update();
    const pages = Math.ceil(this.entries.length / PER_PAGE);
    if (this.screenInput.justPressed('left')) this.turnPage((this.page + pages - 1) % pages);
    if (this.screenInput.justPressed('right')) this.turnPage((this.page + 1) % pages);
    if (this.screenInput.justPressed('confirm')) this.toggleHold();
    if (this.screenInput.justPressed('back')) this.scene.start(SCENES.title);
  }

  private turnPage(page: number): void {
    this.page = page;
    this.showPage();
  }

  private showPage(): void {
    this.cells.forEach((cell) => cell.destroy());
    this.cells = [];
    this.posePreviews = [];

    this.entries.slice(this.page * PER_PAGE, (this.page + 1) * PER_PAGE).forEach(([label, preview], index) => {
      const left = (index % COLUMNS) * CELL_WIDTH;
      const top = FIRST_ROW_Y + Math.floor(index / COLUMNS) * ROW_HEIGHT;
      const text = addPixelText(this, 0, top, label, { color: COLORS.text });
      text.setX(Math.round(left + (CELL_WIDTH - text.width) / 2));
      const sprite = this.add.sprite(left + CELL_WIDTH / 2, top + LABEL_HEIGHT, this.sheetKey, 'idle1').setOrigin(0.5, 0);
      if ('animation' in preview) sprite.play(fighterAnimationKey(this.sheetKey, preview.animation));
      else this.posePreviews.push({ sprite, poses: preview.poses, key: preview.key ?? keyPose(preview.poses) });
      this.cells.push(text, sprite);
    });

    const pages = Math.ceil(this.entries.length / PER_PAGE);
    setCenteredPixelText(this.footer, `PAGE ${this.page + 1}/${pages}  < > PAGE  ENTER HOLD  ESC BACK`);
    this.stepPoses();
  }

  private toggleHold(): void {
    this.holding = !this.holding;
    this.stepPoses();
  }

  /** Steps every pose preview on together, so a list of poses plays like a slowed-down move. */
  private stepPoses(): void {
    if (!this.holding) this.poseStep += 1;
    for (const { sprite, poses, key } of this.posePreviews) {
      const pose = this.holding ? key : poses[this.poseStep % poses.length];
      sprite.setFrame(pose ?? 'idle1');
    }
  }
}

/** The pose a move is about: the last one that differs from where it starts, such as the kick at full stretch. */
function keyPose(poses: readonly AnyPoseName[]): AnyPoseName | undefined {
  const [first] = poses;
  return [...poses].reverse().find((pose) => pose !== first) ?? first;
}

/**
 * A fighter's special moves, each shown as the poses it goes through, from the stance and back.
 * A command throw shows its reach and then the throw itself, as if it had caught someone.
 * Enter holds one on the pose that matters (see `specialKeyPose`), and a throw on its lift.
 */
function specialEntries(fighter: FighterId): GalleryEntry[] {
  return fighterData(fighter).specials.map(({ name, move, behaviour }) => {
    const label = name.toUpperCase().slice(0, LABEL_LENGTH);
    if (behaviour.kind === 'commandThrow') {
      const reaching = move.segments.slice(0, move.segments.findIndex((segment) => segment.grab) + 1);
      const poses = [...reaching, ...behaviour.hold].map((segment) => segment.pose);
      const hold = { segments: behaviour.hold };
      const key = behaviour.lift ? segmentAt(hold, behaviour.lift.step)?.pose : poses[poses.length - 1];
      return [label, { poses: ['idle1', ...poses, 'idle1'], key }];
    }
    const poses = move.segments.map((segment) => segment.pose);
    return [label, { poses: ['idle1', ...poses, 'idle1'], key: specialKeyPose(move, behaviour) }];
  });
}

/** The pose that matters in a special: where it throws, answers a caught blow, heals, or lands its last strike. */
function specialKeyPose(move: Move, behaviour: SpecialBehaviour): AnyPoseName | undefined {
  switch (behaviour.kind) {
    case 'projectile':
      return segmentAt(move, behaviour.spawnStep)?.pose;
    case 'counter':
      return segmentAt(move, behaviour.answerStep)?.pose;
    case 'heal':
      return segmentAt(move, behaviour.healStep)?.pose;
    default:
      return move.segments.filter((segment) => segment.strike).pop()?.pose;
  }
}
