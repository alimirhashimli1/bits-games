import { FIGHT_CLOCK, NET } from '../../config';
import { HOME_ARENAS } from '../../content/arenas/arenaTypes';
import type { PlayableId } from '../../content/roster';
import type { MatchRules, MatchSetup } from '../matchSetup';
import { NET_PROTOCOL, type NetMessage } from './netMessages';
import { openSession } from './netSession';
import { PeerLink, type NetEndReason } from './peerLink';

/** How far the two browsers have got towards a match, for the lobby to put on screen. */
export type LobbyStage = 'opening' | 'waiting' | 'joining' | 'agreeing';

export interface HandshakeHandlers {
  readonly onStage: (stage: LobbyStage) => void;
  /** The session is open and both sides have the same match: go and fight it. */
  readonly onStart: (setup: MatchSetup) => void;
  readonly onFailed: (reason: NetEndReason) => void;
}

/** Which side of the handshake this is. Only the host has rules, since only the host decides. */
type Role = { readonly kind: 'host'; readonly rules: MatchRules } | { readonly kind: 'guest' };

/** The first fight of a session. A rematch is the next one, and so on. */
const FIRST_MATCH = 0;
const STEP_MS = 1000 / FIGHT_CLOCK.stepsPerSecond;

/**
 * Getting two browsers to the same match. The guest knocks and says which fighter it has
 * chosen; the host measures the round trip a few times, picks the input delay from it, and
 * names the match — both fighters, the arena and the rules. Only the host decides, so there is
 * nothing for the two to disagree about.
 *
 * The host is player 1 and the guest player 2, which is also which side of the screen each
 * fights on. Either way the player at the keyboard uses the player 1 controls, since there is
 * only one of them at it.
 */
export class Handshake {
  private readonly link: PeerLink;
  private pings = 0;
  private sentAt = 0;
  private bestRoundTripMs = Number.POSITIVE_INFINITY;
  private guest: PlayableId | undefined;

  private constructor(
    private readonly role: Role,
    code: string,
    private readonly fighter: PlayableId,
    private readonly handlers: HandshakeHandlers,
  ) {
    const host = role.kind === 'host';
    this.link = host ? PeerLink.host(code) : PeerLink.guest(code);
    this.link.onReady = (): void => this.handlers.onStage('waiting');
    this.link.onOpen = (): void => this.onOpen();
    this.link.onMessage = (message): void => this.onMessage(message);
    this.link.onClosed = (reason): void => this.handlers.onFailed(reason);
    this.handlers.onStage(host ? 'opening' : 'joining');
  }

  /** Opens a room under `code` and waits for someone to arrive. */
  static host(code: string, fighter: PlayableId, rules: MatchRules, handlers: HandshakeHandlers): Handshake {
    return new Handshake({ kind: 'host', rules }, code, fighter, handlers);
  }

  /** Knocks at the room a link was sent for. */
  static guest(code: string, fighter: PlayableId, handlers: HandshakeHandlers): Handshake {
    return new Handshake({ kind: 'guest' }, code, fighter, handlers);
  }

  /** Lets go of the connection, for a player who backs out of the lobby. */
  cancel(): void {
    this.link.close('left');
  }

  private onOpen(): void {
    this.handlers.onStage('agreeing');
    if (this.role.kind === 'host') this.ping();
    else this.link.send({ t: 'hello', protocol: NET_PROTOCOL, fighter: this.fighter });
  }

  private onMessage(message: NetMessage): void {
    if (this.role.kind === 'host') this.onHostMessage(message);
    else this.onGuestMessage(message);
  }

  private onHostMessage(message: NetMessage): void {
    if (message.t === 'hello') {
      // A different build of the game would compute a different fight, so there is no match to play.
      if (message.protocol !== NET_PROTOCOL) {
        this.link.close('error');
        return;
      }
      this.guest = message.fighter;
      this.startIfReady();
    }
    if (message.t === 'pong' && message.id === this.pings - 1) {
      this.bestRoundTripMs = Math.min(this.bestRoundTripMs, performance.now() - this.sentAt);
      if (this.pings < NET.pings) this.ping();
      else this.startIfReady();
    }
  }

  private onGuestMessage(message: NetMessage): void {
    if (message.t === 'ping') {
      this.link.send({ t: 'pong', id: message.id });
      return;
    }
    if (message.t !== 'start') return;
    // The host names both fighters, but not this one's: a match played as somebody else would
    // only be two different fights on two screens.
    if (message.fighters[1] !== this.fighter) {
      this.link.close('error');
      return;
    }
    openSession(this.link, 1, message.delay, message.match);
    this.handlers.onStart({
      mode: 'online',
      fighters: message.fighters,
      arena: message.arena,
      rules: { roundSeconds: message.roundSeconds, roundsToWin: message.roundsToWin },
      cpuLevel: 'normal',
    });
  }

  private ping(): void {
    this.sentAt = performance.now();
    this.link.send({ t: 'ping', id: this.pings });
    this.pings += 1;
  }

  /** The host names the match once it knows who it is playing and how long the line is. */
  private startIfReady(): void {
    const role = this.role;
    const guest = this.guest;
    if (role.kind !== 'host' || guest === undefined) return;
    if (this.pings < NET.pings || !Number.isFinite(this.bestRoundTripMs)) return;

    const delay = delayFor(this.bestRoundTripMs);
    // The visitor's home ground, as in every other match where nobody chooses the arena.
    const arena = HOME_ARENAS[guest];
    this.link.send({
      t: 'start',
      match: FIRST_MATCH,
      fighters: [this.fighter, guest],
      arena,
      roundSeconds: role.rules.roundSeconds,
      roundsToWin: role.rules.roundsToWin,
      delay,
    });
    openSession(this.link, 0, delay, FIRST_MATCH);
    this.handlers.onStart({
      mode: 'online',
      fighters: [this.fighter, guest],
      arena,
      rules: role.rules,
      cpuLevel: 'normal',
    });
  }
}

/**
 * Steps of input delay for a line this long: enough for an input to cross before the step it
 * belongs to is fought, with one step in hand, and always within the limits either side can
 * live with. More delay is a match that answers late; less is a match that keeps stopping.
 */
function delayFor(roundTripMs: number): number {
  const steps = Math.ceil(roundTripMs / 2 / STEP_MS) + 1;
  return Math.min(Math.max(steps, NET.minDelaySteps), NET.maxDelaySteps);
}
