import { Peer, type DataConnection } from 'peerjs';

import { NET } from '../../config';
import { parseNetMessage, type NetMessage } from './netMessages';
import { newRoomCode, peerIdFor } from './roomCode';

/** Why an online match, or an attempt at one, came to an end. */
export type NetEndReason = 'left' | 'lost' | 'desync' | 'noRoom' | 'codeTaken' | 'error';

/** What each ending is called on screen. */
export const NET_END_TEXT: Readonly<Record<NetEndReason, string>> = {
  left: 'OPPONENT LEFT',
  lost: 'CONNECTION LOST',
  desync: 'GAMES OUT OF STEP',
  noRoom: 'ROOM NOT FOUND',
  codeTaken: 'ROOM CODE TAKEN',
  error: 'CONNECTION FAILED',
};

/** The signalling server's complaints, in our own words. Anything else is simply a failure. */
const PEER_ERRORS: Readonly<Record<string, NetEndReason>> = {
  'peer-unavailable': 'noRoom',
  'unavailable-id': 'codeTaken',
};

/** A goodbye is a courtesy: the connection is let go a moment later, once it has gone out. */
const GOODBYE_MS = 120;

/**
 * The line between the two browsers. One side opens a room under the code it made up, the other
 * knocks at that code, and the signalling server introduces them; from then on the messages go
 * straight from one browser to the other.
 *
 * Nothing that arrives is trusted: every message is put through `parseNetMessage` first and
 * dropped if it is not one of ours.
 */
export class PeerLink {
  private peer: Peer | undefined;
  private connection: DataConnection | undefined;
  private finished = false;

  /** The host's room is open and the code can be shared. */
  onReady: (() => void) | undefined;
  /** Both browsers are connected and can talk. */
  onOpen: (() => void) | undefined;
  onMessage: ((message: NetMessage) => void) | undefined;
  onClosed: ((reason: NetEndReason) => void) | undefined;

  private constructor(peerId: string, private readonly join: string | undefined) {
    const peer = new Peer(peerId, peerOptions());
    this.peer = peer;
    peer.on('open', () => this.onPeerOpen());
    peer.on('connection', (connection) => this.onIncoming(connection));
    peer.on('error', (error) => this.close(PEER_ERRORS[String(error.type)] ?? 'error'));
  }

  /** Opens a room under `code` and waits for someone to knock. */
  static host(code: string): PeerLink {
    return new PeerLink(peerIdFor(code), undefined);
  }

  /**
   * Knocks at `code`. The guest needs an address of its own as well, which nobody ever sees, so
   * it is a long code drawn the same way rather than one asked of the signalling server.
   */
  static guest(code: string): PeerLink {
    return new PeerLink(peerIdFor(newRoomCode(NET.guestCodeLength)), peerIdFor(code));
  }

  get open(): boolean {
    return this.connection?.open === true;
  }

  send(message: NetMessage): void {
    if (this.connection?.open === true) this.connection.send(message);
  }

  /**
   * Ends the match and lets go of the connection. The reason is passed on once, so the first
   * thing to go wrong is the one reported and a failure while closing cannot talk over it.
   */
  close(reason: NetEndReason): void {
    if (this.finished) return;
    this.finished = true;
    if (reason === 'left' || reason === 'desync') this.send({ t: 'bye' });
    // The goodbye is given a moment to leave before the connection is pulled out from under it.
    window.setTimeout(() => this.destroy(), GOODBYE_MS);
    this.onClosed?.(reason);
  }

  private destroy(): void {
    this.connection?.close();
    this.peer?.destroy();
    this.connection = undefined;
    this.peer = undefined;
  }

  /** The signalling server knows this browser now: the guest can knock, the host can wait. */
  private onPeerOpen(): void {
    if (this.join === undefined) {
      this.onReady?.();
      return;
    }
    this.hold(this.peer?.connect(this.join, { reliable: true, serialization: 'json' }));
  }

  /** The host takes the first guest to arrive and turns any later one away. */
  private onIncoming(connection: DataConnection): void {
    if (this.connection !== undefined) {
      connection.close();
      return;
    }
    this.hold(connection);
  }

  private hold(connection: DataConnection | undefined): void {
    if (connection === undefined) {
      this.close('error');
      return;
    }
    this.connection = connection;
    connection.on('open', () => this.onOpen?.());
    connection.on('data', (data) => this.receive(data));
    connection.on('close', () => this.close('lost'));
    connection.on('error', () => this.close('lost'));
  }

  private receive(data: unknown): void {
    const message = parseNetMessage(data);
    if (message === null) return;
    if (message.t === 'bye') {
      this.close('left');
      return;
    }
    this.onMessage?.(message);
  }
}

/**
 * Where the signalling server is. `VITE_PEER_HOST` in `.env.local` names your own; without one
 * it is the free public PeerJS server. The server only introduces the two browsers: the fight
 * itself never goes near it.
 */
function peerOptions(): { host?: string; secure?: boolean; port?: number; debug: number } {
  const host = String(import.meta.env.VITE_PEER_HOST ?? '');
  return host === '' ? { debug: 0 } : { host, secure: true, port: 443, debug: 0 };
}
