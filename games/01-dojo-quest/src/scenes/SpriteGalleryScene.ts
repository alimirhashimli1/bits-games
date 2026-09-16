import * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS } from '../config';
import { HERO_MOVES } from '../content/fighters/heroMoves';
import type { HeroPoseName } from '../content/fighters/heroPoses';
import { HERO_ANIMATIONS, HERO_SHEET } from '../content/sprites/hero';
import { attackPhaseAt, type AttackMove } from '../entities/fighterMoves';
import { SCENES } from './sceneKeys';

const COLUMNS = 6;
const CELL_WIDTH = 53;
const CELL_HEIGHT = 60;
const LABEL_MARGIN = 2;
/** Pause before one-shot animations and attacks play again. */
const REPLAY_DELAY_MS = 600;
/** Shown between attack replays. */
const IDLE_FRAME: HeroPoseName = 'fight';

/** A gallery cell shows a looping animation, an attack played with its real phase timing, or a single frame. */
type Preview =
  | { readonly animation: string }
  | { readonly move: AttackMove }
  | { readonly frame: HeroPoseName };

/** Labels are at most 8 characters so they fit inside one cell. */
const GALLERY: ReadonlyArray<readonly [label: string, preview: Preview]> = [
  ['STAND', { animation: HERO_ANIMATIONS.stand.key }],
  ['RUN', { animation: HERO_ANIMATIONS.run.key }],
  ['TO FIGHT', { animation: HERO_ANIMATIONS.toFight.key }],
  ['TO STAND', { animation: HERO_ANIMATIONS.toStand.key }],
  ['IDLE', { animation: HERO_ANIMATIONS.fightIdle.key }],
  ['WALK', { animation: HERO_ANIMATIONS.walk.key }],
  ['PUNCH HI', { move: HERO_MOVES.punch.high }],
  ['PUNCH MD', { move: HERO_MOVES.punch.mid }],
  ['PUNCH LO', { move: HERO_MOVES.punch.low }],
  ['KICK HI', { move: HERO_MOVES.kick.high }],
  ['KICK MID', { move: HERO_MOVES.kick.mid }],
  ['KICK LO', { move: HERO_MOVES.kick.low }],
  ['BLOCK HI', { frame: 'blockHigh' }],
  ['BLOCK LO', { frame: 'blockLow' }],
  ['HIT', { animation: HERO_ANIMATIONS.hit.key }],
  ['FALL', { animation: HERO_ANIMATIONS.fall.key }],
];

interface AttackPreview {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly move: AttackMove;
}

/** Development tool (open with `?scene=SpriteGallery`): shows every hero animation, attack and block. */
export class SpriteGalleryScene extends Phaser.Scene {
  private attackPreviews: AttackPreview[] = [];

  constructor() {
    super(SCENES.spriteGallery);
  }

  create(): void {
    this.attackPreviews = [];

    GALLERY.forEach(([label, preview], index) => {
      const left = (index % COLUMNS) * CELL_WIDTH;
      const top = Math.floor(index / COLUMNS) * CELL_HEIGHT;

      addPixelText(this, left + LABEL_MARGIN, top + LABEL_MARGIN, label, { color: COLORS.muted });
      const sprite = this.add
        .sprite(left + Math.floor(CELL_WIDTH / 2), top + CELL_HEIGHT, HERO_SHEET.key)
        .setOrigin(0.5, 1);

      if ('animation' in preview) {
        sprite.play({ key: preview.animation, repeat: -1, repeatDelay: REPLAY_DELAY_MS });
      } else if ('move' in preview) {
        this.attackPreviews.push({ sprite, move: preview.move });
      } else {
        sprite.setFrame(preview.frame);
      }
    });
  }

  override update(time: number): void {
    for (const { sprite, move } of this.attackPreviews) {
      const cycleMs = move.windupMs + move.activeMs + move.recoveryMs + REPLAY_DELAY_MS;
      const phase = attackPhaseAt(move, time % cycleMs);

      if (phase === null) sprite.setFrame(IDLE_FRAME);
      else sprite.setFrame(phase === 'active' ? move.strikeFrame : move.windupFrame);
    }
  }
}
