import { drawHumanoid } from '@shared/pixel-art/humanoidRig';
import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import { TRANSPARENT_PIXEL, type PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteAssets } from '@shared/phaser/pixelSprites';

import type { FighterArt } from '../fighters/fighterArt';

/**
 * The character select's portraits: each fighter from the belt up, in their fighting stance —
 * head, shoulders and raised fists — cut out of their own idle frame. Nothing is drawn twice, so
 * a new fighter gets a portrait for nothing, and the picture is the fighter rather than a head
 * floating in a box: at this size the stance says as much about them as the face does.
 */
export const PORTRAIT_FRAME = { width: 30, height: 28 } as const;

/**
 * The row of the 64×64 fighter frame the portrait starts at. Heads sit between rows 2 and 8
 * depending on how tall the fighter is, so starting at 3 clears every one of them but Vane's
 * crown by a row or two, and 28 rows down reaches the belt.
 */
const TOP_ROW = 3;

export function portraitSheetKey(id: string): string {
  return `portrait-${id}`;
}

export function createPortraitSprites(id: string, art: FighterArt): SpriteAssets {
  const bust = cutBust(drawHumanoid(art.poses.idle1, art.body));
  return {
    sheet: { key: portraitSheetKey(id), palette: art.palette, frames: { face: bust } },
    animations: [],
  };
}

/** The `?` box on the grid, which has the computer choose a fighter for you. */
export const RANDOM_PORTRAIT_KEY = 'portrait-random';

const MARK_SYMBOL = 'q';
const MARK_PALETTE = { [MARK_SYMBOL]: '#f4f4f4', o: '#14121c' };

/** A bold question mark, 12 × 19, the same shape the font draws but far larger. */
const QUESTION_MARK: PixelMap = [
  '...######...',
  '.##########.',
  '###......###',
  '##........##',
  '##........##',
  '##........##',
  '.........###',
  '........###.',
  '.......###..',
  '......###...',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '............',
  '............',
  '.....###....',
  '.....###....',
  '.....###....',
].map((row) => row.replaceAll('#', MARK_SYMBOL));

/**
 * The random box's picture: a question mark in the same frame as a portrait, outlined like the
 * fighters are so it sits on the grid as one of them rather than as a label stuck beside it.
 */
export function createRandomPortrait(): SpriteAssets {
  const grid = new PixelGrid(PORTRAIT_FRAME.width, PORTRAIT_FRAME.height);
  const width = QUESTION_MARK[0]?.length ?? 0;
  grid.stamp(
    QUESTION_MARK,
    Math.round((PORTRAIT_FRAME.width - width) / 2),
    Math.round((PORTRAIT_FRAME.height - QUESTION_MARK.length) / 2),
  );
  grid.outline('o');
  return {
    sheet: { key: RANDOM_PORTRAIT_KEY, palette: MARK_PALETTE, frames: { face: grid.toPixelMap() } },
    animations: [],
  };
}

/**
 * Cuts the bust out of a fighter's frame. Fighters stand off-centre in their frame by as much as
 * five pixels — they lean into the stance, and the far arm is drawn behind them — so the cut is
 * centred on whatever of the fighter actually falls in those rows rather than on the frame, which
 * is what keeps every portrait in the middle of its box without a hand-written offset per fighter.
 */
function cutBust(frame: PixelMap): PixelMap {
  const rows = frame.slice(TOP_ROW, TOP_ROW + PORTRAIT_FRAME.height);
  const left = leftColumn(rows);
  return Array.from({ length: PORTRAIT_FRAME.height }, (_, y) => cutRow(rows[y] ?? '', left));
}

/** The column the cut starts at, so the fighter's width in these rows sits in the middle of it. */
function leftColumn(rows: PixelMap): number {
  let first = Number.POSITIVE_INFINITY;
  let last = -1;
  for (const row of rows) {
    for (let x = 0; x < row.length; x += 1) {
      if (row[x] === TRANSPARENT_PIXEL) continue;
      first = Math.min(first, x);
      last = Math.max(last, x);
    }
  }
  if (last < 0) return 0;
  return Math.round((first + last + 1 - PORTRAIT_FRAME.width) / 2);
}

/** One row of the cut. Anything outside the frame is transparent, so a wide cut still lines up. */
function cutRow(row: string, left: number): string {
  let cut = '';
  for (let x = 0; x < PORTRAIT_FRAME.width; x += 1) cut += row[left + x] ?? TRANSPARENT_PIXEL;
  return cut;
}
