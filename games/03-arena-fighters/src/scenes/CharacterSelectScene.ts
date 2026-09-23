import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, ONE_PLAYER_SELECT_CONTROLS, SELECT_CONTROLS, type SelectAction } from '../config';
import { HOME_ARENAS } from '../content/arenas/arenaTypes';
import { SELECT_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { FIGHTERS, FIGHTER_IDS, isPlayableId, type FighterId, type PlayableId } from '../content/roster';
import { arcadeMatch, createArcadeRun } from '../systems/arcade';
import { choosesOpponent, DEFAULT_MATCH, hasCpuOpponent, isTwoPlayer, type MatchSetup, type PlayerIndex } from '../systems/matchSetup';
import { hostsRoom } from '../systems/net/roomCode';
import { drawSeed, randomFighter } from '../systems/randomPick';
import { soloMatchFor } from '../systems/soloMatch';
import type { StoryRequest } from './StoryScene';
import { SCENES } from './sceneKeys';
import { FighterGrid, movedBy } from './select/FighterGrid';
import { FighterPreview } from './select/FighterPreview';
import { activeSide, backFrom, everyoneReady, sidesChosen } from './select/selectFlow';

const HEADING_Y = 8;
const HINT_Y = 162;
const PLAYERS: readonly PlayerIndex[] = [0, 1];
/** Nobody has lost yet when the fighters are first chosen, so player 1 picks the first arena. */
const FIRST_ARENA_PICKER: PlayerIndex = 0;
/** The heading says which of the two picks a lone player is on, since one cursor makes both. */
const HEADINGS: Readonly<Record<PlayerIndex, string>> = { 0: 'SELECT FIGHTER', 1: 'SELECT OPPONENT' };

/** What each side is called. Only versus shows player 2's side, so only it uses the second one. */
function sideLabel(mode: MatchSetup['mode'], player: PlayerIndex): string {
  if (player === 0) return 'P1';
  return hasCpuOpponent(mode) ? 'CPU' : 'P2';
}

/**
 * Character select: a 4 × 4 grid of the fifteen fighters, shown from the belt up in their
 * stance, with a random box after them, a cursor per player, and each player's choice previewed
 * at full size on their own side.
 *
 * In versus both players choose at once, each driving their own cursor with the half of the
 * keyboard and the gamepad they will fight with. In VS CPU one player chooses twice, their own
 * fighter and then the computer's. In arcade and online only this player chooses, since arcade
 * draws its opponents from the ladder and online gets them from the other browser.
 * When both sides settle on the same fighter, player 2 fights in that fighter's alternate colours.
 */
export class CharacterSelectScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private setup!: MatchSetup;
  private inputs!: Readonly<Record<PlayerIndex, ActionInput<SelectAction>>>;
  private grid!: FighterGrid;
  private previews!: Readonly<Record<PlayerIndex, FighterPreview>>;
  private heading!: Phaser.GameObjects.BitmapText;
  private cursor!: Record<PlayerIndex, number>;
  private locked!: Record<PlayerIndex, boolean>;
  private updates = 0;
  private leaving = false;

  constructor() {
    super(SCENES.characterSelect);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    playMusic(SELECT_MUSIC);
    this.setup = setup;
    this.updates = 0;
    this.leaving = false;
    this.cursor = { 0: indexOfFighter(setup.fighters[0]), 1: indexOfFighter(setup.fighters[1]) };
    this.locked = { 0: false, 1: false };

    // In versus each player listens only to their own gamepad and their own half of the keys;
    // with one player, any pad drives them and the arrows move the cursor as well as WASD.
    const twoPlayer = isTwoPlayer(setup.mode);
    const slot = (player: PlayerIndex): number | undefined => (twoPlayer ? player : undefined);
    this.inputs = {
      0: new ActionInput(this, twoPlayer ? SELECT_CONTROLS[0] : ONE_PLAYER_SELECT_CONTROLS, slot(0)),
      1: new ActionInput(this, SELECT_CONTROLS[1], slot(1)),
    };

    this.heading = addCenteredPixelText(this, HEADING_Y, HEADINGS[0], { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, HINT_Y, this.hint(), { color: COLORS.muted });
    this.grid = new FighterGrid(this);
    this.previews = {
      0: new FighterPreview(this, 0, sideLabel(setup.mode, 0)),
      1: new FighterPreview(this, 1, sideLabel(setup.mode, 1)),
    };
    // Where the opponent is not chosen here, that side of the screen stays empty.
    if (!sidesChosen(setup.mode).includes(1)) this.previews[1].setVisible(false);
    this.refresh();
  }

  override update(): void {
    this.updates += 1;
    for (const player of PLAYERS) this.inputs[player].update();
    if (this.leaving) return;
    // Like the shared menu, the first frame is ignored: the button that opened this screen
    // may still be held, and would otherwise count as a fresh press and choose at once.
    if (this.updates <= 1) return;

    // In versus each player works their own side at the same time; otherwise one player works
    // the sides in turn, their own fighter first.
    if (isTwoPlayer(this.setup.mode)) for (const player of PLAYERS) this.handle(player, player);
    else this.handle(0, this.side());

    this.refresh();
    if (everyoneReady(this.setup.mode, this.locked)) this.start();
  }

  /** One side's turn at the grid: move the cursor, settle on a box, or take the choice back. */
  private handle(player: PlayerIndex, side: PlayerIndex): void {
    const input = this.inputs[player];
    if (input.justPressed('back')) {
      this.back(player, side);
      return;
    }
    if (this.locked[side]) return;
    const dx = Number(input.justPressed('right')) - Number(input.justPressed('left'));
    const dy = Number(input.justPressed('down')) - Number(input.justPressed('up'));
    if (dx !== 0 || dy !== 0) {
      this.cursor[side] = movedBy(this.cursor[side], dx, dy);
      playSound(SOUNDS.menuMove);
    }
    if (input.justPressed('confirm')) this.choose(side);
  }

  /**
   * Settles a side on the box its cursor is over. The random box has the computer choose instead,
   * and the cursor jumps to whoever it drew, so the player is shown who they were given rather
   * than finding out on the versus screen.
   */
  private choose(side: PlayerIndex): void {
    if (fighterAt(this.cursor[side]) === null) this.cursor[side] = indexOfFighter(randomFighter(drawSeed()));
    this.locked[side] = true;
    playSound(SOUNDS.lockIn);
  }

  /**
   * Back un-settles the side being chosen. Where one player chooses twice, backing out of the
   * opponent returns to their own fighter rather than leaving the screen; from an unsettled
   * cursor on their own side it leaves.
   */
  private back(player: PlayerIndex, side: PlayerIndex): void {
    const step = backFrom(player, side, this.locked);
    playSound(SOUNDS.back);
    if (step.kind === 'unsettle') {
      this.locked[step.side] = false;
      return;
    }
    this.leaving = true;
    fadeToScene(this, SCENES.modeSelect);
  }

  /** Which side one player's cursor is on: their own fighter, then, in VS CPU, the opponent. */
  private side(): PlayerIndex {
    return activeSide(this.setup.mode, this.locked);
  }

  private refresh(): void {
    const heading = HEADINGS[this.side()];
    if (heading !== this.heading.text) setCenteredPixelText(this.heading, heading);

    const picks = this.picks();
    const mirror = picks[0] !== null && picks[0] === picks[1];
    for (const player of PLAYERS) {
      this.grid.moveTo(player, this.cursor[player], this.locked[player], this.shows(player));
      if (!this.shows(player)) continue;
      const pick = picks[player];
      // Player 2 wears the alternate colours in a mirror match; player 1 keeps the real ones.
      if (pick === null) this.previews[player].drawRandom();
      else this.previews[player].draw(pick, mirror && player === 1, this.locked[player]);
    }
  }

  /** Only the sides chosen here are shown: nobody on this screen picks the other ones. */
  private shows(player: PlayerIndex): boolean {
    return sidesChosen(this.setup.mode).includes(player);
  }

  private picks(): readonly [PlayableId | null, PlayableId | null] {
    return [fighterAt(this.cursor[0]), fighterAt(this.cursor[1])];
  }

  private hint(): string {
    return isTwoPlayer(this.setup.mode) ? 'P1 WASD+F   P2 ARROWS+K   ESC BACK' : 'MOVE  ENTER OK  ESC BACK';
  }

  private start(): void {
    this.leaving = true;
    const fighters = this.chosen();
    // Arcade draws its own opponents: the run is started here, and the fighter's story opens it.
    if (this.setup.mode === 'arcade') {
      const run = createArcadeRun(fighters[0], drawSeed());
      const request: StoryRequest = { kind: 'intro', setup: arcadeMatch(run, this.setup.rules) };
      fadeToScene(this, SCENES.story, request);
      return;
    }
    // VS CPU has both fighters by now and goes on to choose the ground they meet on. The draw
    // behind the match is still made, so the arena select opens on one rather than on nothing.
    if (choosesOpponent(this.setup.mode)) {
      fadeToScene(this, SCENES.arenaSelect, soloMatchFor(this.setup, fighters[0], fighters[1], drawSeed()));
      return;
    }
    const setup: MatchSetup = { ...this.setup, fighters: [...fighters], arena: HOME_ARENAS[fighters[1]] };
    // Versus goes on to choose the ground it is fought on.
    if (isTwoPlayer(setup.mode)) {
      fadeToScene(this, SCENES.arenaSelect, { ...setup, arenaPicker: FIRST_ARENA_PICKER });
      return;
    }
    // Online: the host picks the arena on the way to the lobby, since the host names the whole
    // match and the two sides can then never disagree about where they are fighting. The guest
    // goes straight to the lobby, and is told the arena with the opponent and the rules.
    if (setup.mode === 'online') {
      fadeToScene(this, hostsRoom() ? SCENES.arenaSelect : SCENES.online, setup);
      return;
    }
    fadeToScene(this, SCENES.versus, setup);
  }

  /** Both sides once everyone has settled. A settled cursor has left the random box behind. */
  private chosen(): readonly [PlayableId, PlayableId] {
    const [one, two] = this.picks();
    return [one ?? FIGHTERS[0].id, two ?? FIGHTERS[0].id];
  }
}

/** The fighter in a box, or null for the random box, which holds nobody until it is taken. */
function fighterAt(index: number): PlayableId | null {
  return FIGHTER_IDS[index] ?? null;
}

/** Where a fighter sits in the grid. The boss is never on it, so he falls back to the first box. */
function indexOfFighter(id: FighterId): number {
  return isPlayableId(id) ? Math.max(0, FIGHTER_IDS.indexOf(id)) : 0;
}
