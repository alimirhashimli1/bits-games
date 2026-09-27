import { mirrorPixelMap, rotateCounterClockwise } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

const BLADE_ROW = '......kWVk......';
const BLADE_LENGTH = 10;

/** The sword pointing up: the tip at the top, and the grip at the bottom, where Wren's hands are. */
const POINTING_UP: PixelMap = [
  '.......kk.......',
  ...Array.from({ length: BLADE_LENGTH }, () => BLADE_ROW),
  '....kyyyyyyk....',
  '....kkkbbkkk....',
  '......kbbk......',
  '......kbbk......',
  '......kyyk......',
];

const POINTING_LEFT = rotateCounterClockwise(POINTING_UP);

/**
 * Wren's sword, drawn as its own sprite beside her rather than as part of her frames, so it can
 * reach past her 16×16 frame and be moved about by the combat code. One frame per facing.
 */
export const SWORD_SHEET = {
  key: 'sword',
  palette: {
    k: ART_COLORS.outline,
    W: ART_COLORS.blade,
    V: ART_COLORS.bladeShade,
    y: ART_COLORS.amber,
    b: ART_COLORS.leather,
  },
  frames: {
    up: POINTING_UP,
    down: [...POINTING_UP].reverse(),
    left: POINTING_LEFT,
    right: mirrorPixelMap(POINTING_LEFT),
  },
} as const satisfies SpriteSheetDefinition;
