import { NET } from '../../config';

/** The name of the room in the address bar: `?room=K7QF2M`. */
const ROOM_PARAM = 'room';

/**
 * A room is a code the host makes up, which is also its address on the signalling server. The
 * alphabet leaves out the characters that look like one another (O and 0, I and 1, B and 8), so
 * a code can be read out loud or copied by hand without being mistaken.
 */
export function newRoomCode(length: number = NET.codeLength): string {
  const alphabet = NET.codeAlphabet;
  const draws = new Uint32Array(length);
  crypto.getRandomValues(draws);
  return Array.from(draws, (draw) => alphabet[draw % alphabet.length] ?? alphabet[0]).join('');
}

/** True for a code this game could have made. Codes arrive from the address bar, so they are checked. */
export function isRoomCode(value: string): boolean {
  if (value.length < 1 || value.length > NET.guestCodeLength) return false;
  return [...value].every((character) => NET.codeAlphabet.includes(character));
}

/** A code's address on the signalling server, which other games sharing it cannot collide with. */
export function peerIdFor(code: string): string {
  return `${NET.peerPrefix}${code}`;
}

/** The link the host sends: this page, with the room code on the end. */
export function roomLink(code: string): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set(ROOM_PARAM, code);
  return url.toString();
}

/** The room this page was opened for, if it was opened from a link and the code looks like one. */
export function roomFromUrl(): string | undefined {
  const code = new URLSearchParams(window.location.search).get(ROOM_PARAM);
  return code !== null && isRoomCode(code) ? code : undefined;
}

/**
 * Takes the room out of the address bar once it has been joined, so that choosing ONLINE again
 * after the match opens a room of this player's own instead of knocking at one that has gone.
 * Anything else in the address (the development shortcuts) is left where it is.
 */
export function forgetRoomInUrl(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(ROOM_PARAM)) return;
  url.searchParams.delete(ROOM_PARAM);
  window.history.replaceState(null, '', url.toString());
}
