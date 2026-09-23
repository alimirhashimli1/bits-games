import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, NET, TIMINGS } from '../config';
import { RESULTS_MUSIC } from '../content/music';
import { fighterName, isPlayableId } from '../content/roster';
import { SOUNDS } from '../content/sounds';
import { arcadeMatch, arcadeOutcome } from '../systems/arcade';
import {
  choosesOpponent,
  DEFAULT_MATCH,
  hasCpuOpponent,
  isTwoPlayer,
  nextArenaPicker,
  type MatchResult,
  type MatchSetup,
  type PlayerIndex,
} from '../systems/matchSetup';
import { closeSession, currentSession } from '../systems/net/netSession';
import { NET_END_TEXT, type NetEndReason } from '../systems/net/peerLink';
import { drawSeed } from '../systems/randomPick';
import { soloMatchFor } from '../systems/soloMatch';
import { SCENES } from './sceneKeys';
import type { StoryRequest } from './StoryScene';

const WINNER_Y = 48;
const PLAYER_Y = 72;
const MENU_Y = 104;
const PROGRESS_Y = 88;
/** Online only: what the other browser is doing, under the menu. */
const STATUS_Y = 136;

/** Both menus on this screen sit in the same place and answer the same way. */
const MENU_OPTIONS = {
  y: MENU_Y,
  color: COLORS.muted,
  selectedColor: COLORS.title,
  onMove: () => playSound(SOUNDS.menuMove),
  onConfirm: () => playSound(SOUNDS.confirm),
};

/**
 * Who won, and what follows. A versus match offers a rematch, a new pick or the title, and a VS
 * CPU match offers a freshly drawn opponent on top of those. An online match offers a rematch
 * that both sides have to agree to, and quitting, which closes the connection.
 *
 * An arcade match has no choice to offer: the ladder decides. Winning moves up a rung (or, at the
 * top, plays the fighter's ending), and losing goes to the continue count. The decision itself is
 * `arcadeOutcome`, so what happens next is worked out away from the drawing and can be tested.
 */
export class ResultsScene extends Phaser.Scene {
  // Assigned in create() for a versus match; an arcade match moves on by itself instead.
  private menu: Menu | undefined;
  /** Set for an online match, which is watched each frame for the other browser's answer. */
  private online: MatchSetup | undefined;
  private status: Phaser.GameObjects.BitmapText | undefined;

  constructor() {
    super(SCENES.results);
  }

  create({ setup, winner }: MatchResult = { setup: DEFAULT_MATCH, winner: 0 }): void {
    fadeIn(this);
    playMusic(RESULTS_MUSIC);
    this.menu = undefined;
    this.online = undefined;
    this.status = undefined;

    if (winner === null) {
      addCenteredPixelText(this, WINNER_Y, 'DRAW GAME', { color: COLORS.title, scale: 2 });
    } else {
      const color = winner === 0 ? COLORS.player1 : COLORS.player2;
      addCenteredPixelText(this, WINNER_Y, `${fighterName(setup.fighters[winner])} WINS`, { color, scale: 2 });
      addCenteredPixelText(this, PLAYER_Y, hasCpuOpponent(setup.mode) && winner === 1 ? 'CPU' : `PLAYER ${winner + 1}`, {
        color: COLORS.muted,
      });
    }

    if (setup.arcade) this.runLadder(setup, winner === 0);
    else if (setup.mode === 'online') this.offerRematch(setup);
    else this.offerChoices(setup, winner);
  }

  override update(): void {
    this.menu?.update();
    if (this.online !== undefined) this.watchOpponent(this.online);
  }

  /** In arcade the screen only reports: the ladder moves on by itself after a moment. */
  private runLadder(setup: MatchSetup, playerWon: boolean): void {
    const run = setup.arcade;
    if (!run) return;
    const step = arcadeOutcome(run, playerWon);

    if (step.kind === 'nextFight') {
      addCenteredPixelText(this, PROGRESS_Y, `NEXT: ${fighterName(run.ladder[step.run.stage] ?? run.fighter)}`, {
        color: COLORS.title,
      });
      this.moveOn(() => fadeToScene(this, SCENES.versus, arcadeMatch(step.run, setup.rules)));
      return;
    }
    if (step.kind === 'ending') {
      const request: StoryRequest = { kind: 'ending', setup };
      this.moveOn(() => fadeToScene(this, SCENES.story, request));
      return;
    }
    this.moveOn(() => fadeToScene(this, SCENES.continue, setup));
  }

