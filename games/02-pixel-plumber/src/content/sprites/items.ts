import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { LEVEL } from '../../config';
import { ART_COLORS } from '../palette';

const FRAME_SIZE = LEVEL.tileSize;

/** Centres each row in a 16-pixel frame and pads the frame to 16 rows. */
function centred(rows: readonly string[]): PixelMap {
  const padded = rows.map((row) => {
    const left = Math.floor((FRAME_SIZE - row.length) / 2);
    return '.'.repeat(left) + row + '.'.repeat(FRAME_SIZE - row.length - left);
  });
  const top = Math.floor((FRAME_SIZE - padded.length) / 2);
  const blank = '.'.repeat(FRAME_SIZE);
  return [
    ...new Array<string>(top).fill(blank),
    ...padded,
    ...new Array<string>(FRAME_SIZE - padded.length - top).fill(blank),
  ];
}

/** A brass coin turning on its edge: full face, three-quarter, edge-on. Q light · q brass · D shade. */
export const COIN_SHEET = {
  key: 'coin',
  palette: {
    k: ART_COLORS.outline,
    Q: ART_COLORS.questionLight,
    q: ART_COLORS.question,
    D: ART_COLORS.questionShade,
  },
  frames: {
    face: centred([
      'kkkk',
      'kQQQqk',
      'kQqqqqDk',
      'kQqQqqDk',
      'kQqQqqDk',
      'kQqQqqDk',
      'kQqQqqDk',
      'kQqQqqDk',
      'kQqQqqDk',
      'kQqqqqDk',
      'kqqqDk',
      'kkkk',
    ]),
    turning: centred(['kk', 'kQqk', 'kQqk', 'kQqk', 'kQqk', 'kQqk', 'kQqk', 'kQqk', 'kQqk', 'kQqk', 'kqDk', 'kk']),
    edge: centred(['kk', 'qD', 'qD', 'qD', 'qD', 'qD', 'qD', 'qD', 'qD', 'qD', 'qD', 'kk']),
  },
} as const satisfies SpriteSheetDefinition;

export const COIN_ANIMATIONS = {
  spin: { key: 'coin-spin', frames: ['face', 'turning', 'edge', 'turning'], frameRate: 8, repeat: -1 },
  /** A coin knocked out of a block spins much faster. */
  popSpin: { key: 'coin-pop-spin', frames: ['face', 'turning', 'edge', 'turning'], frameRate: 24, repeat: -1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

/** One of the four pieces a broken brick bursts into, 8×8. */
export const DEBRIS_SHEET = {
  key: 'brick-debris',
  palette: {
    L: ART_COLORS.brickLight,
    r: ART_COLORS.brick,
    e: ART_COLORS.brickShade,
    n: ART_COLORS.brickMortar,
  },
  frames: {
    piece: ['.LLLLLn.', 'LLrrrren', 'Lrrrrren', 'Lrrrrren', 'Leeeeeen', 'nnnnnnnn', '.LLn.Ln.', '..n...n.'],
  },
} as const satisfies SpriteSheetDefinition;
