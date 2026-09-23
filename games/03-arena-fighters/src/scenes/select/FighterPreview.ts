import type * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS } from '../../config';
import { fighterName, type PlayableId } from '../../content/roster';
import { fighterAnimationKey, fighterSheetKey } from '../../content/sprites/fighterSprites';
import { ensureAltFighterSprites } from '../../content/sprites';
import type { PlayerIndex } from '../../systems/matchSetup';

const PREVIEW_X: Readonly<Record<PlayerIndex, number>> = { 0: 48, 1: 272 };
const FEET_Y = 122;
const SIDE_Y = 30;
const NAME_Y = 126;
const READY_Y = 138;
const PLAYER_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };

/**
 * One player's side of the character select: the fighter under their cursor, standing and
 * idling at full size, with their name under them. Player 2 faces left, so the two of them
 * look at each other across the grid.
 */
export class FighterPreview {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly name: Phaser.GameObjects.BitmapText;
  private readonly ready: Phaser.GameObjects.BitmapText;
  private readonly centerX: number;
  private shown: string | undefined;

  constructor(scene: Phaser.Scene, player: PlayerIndex, sideLabel: string) {
    this.centerX = PREVIEW_X[player];
    this.sprite = scene.add
      .sprite(this.centerX, FEET_Y, fighterSheetKey('brand', false), 'idle1')
      .setOrigin(0.5, 1)
      .setFlipX(player === 1);
    centerOn(addPixelText(scene, 0, SIDE_Y, sideLabel, { color: PLAYER_COLORS[player] }), this.centerX);
    this.name = addPixelText(scene, 0, NAME_Y, '', { color: COLORS.text });
    this.ready = centerOn(addPixelText(scene, 0, READY_Y, 'READY', { color: PLAYER_COLORS[player] }), this.centerX).setVisible(false);
  }

  /** `alternate` shows the fighter in their second colours, which player 2 wears in a mirror match. */
  draw(fighter: PlayableId, alternate: boolean, locked: boolean): void {
    if (alternate) ensureAltFighterSprites(this.sprite.scene, fighter);
    this.sprite.setVisible(true);
    const sheet = fighterSheetKey(fighter, alternate);
    // Only when the choice actually changes: this is called every frame, and setting the texture
    // would restart the idle animation and re-lay out the name on each one.
    if (sheet !== this.shown) {
      this.shown = sheet;
      this.sprite.setTexture(sheet, 'idle1');
      this.sprite.play(fighterAnimationKey(sheet, 'idle'), true);
      this.name.setText(fighterName(fighter));
      centerOn(this.name, this.centerX);
    }
    this.ready.setVisible(locked);
  }

  /**
   * The cursor is on the random box: there is nobody to show yet, so the side reads RANDOM rather
   * than leaving whoever the cursor passed over last standing there as if they had been chosen.
   * Forgetting what is shown makes the next real fighter redraw, name and animation included.
   */
  drawRandom(): void {
    this.shown = undefined;
    this.sprite.setVisible(false);
    this.name.setText('RANDOM');
    centerOn(this.name, this.centerX);
    this.ready.setVisible(false);
  }

  setVisible(visible: boolean): void {
    this.sprite.setVisible(visible);
    this.name.setVisible(visible);
    if (!visible) this.ready.setVisible(false);
  }
}

/** Centres a label on a column of the screen, snapped to a whole pixel so it stays sharp. */
function centerOn(label: Phaser.GameObjects.BitmapText, centerX: number): Phaser.GameObjects.BitmapText {
  return label.setX(Math.round(centerX - label.width / 2));
}
