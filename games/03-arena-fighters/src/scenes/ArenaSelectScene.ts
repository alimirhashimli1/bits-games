import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, ONE_PLAYER_SELECT_CONTROLS, SELECT_CONTROLS, type SelectAction } from '../config';
import { builtArena } from '../content/arenas';
import { ARENA_IDS, type ArenaId } from '../content/arenas/arenaTypes';
import { SELECT_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { DEFAULT_MATCH, isTwoPlayer, type MatchSetup, type PlayerIndex } from '../systems/matchSetup';
import { ArenaGrid, movedByArena } from './select/ArenaGrid';
import { SCENES } from './sceneKeys';

const HEADING_Y = 10;
const NAME_Y = 156;
const HINT_Y = 168;

const PICKER_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };
/** In versus each player chooses with the keys they fight with, so the hint names theirs alone. */
const HINTS: Readonly<Record<PlayerIndex, string>> = {
  0: 'WASD MOVE   F OK   ESC BACK',
  1: 'ARROWS MOVE   K OK   , BACK',
};
/** Everywhere else one player is choosing, and there is only one set of keys to name. */
const ONE_PLAYER_HINT = 'MOVE  ENTER OK  ESC BACK';

/**
 * Where the match is fought. One player chooses from all sixteen arenas, each shown as a
 * shrunken picture of the stage itself.
 *
 * In versus, player 1 chooses the first match and after that whoever lost the last one does.
 * Nobody has to agree with anybody, the player who is behind gets the say, and a player who
 * keeps winning stops choosing the ground they win on. Who that is arrives in the match, so
 * this screen only has to read it.
 *
 * VS CPU and online reach it with one player at the controls: VS CPU comes here from the
 * fighter select and goes on to the fight, and online is the side hosting the room, which
 * names the arena along with the rest of the match and then goes to the lobby to send it.
 */
export class ArenaSelectScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private setup!: MatchSetup;
  private picker!: PlayerIndex;
  private chooserInput!: ActionInput<SelectAction>;
  private grid!: ArenaGrid;
  private name!: Phaser.GameObjects.BitmapText;
  private cursor = 0;
  private updates = 0;
  private leaving = false;

  constructor() {
    super(SCENES.arenaSelect);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    playMusic(SELECT_MUSIC);
    this.setup = setup;
    this.picker = setup.arenaPicker ?? 0;
    this.cursor = Math.max(0, ARENA_IDS.indexOf(setup.arena));
    this.updates = 0;
    this.leaving = false;

    // In versus the player choosing uses the half of the controls they fight with, and their own
    // gamepad; where one player is choosing alone, both sets of directions move the cursor and
    // either gamepad drives it.
    const twoPlayer = isTwoPlayer(setup.mode);
    const controls = twoPlayer ? SELECT_CONTROLS[this.picker] : ONE_PLAYER_SELECT_CONTROLS;
    this.chooserInput = new ActionInput(this, controls, twoPlayer ? this.picker : undefined);

    const heading = twoPlayer ? `PLAYER ${this.picker + 1} PICKS THE ARENA` : 'SELECT ARENA';
    addCenteredPixelText(this, HEADING_Y, heading, {
      color: twoPlayer ? PICKER_COLORS[this.picker] : COLORS.title,
    });
    this.name = addCenteredPixelText(this, NAME_Y, '', { color: COLORS.title });
    addCenteredPixelText(this, HINT_Y, twoPlayer ? HINTS[this.picker] : ONE_PLAYER_HINT, { color: COLORS.muted });
    this.grid = new ArenaGrid(this);
    this.refresh();
  }

  override update(): void {
    this.updates += 1;
    this.chooserInput.update();
    if (this.leaving) return;
    // As on the fighter select, the first frame is skipped: the button that opened this screen
    // may still be held, and would otherwise choose an arena the moment it appeared.
    if (this.updates <= 1) return;

    if (this.chooserInput.justPressed('back')) {
      this.leaving = true;
      playSound(SOUNDS.back);
      fadeToScene(this, SCENES.characterSelect, this.setup);
      return;
    }

    const dx = Number(this.chooserInput.justPressed('right')) - Number(this.chooserInput.justPressed('left'));
    const dy = Number(this.chooserInput.justPressed('down')) - Number(this.chooserInput.justPressed('up'));
    if (dx !== 0 || dy !== 0) {
      this.cursor = movedByArena(this.cursor, dx, dy);
      this.refresh();
      playSound(SOUNDS.menuMove);
    }
    if (this.chooserInput.justPressed('confirm')) this.start();
  }

  private refresh(): void {
    this.grid.moveTo(this.cursor, this.picker);
    setCenteredPixelText(this.name, builtArena(this.arena()).name);
  }

  private arena(): ArenaId {
    return ARENA_IDS[this.cursor] ?? this.setup.arena;
  }

  /**
   * The arena is settled. Everywhere but online that is the last thing a match needs, so the
   * VS screen is next; online it still has to be agreed with the other browser, so the lobby is.
   */
  private start(): void {
    this.leaving = true;
    playSound(SOUNDS.lockIn);
    const next = this.setup.mode === 'online' ? SCENES.online : SCENES.versus;
    fadeToScene(this, next, { ...this.setup, arena: this.arena() });
  }
}
