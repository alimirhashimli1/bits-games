import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS } from '../config';
import { SELECT_MUSIC } from '../content/music';
import { SOUNDS } from '../content/sounds';
import { FIGHTERS, isPlayableId, type PlayableId } from '../content/roster';
import { Handshake, type HandshakeHandlers, type LobbyStage } from '../systems/net/handshake';
import { NET_END_TEXT, type NetEndReason } from '../systems/net/peerLink';
import { forgetRoomInUrl, newRoomCode, roomFromUrl, roomLink } from '../systems/net/roomCode';
import { DEFAULT_MATCH, type MatchSetup } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';
import { ScreenInput } from './screenInput';

const HEADING_Y = 16;
const LABEL_Y = 52;
const CODE_Y = 68;
const STATUS_Y = 108;
const HINT_Y = 130;
const KEYS_Y = 162;

/** What each stage of getting connected is called on screen. */
const STAGE_TEXT: Readonly<Record<LobbyStage, string>> = {
  opening: 'OPENING ROOM',
  waiting: 'WAITING FOR OPPONENT',
  joining: 'CONNECTING',
  agreeing: 'AGREEING ON THE MATCH',
};

/**
 * The online lobby. One player opens a room and sends its link; whoever opens that link joins
 * it, and the match starts on both screens at once. There are no accounts and no lists of
 * rooms: a link, sent however the two of them already talk, is the whole of it.
 *
 * Which of the two this is was decided by the address bar before the fighter select: a page
 * opened from a link joins, and any other page hosts. The host arrives here having chosen the
 * arena as well as its fighter, since the match it names includes the ground it is fought on.
 */
export class OnlineLobbyScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private screenInput!: ScreenInput;
  private setup!: MatchSetup;
  private status!: Phaser.GameObjects.BitmapText;
  private hint!: Phaser.GameObjects.BitmapText;
  private handshake: Handshake | undefined;
  /** The room this side is hosting, if it is hosting one: what the link and the copy key carry. */
  private code: string | undefined;
  private leaving = false;

  constructor() {
    super(SCENES.online);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    playMusic(SELECT_MUSIC);
    this.setup = setup;
    this.screenInput = new ScreenInput(this);
    this.handshake = undefined;
    this.code = undefined;
    this.leaving = false;

    addCenteredPixelText(this, HEADING_Y, 'ONLINE', { color: COLORS.title, scale: 2 });
    this.status = addCenteredPixelText(this, STATUS_Y, '', { color: COLORS.text });
    this.hint = addCenteredPixelText(this, HINT_Y, '', { color: COLORS.muted });

    const joining = roomFromUrl();
    if (joining === undefined) this.hostRoom(this.fighter());
    else this.joinRoom(joining, this.fighter());
  }

  override update(): void {
    this.screenInput.update();
    if (this.leaving) return;
    if (this.screenInput.justPressed('back')) this.leave();
    if (this.screenInput.justPressed('confirm')) this.copyLink();
  }

  /** Opens a room of this player's own and puts its code on screen. */
  private hostRoom(fighter: PlayableId): void {
    const code = newRoomCode();
    this.code = code;
    addCenteredPixelText(this, LABEL_Y, 'ROOM CODE', { color: COLORS.muted });
    addCenteredPixelText(this, CODE_Y, code, { color: COLORS.title, scale: 3 });
    addCenteredPixelText(this, KEYS_Y, 'ENTER COPY LINK   ESC BACK', { color: COLORS.muted });
    setCenteredPixelText(this.hint, 'SEND THE LINK TO A FRIEND');
    this.handshake = Handshake.host(code, fighter, { rules: this.setup.rules, arena: this.setup.arena }, this.handlers());
  }

  /** Joins the room the link named. */
  private joinRoom(code: string, fighter: PlayableId): void {
    addCenteredPixelText(this, LABEL_Y, 'JOINING ROOM', { color: COLORS.muted });
    addCenteredPixelText(this, CODE_Y, code, { color: COLORS.title, scale: 3 });
    addCenteredPixelText(this, KEYS_Y, 'ESC BACK', { color: COLORS.muted });
    this.handshake = Handshake.guest(code, fighter, this.handlers());
  }

  private handlers(): HandshakeHandlers {
    return {
      onStage: (stage): void => setCenteredPixelText(this.status, STAGE_TEXT[stage]),
      onStart: (setup): void => this.startMatch(setup),
      onFailed: (reason): void => this.fail(reason),
    };
  }

  /**
   * The two browsers have agreed on a match. The room comes out of the address bar here, once
   * it has served its purpose: backing out of the lobby before this still returns to the same
   * room, while choosing ONLINE again after the match opens a room of this player's own
   * instead of knocking at one that has long since gone.
   */
  private startMatch(setup: MatchSetup): void {
    this.leaving = true;
    playSound(SOUNDS.connected);
    forgetRoomInUrl();
    fadeToScene(this, SCENES.versus, setup);
  }

  private fail(reason: NetEndReason): void {
    if (this.leaving) return;
    this.handshake = undefined;
    playSound(SOUNDS.netFailed);
    this.status.setTint(COLORS.player1);
    setCenteredPixelText(this.status, NET_END_TEXT[reason]);
    setCenteredPixelText(this.hint, 'TRY AGAIN FROM THE MENU');
  }

  /** The host's link, on the clipboard. Browsers can refuse this, so a refusal is reported. */
  private copyLink(): void {
    const code = this.code;
    if (code === undefined) return;
    playSound(SOUNDS.confirm);
    navigator.clipboard
      ?.writeText(roomLink(code))
      .then(() => setCenteredPixelText(this.hint, 'LINK COPIED'))
      .catch(() => setCenteredPixelText(this.hint, 'COPY THE ADDRESS BY HAND'));
  }

  private leave(): void {
    this.leaving = true;
    playSound(SOUNDS.back);
    this.handshake?.cancel();
    fadeToScene(this, SCENES.characterSelect, this.setup);
  }

  /** This player's fighter, chosen on the screen before. The boss is never one of them. */
  private fighter(): PlayableId {
    const chosen = this.setup.fighters[0];
    return isPlayableId(chosen) ? chosen : FIGHTERS[0].id;
  }
}
