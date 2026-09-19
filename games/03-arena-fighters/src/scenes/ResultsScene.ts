import * as Phaser from 'phaser';

import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { fighterName } from '../content/roster';
import { DEFAULT_MATCH, type MatchResult } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';

const WINNER_Y = 48;
const PLAYER_Y = 72;
const MENU_Y = 104;

/** Who won (or a draw game), then a rematch, a new pick of fighters, or back to the title. */
export class ResultsScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;

  constructor() {
    super(SCENES.results);
  }

  create({ setup, winner }: MatchResult = { setup: DEFAULT_MATCH, winner: 0 }): void {
    fadeIn(this);

    if (winner === null) {
      addCenteredPixelText(this, WINNER_Y, 'DRAW GAME', { color: COLORS.title, scale: 2 });
    } else {
      const color = winner === 0 ? COLORS.player1 : COLORS.player2;
      addCenteredPixelText(this, WINNER_Y, `${fighterName(setup.fighters[winner])} WINS`, { color, scale: 2 });
      addCenteredPixelText(this, PLAYER_Y, `PLAYER ${winner + 1}`, { color: COLORS.muted });
    }

    this.menu = new Menu(
      this,
      [
        { label: 'REMATCH', onSelect: () => fadeToScene(this, SCENES.versus, setup) },
        { label: 'CHANGE FIGHTERS', onSelect: () => fadeToScene(this, SCENES.characterSelect, setup) },
        { label: 'TITLE', onSelect: () => fadeToScene(this, SCENES.title) },
      ],
      { y: MENU_Y, color: COLORS.muted, selectedColor: COLORS.title },
    );
  }

  override update(): void {
    this.menu.update();
  }
}
