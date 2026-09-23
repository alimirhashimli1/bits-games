import { NET } from '../../config';
import { ARENA_IDS, type ArenaId } from '../../content/arenas/arenaTypes';
import { isPlayableId, type PlayableId } from '../../content/roster';

/** Raised whenever these shapes change, so two different builds refuse to play each other. */
export const NET_PROTOCOL = 1;

/** The most an input bitmask can be: four directions and four buttons. */
const MAX_INPUT_BITS = 255;
/** A checksum is an unsigned 32-bit number. */
const MAX_CHECKSUM = 0xffffffff;
const MAX_ROUND_SECONDS = 999;
const MAX_ROUNDS_TO_WIN = 9;
const MAX_PROTOCOL = 255;

/**
 * Everything the two browsers say to each other. The guest says hello, the host answers the
 * pings and then names the match; from there it is one input a step, a checksum a second, and
 * a word at the end.
 */
export type NetMessage =
  | { readonly t: 'hello'; readonly protocol: number; readonly fighter: PlayableId }
  | { readonly t: 'ping'; readonly id: number }
  | { readonly t: 'pong'; readonly id: number }
  | {
      readonly t: 'start';
      readonly match: number;
      readonly fighters: readonly [PlayableId, PlayableId];
      readonly arena: ArenaId;
      readonly roundSeconds: number;
      readonly roundsToWin: number;
      readonly delay: number;
    }
  | { readonly t: 'input'; readonly match: number; readonly frame: number; readonly bits: number }
  | { readonly t: 'check'; readonly match: number; readonly frame: number; readonly sum: number }
  | { readonly t: 'rematch'; readonly match: number }
  | { readonly t: 'bye' };

/**
 * Turns whatever arrived over the network into a message, or into nothing (rule 14: network data
 * is untrusted). Every field is checked one at a time — a known type, whole numbers inside their
 * own limits, and fighters and arenas that are really in the game — and the message handed back
 * is built here rather than being the thing that arrived, so nothing else can ride along with it.
 *
 * Whether a frame makes sense for the fight as it stands is a separate question, asked by the
 * inbox, which is the only thing that knows which step is being fought.
 */
export function parseNetMessage(data: unknown): NetMessage | null {
  const fields = asRecord(data);
  if (fields === null || typeof fields.t !== 'string') return null;
  switch (fields.t) {
    case 'hello': {
      const protocol = whole(fields.protocol, 0, MAX_PROTOCOL);
      const fighter = playable(fields.fighter);
      return protocol === null || fighter === null ? null : { t: 'hello', protocol, fighter };
    }
    case 'ping':
    case 'pong': {
      const id = whole(fields.id, 0, NET.pings);
      return id === null ? null : { t: fields.t === 'ping' ? 'ping' : 'pong', id };
    }
    case 'start':
      return parseStart(fields);
    case 'input':
      return parseFramed(fields, MAX_INPUT_BITS, 'bits', (match, frame, bits) => ({ t: 'input', match, frame, bits }));
    case 'check':
      return parseFramed(fields, MAX_CHECKSUM, 'sum', (match, frame, sum) => ({ t: 'check', match, frame, sum }));
    case 'rematch': {
      const match = whole(fields.match, 0, NET.maxMatch);
      return match === null ? null : { t: 'rematch', match };
    }
    case 'bye':
      return { t: 'bye' };
    default:
      return null;
  }
}

function parseStart(fields: Fields): NetMessage | null {
  const fighters = asArray(fields.fighters);
  const first = fighters ? playable(fighters[0]) : null;
  const second = fighters ? playable(fighters[1]) : null;
  const arena = ARENA_IDS.find((id) => id === fields.arena);
  const match = whole(fields.match, 0, NET.maxMatch);
  const roundSeconds = whole(fields.roundSeconds, 1, MAX_ROUND_SECONDS);
  const roundsToWin = whole(fields.roundsToWin, 1, MAX_ROUNDS_TO_WIN);
  const delay = whole(fields.delay, NET.minDelaySteps, NET.maxDelaySteps);
  if (fighters?.length !== 2 || first === null || second === null || arena === undefined) return null;
  if (match === null || roundSeconds === null || roundsToWin === null || delay === null) return null;
  return { t: 'start', match, fighters: [first, second], arena, roundSeconds, roundsToWin, delay };
}

/** The two messages sent every step or second: a match, a frame and one number of their own. */
function parseFramed(
  fields: Fields,
  maxValue: number,
  name: 'bits' | 'sum',
  make: (match: number, frame: number, value: number) => NetMessage,
): NetMessage | null {
  const match = whole(fields.match, 0, NET.maxMatch);
  const frame = whole(fields.frame, 0, NET.maxFrame);
  const value = whole(fields[name], 0, maxValue);
  if (match === null || frame === null || value === null) return null;
  return make(match, frame, value);
}

type Fields = Readonly<Record<string, unknown>>;

function asRecord(value: unknown): Fields | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Fields) : null;
}

function asArray(value: unknown): readonly unknown[] | null {
  return Array.isArray(value) ? value : null;
}

/** A whole number inside its limits, or nothing. Anything else — text, a fraction, NaN — is nothing. */
function whole(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  return value >= min && value <= max ? value : null;
}

function playable(value: unknown): PlayableId | null {
  return typeof value === 'string' && isPlayableId(value) ? value : null;
}
