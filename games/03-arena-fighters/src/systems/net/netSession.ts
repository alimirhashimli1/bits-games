import type { InputBits } from '../input/inputBits';
import type { PlayerIndex } from '../matchSetup';
import { NetInbox } from './netInbox';
import type { NetEndReason, PeerLink } from './peerLink';

/**
 * A live online match: the line to the other browser, which side of the screen this player is
 * on, how many steps of input delay the two agreed on, and everything the opponent has said
 * that the fight has not used yet.
 *
 * It outlives the screens. The fighters meet on the VS screen, fight, see the results and may
 * fight again, and the connection has to survive all of it — so there is one session for the
 * page, opened when the two browsers agree on a match and closed when either leaves.
 */
export class NetSession {
  readonly inbox = new NetInbox();
  private matchNumber: number;
  private asked = false;
  /** The match the opponent has asked to play next, if they have asked. */
  private askedOfUs = -1;
  private endReason: NetEndReason | null = null;

  constructor(
    private readonly link: PeerLink,
    readonly seat: PlayerIndex,
    readonly delay: number,
    match: number,
  ) {
    this.matchNumber = match;
    this.inbox.atMatch(match);
    this.link.onMessage = (message): void => {
      if (message.t === 'input') this.inbox.addInput(message.match, message.frame, message.bits);
      if (message.t === 'check') this.inbox.addCheck(message.match, message.frame, message.sum);
      if (message.t === 'rematch') this.askedOfUs = message.match;
    };
    this.link.onClosed = (reason): void => {
      this.endReason ??= reason;
    };
  }

  /** Why the match ended, once it has: a disconnect, a desync, or one side leaving. */
  get ended(): NetEndReason | null {
    return this.endReason;
  }

  /** Which fight of this session is being played. It is part of every input, so that a rematch
   * starting on one side cannot be mistaken for the fight the other side is still finishing. */
  get match(): number {
    return this.matchNumber;
  }

  sendInput(frame: number, bits: InputBits): void {
    this.link.send({ t: 'input', match: this.matchNumber, frame, bits });
  }

  sendCheck(frame: number, sum: number): void {
    this.link.send({ t: 'check', match: this.matchNumber, frame, sum });
  }

  /** Ends the match, and tells the other browser unless it was the one that ended it. */
  end(reason: NetEndReason): void {
    this.link.close(reason);
  }

  /** Both sides have to ask for a rematch, since neither can drag the other into another fight. */
  askRematch(): void {
    this.asked = true;
    this.link.send({ t: 'rematch', match: this.matchNumber + 1 });
  }

  get rematchAsked(): boolean {
    return this.asked;
  }

  get rematchAgreed(): boolean {
    return this.asked && this.askedOfUs === this.matchNumber + 1;
  }

  /** Moves on to the agreed fight. Both sides count its steps from zero again. */
  nextMatch(): void {
    this.matchNumber += 1;
    this.asked = false;
    this.askedOfUs = -1;
    this.inbox.atMatch(this.matchNumber);
  }
}

/**
 * The page's session, if there is one. It is kept here rather than handed from scene to scene
 * because it is a connection, not a piece of the match: there can only ever be one, and it has
 * to be closed however the player leaves.
 */
let session: NetSession | undefined;

export function openSession(link: PeerLink, seat: PlayerIndex, delay: number, match: number): NetSession {
  closeSession();
  session = new NetSession(link, seat, delay, match);
  return session;
}

export function currentSession(): NetSession | undefined {
  return session;
}

/** Leaves the match, if one is open. Called by every way out of online play. */
export function closeSession(reason: NetEndReason = 'left'): void {
  session?.end(reason);
  session = undefined;
}