  private moveOn(go: () => void): void {
    this.time.delayedCall(TIMINGS.arcadeNextMs, go);
  }

  private offerChoices(setup: MatchSetup, winner: PlayerIndex | null): void {
    this.menu = new Menu(
      this,
      [
        // VS CPU can hand the choice back to the computer, which saves walking the grid again.
        ...(choosesOpponent(setup.mode) ? [{ label: 'RANDOM OPPONENT', onSelect: () => this.drawAgain(setup) }] : []),
        { label: 'REMATCH', onSelect: () => this.rematch(setup, winner) },
        { label: 'CHANGE FIGHTERS', onSelect: () => fadeToScene(this, SCENES.characterSelect, setup) },
        { label: 'TITLE', onSelect: () => fadeToScene(this, SCENES.title) },
      ],
      MENU_OPTIONS,
    );
  }

  /**
   * Online, neither player can drag the other into another fight, so both have to ask for one:
   * the choice is sent, and the match starts again only once the same has come back. Changing
   * fighters is not offered, since that would mean agreeing a whole new match, which is what the
   * lobby is for, and the arena stays as it was, since only one side may ever decide that.
   */
  private offerRematch(setup: MatchSetup): void {
    this.online = setup;
    this.status = addCenteredPixelText(this, STATUS_Y, '', { color: COLORS.muted });
    this.menu = new Menu(
      this,
      [
        { label: 'REMATCH', onSelect: () => this.askRematch() },
        { label: 'QUIT', onSelect: () => this.quitOnline() },
      ],
      MENU_OPTIONS,
    );
  }

  private askRematch(): void {
    currentSession()?.askRematch();
    this.say('WAITING FOR OPPONENT');
  }

  private quitOnline(): void {
    this.online = undefined;
    closeSession('left');
    fadeToScene(this, SCENES.title);
  }

  /**
   * Each frame of an online results screen: the other browser may agree to another fight, or
   * the connection may end, and either way it is this screen that has to notice.
   */
  private watchOpponent(setup: MatchSetup): void {
    const session = currentSession();
    if (session === undefined) return;
    if (session.ended !== null) {
      this.lineEnded(session.ended);
      return;
    }
    if (!session.rematchAgreed) return;
    this.online = undefined;
    session.nextMatch();
    fadeToScene(this, SCENES.versus, setup);
  }

  private lineEnded(reason: NetEndReason): void {
    this.online = undefined;
    this.menu?.destroy();
    this.menu = undefined;
    closeSession(reason);
    playSound(SOUNDS.netFailed);
    this.say(NET_END_TEXT[reason]);
    this.time.delayedCall(NET.noticeMs, () => fadeToScene(this, SCENES.title));
  }

  private say(text: string): void {
    if (this.status) setCenteredPixelText(this.status, text);
  }

  /**
   * Another match with the same two fighters. In versus that means choosing the ground again,
   * and the choice goes to whoever just lost.
   */
  private rematch(setup: MatchSetup, winner: PlayerIndex | null): void {
    if (!isTwoPlayer(setup.mode)) {
      fadeToScene(this, SCENES.versus, setup);
      return;
    }
    fadeToScene(this, SCENES.arenaSelect, { ...setup, arenaPicker: nextArenaPicker(setup, winner) });
  }

  /**
   * Another VS CPU draw with the same fighter, level and rules, on the arena this player chose:
   * the draw is for an opponent, and moving the fight somewhere else was never asked for. Player
   * 1 is always one of the fifteen here, since only the fighter select can start a solo match;
   * the check is what proves it to the type, and an impossible boss in the seat simply changes
   * fighters instead.
   */
  private drawAgain(setup: MatchSetup): void {
    const player = setup.fighters[0];
    if (!isPlayableId(player)) {
      fadeToScene(this, SCENES.characterSelect, setup);
      return;
    }
    fadeToScene(this, SCENES.versus, { ...soloMatchFor(setup, player, undefined, drawSeed()), arena: setup.arena });
  }
}
