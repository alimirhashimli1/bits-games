import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

/** The blast is drawn two tiles wide, a little wider than a bomb's reach on each side of it. */
const BLAST_SIZE = 32;
const BLAST_MIDDLE = 15.5;

/** A round blast: a bright core in an orange ball with a red edge, `radius` across. */
function blast(radius: number): PixelMap {
  const drawing = new PixelGrid(BLAST_SIZE, BLAST_SIZE);
  drawing.fillCircle([BLAST_MIDDLE, BLAST_MIDDLE], radius, 'e');
  drawing.fillCircle([BLAST_MIDDLE, BLAST_MIDDLE], radius * 0.75, 'm');
  drawing.fillCircle([BLAST_MIDDLE, BLAST_MIDDLE], radius * 0.4, 'c');
  return drawing.toPixelMap();
}

/** The last frame: a ring of grey smoke with a hollow middle. */
function smoke(radius: number): PixelMap {
  const drawing = new PixelGrid(BLAST_SIZE, BLAST_SIZE);
  drawing.fillCircle([BLAST_MIDDLE, BLAST_MIDDLE], radius, 's');
  drawing.fillCircle([BLAST_MIDDLE, BLAST_MIDDLE], radius - 3, '.');
  return drawing.toPixelMap();
}

/** A bomb going off: a small flash, a big ball of fire, then smoke. */
export const BLAST_SHEET = {
  key: 'blast',
  palette: { c: ART_COLORS.blastCore, m: ART_COLORS.blastMiddle, e: ART_COLORS.blastEdge, s: ART_COLORS.smoke },
  frames: { flash: blast(7), fire: blast(14), smoke: smoke(15) },
} as const satisfies SpriteSheetDefinition;

export const BLAST_ANIMATIONS = {
  burst: { key: 'blast-burst', frames: ['flash', 'fire', 'fire', 'smoke'], frameRate: 13 },
} as const satisfies Record<string, PixelAnimationDefinition>;

const FLAME_SIZE = 16;

/** A tongue of flame: a teardrop pointing up, pale in the middle. `lean` sways its tip. */
function flame(lean: number): PixelMap {
  const drawing = new PixelGrid(FLAME_SIZE, FLAME_SIZE);
  drawing.fillCircle([7.5, 10], 4, 'e');
  drawing.line([7.5, 10], [7.5 + lean, 2], 3, 'e');
  drawing.fillCircle([7.5, 10.5], 2.6, 'f');
  drawing.line([7.5, 10], [7.5 + lean / 2, 5], 1, 'f');
  drawing.fillCircle([7.5, 11], 1.2, 'c');
  return drawing.toPixelMap();
}

/** The Lantern's flame, held out in front of Wren. It flickers from side to side. */
export const FLAME_SHEET = {
  key: 'flame',
  palette: { c: ART_COLORS.flameCore, f: ART_COLORS.lanternFlame, e: ART_COLORS.flameEdge },
  frames: { left: flame(-1.5), right: flame(1.5) },
} as const satisfies SpriteSheetDefinition;

export const FLAME_ANIMATIONS = {
  flicker: { key: 'flame-flicker', frames: ['left', 'right'], frameRate: 10, repeat: -1 },
} as const satisfies Record<string, PixelAnimationDefinition>;
