import { GLYPHS } from '@shared/pixel-font/glyphs';

import { DIALOGUE } from '../config';

/** One box of text: up to `DIALOGUE.linesPerPage` lines. */
export type Page = readonly string[];

/** A question's page keeps this many of its lines free for the YES and NO rows. */
export const ANSWER_ROWS = 2;

/** A question at the end of a talk, answered YES or NO, as the shop asks "Buy it?". */
export interface Choice {
  /** Called with the answer. Returns what to say next (nothing closes the box). */
  readonly onAnswer: (yes: boolean) => readonly string[];
}

/** What the dialogue box shows: who is talking, what they say, and perhaps a question. */
export interface DialogueRequest {
  /** Shown above the text. Signs have none. */
  readonly speaker?: string;
  /** One paragraph per page, wrapped to fit. */
  readonly paragraphs: readonly string[];
  /** Asked after the last page. That page must leave room for the YES / NO rows under it. */
  readonly choice?: Choice;
  /** Where the box goes: over the half of the room Wren is not in. */
  readonly position: 'top' | 'bottom';
  /** Called as the box closes, before the world goes on: a gift is handed over here. */
  readonly onClose?: () => void;
}

/** Lines of at most `width` characters, broken between words. A word longer than a line is an error. */
export function wrapWords(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (word.length > width) throw new Error(`The word "${word}" is too long for one line of ${width} characters.`);
    if (line === '') line = word;
    else if (line.length + 1 + word.length <= width) line = `${line} ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line !== '') lines.push(line);
  return lines;
}

/** A paragraph wrapped into one page. */
export function pageOf(paragraph: string): Page {
  return wrapWords(paragraph, DIALOGUE.charsPerLine);
}

/**
 * Checks, once at boot, that every paragraph fits one page (leaving `reservedLines` free, for a
 * question's answers) and that the pixel font can draw every character in it. `where` names the
 * text in the error.
 */
export function checkText(paragraphs: readonly string[], where: string, reservedLines = 0): void {
  if (paragraphs.length === 0) throw new Error(`${where} has nothing to say.`);
  paragraphs.forEach((paragraph, index) => {
    const unknown = [...paragraph].find((character) => character !== ' ' && !(character.toUpperCase() in GLYPHS));
    if (unknown !== undefined) throw new Error(`${where}, page ${index + 1}, uses "${unknown}", which the pixel font cannot draw.`);
    const lines = pageOf(paragraph).length;
    const room = DIALOGUE.linesPerPage - reservedLines;
    if (lines > room) throw new Error(`${where}, page ${index + 1}, needs ${lines} lines, but a page has room for ${room}.`);
  });
}
