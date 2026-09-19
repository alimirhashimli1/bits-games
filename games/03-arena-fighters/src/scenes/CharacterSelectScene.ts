import * as Phaser from 'phaser';

import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { HOME_ARENAS } from '../content/arenas/arenaTypes';
import { fighterName, type FighterId } from '../content/roster';
import { DEFAULT_MATCH, stepFighter, type MatchSetup, type PlayerIndex } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';
import { ScreenInput } from './screenInput';

const HEADING_Y = 24;
const MODE_Y = 44;
const ROW_Y: Readonly<Record<PlayerIndex, number>> = { 0: 80, 1: 104 };
const HINT_Y = 150;
const PLAYER_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };
const PLAYERS: readonly PlayerIndex[] = [0, 1];

/**
 * Placeholder character select: each human player in turn scrolls through the roster by name.
 * With one human player, the other side takes the next fighter along until arcade mode (step 23)
 * and online play (step 25) decide it properly. The portrait grid comes in step 22.
 */
export class CharacterSelectScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private screenInput!: ScreenInput;
  private setup!: MatchSetup;
  private picks!: [FighterId, FighterId];
  private rows!: Record<PlayerIndex, Phaser.GameObjects.BitmapText>;
  private choosing: PlayerIndex = 0;

  constructor() {
    super(SCENES.characterSelect);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    this.screenInput = new ScreenInput(this);
    this.setup = setup;
    this.picks = [...setup.fighters];
    this.choosing = 0;

    addCenteredPixelText(this, HEADING_Y, 'SELECT FIGHTER', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, MODE_Y, setup.mode.toUpperCase(), { color: COLORS.muted });
    addCenteredPixelText(this, HINT_Y, '< > CHOOSE   ENTER OK   ESC BACK', { color: COLORS.muted });
    this.rows = {
      0: addCenteredPixelText(this, ROW_Y[0], '', { color: PLAYER_COLORS[0] }),
      1: addCenteredPixelText(this, ROW_Y[1], '', { color: PLAYER_COLORS[1] }),
    };
    this.refresh();
  }

  override update(): void {
    this.screenInput.update();
    if (this.screenInput.justPressed('left')) this.scroll(-1);
    if (this.screenInput.justPressed('right')) this.scroll(1);
    if (this.screenInput.justPressed('confirm')) this.confirm();
    else if (this.screenInput.justPressed('back')) this.back();
  }

  private get humanPlayers(): number {
    return this.setup.mode === 'versus' ? 2 : 1;
  }

  private scroll(step: number): void {
    this.picks[this.choosing] = stepFighter(this.picks[this.choosing], step);
    this.refresh();
  }

  private confirm(): void {
    if (this.choosing === 0 && this.humanPlayers === 2) {
      this.choosing = 1;
      this.refresh();
      return;
    }
    // The fight takes place in player 2's home arena, until versus mode lets the players choose (step 24).
    const setup: MatchSetup = { ...this.setup, fighters: [...this.picks], arena: HOME_ARENAS[this.picks[1]] };
    fadeToScene(this, SCENES.versus, setup);
  }

  private back(): void {
    if (this.choosing === 1) {
      this.choosing = 0;
      this.refresh();
      return;
    }
    fadeToScene(this, SCENES.modeSelect);
  }

  private refresh(): void {
    if (this.humanPlayers === 1) this.picks[1] = stepFighter(this.picks[0], 1);
    for (const player of PLAYERS) {
      const name = fighterName(this.picks[player]);
      const label = player === this.choosing ? `< ${name} >` : name;
      setCenteredPixelText(this.rows[player], `P${player + 1} ${label}`);
    }
  }
}
