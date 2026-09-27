import { PixelGrid, rotateCounterClockwise, type Point } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { FACINGS, type Facing } from '../../systems/facing';
import { ART_COLORS } from '../palette';

/** Every enemy frame is one tile. */
const SIZE = 16;

function grid(): PixelGrid {
  return new PixelGrid(SIZE, SIZE);
}

function outlined(drawing: PixelGrid): PixelMap {
  drawing.outline('k');
  return drawing.toPixelMap();
}

/**
 * Creatures seen from above are drawn facing down, and their other facings are that drawing
 * turned a quarter at a time: down → right → up → left.
 */
function allFacings(facingDown: PixelMap): Readonly<Record<Facing, PixelMap>> {
  const right = rotateCounterClockwise(facingDown);
  const up = rotateCounterClockwise(right);
  return { down: facingDown, right, up, left: rotateCounterClockwise(up) };
}

/** Two frames per facing, named like `walk1-left`. */
function facingFrames([firstDown, secondDown]: readonly [PixelMap, PixelMap]): Record<string, PixelMap> {
  const first = allFacings(firstDown);
  const second = allFacings(secondDown);
  const entries = FACINGS.flatMap((facing) => [
    [`walk1-${facing}`, first[facing]],
    [`walk2-${facing}`, second[facing]],
  ]);
  return Object.fromEntries(entries) as Record<string, PixelMap>;
}

/** A walking animation for each facing, named `<name>-<facing>`. */
function facingAnimations(name: string, frameRate: number): Readonly<Record<Facing, PixelAnimationDefinition>> {
  const entries = FACINGS.map((facing) => [
    facing,
    { key: `${name}-${facing}`, frames: [`walk1-${facing}`, `walk2-${facing}`], frameRate, repeat: -1 },
  ]);
  return Object.fromEntries(entries) as Record<Facing, PixelAnimationDefinition>;
}

// --- Blub: a jelly that squats, then stretches up as it hops. ---

function blub(center: Point, radiusX: number, radiusY: number, eyesY: number): PixelMap {
  const [x, y] = center;
  const drawing = grid();
  drawing.fillEllipse(center, radiusX, radiusY, 'j');
  drawing.fillEllipse([x - 0.5, y - 0.5], radiusX - 1, radiusY - 1, 'J');
  drawing.fillCircle([x - 2.5, y - radiusY / 2], 1.3, 'L');
  drawing.plot(Math.floor(x) - 2, eyesY, 'k');
  drawing.plot(Math.ceil(x) + 2, eyesY, 'k');
  return outlined(drawing);
}

export const BLUB_SHEET = {
  key: 'blub',
  palette: { k: ART_COLORS.outline, j: ART_COLORS.blubDark, J: ART_COLORS.blub, L: ART_COLORS.blubLight },
  frames: {
    squat: blub([7.5, 11], 6.8, 4.3, 11),
    tall: blub([7.5, 9], 5.3, 6.3, 9),
  },
} as const satisfies SpriteSheetDefinition;

export const BLUB_ANIMATIONS = {
  /** Wobbles while it waits. */
  wobble: { key: 'blub-wobble', frames: ['squat', 'tall'], frameRate: 3, repeat: -1 },
  hop: { key: 'blub-hop', frames: ['tall'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

// --- Pebblenose: a round critter with a tube of a snout, which it spits pebbles from. ---

/** Its four little feet, which swap places between the two walking frames. */
const PEBBLENOSE_FEET: readonly [readonly Point[], readonly Point[]] = [
  [[2, 3], [12, 9]],
  [[2, 9], [12, 3]],
];

function pebblenose(feet: readonly Point[]): PixelMap {
  const drawing = grid();
  feet.forEach(([x, y]) => drawing.fillRect(x, y, 2, 2, 'q'));
  drawing.fillCircle([7.5, 6.5], 5.5, 'q');
  drawing.fillCircle([7, 6], 4.8, 'p');
  drawing.fillCircle([5.5, 4.5], 1.8, 'P');
  drawing.fillRect(6, 11, 4, 3, 'n');
  drawing.fillRect(7, 13, 2, 1, 'k');
  drawing.plot(5, 7, 'k');
  drawing.plot(10, 7, 'k');
  return outlined(drawing);
}

export const PEBBLENOSE_SHEET = {
  key: 'pebblenose',
  palette: {
    k: ART_COLORS.outline,
    p: ART_COLORS.pebblenose,
    P: ART_COLORS.pebblenoseLight,
    q: ART_COLORS.pebblenoseDark,
    n: ART_COLORS.pebblenoseSnout,
  },
  frames: facingFrames([pebblenose(PEBBLENOSE_FEET[0]), pebblenose(PEBBLENOSE_FEET[1])]),
} as const satisfies SpriteSheetDefinition;

export const PEBBLENOSE_ANIMATIONS = facingAnimations('pebblenose-walk', 6);

// --- Thornback: an armoured boar, spikes along its back, seen from above. ---

const THORNBACK_SPIKES: readonly Point[] = [[4, 3], [7, 2], [10, 3], [5, 6], [9, 6], [7, 8]];
const THORNBACK_LEGS: readonly [readonly Point[], readonly Point[]] = [
  [[1, 3], [13, 7]],
  [[1, 7], [13, 3]],
];

function thornback(legs: readonly Point[]): PixelMap {
  const drawing = grid();
  legs.forEach(([x, y]) => drawing.fillRect(x, y, 2, 3, 'a'));
  drawing.fillEllipse([7.5, 6], 6.5, 5, 'a');
  drawing.fillEllipse([7.5, 5.5], 5.3, 3.8, 'A');
  THORNBACK_SPIKES.forEach(([x, y]) => drawing.plot(x, y, 'Y'));
  drawing.fillCircle([7.5, 11.5], 3, 'h');
  drawing.plot(5, 14, 'Y');
  drawing.plot(10, 14, 'Y');
  drawing.plot(6, 11, 'k');
  drawing.plot(9, 11, 'k');
  return outlined(drawing);
}

export const THORNBACK_SHEET = {
  key: 'thornback',
  palette: {
    k: ART_COLORS.outline,
    a: ART_COLORS.thornbackDark,
    A: ART_COLORS.thornback,
    h: ART_COLORS.thornbackHead,
    Y: ART_COLORS.bone,
  },
  frames: facingFrames([thornback(THORNBACK_LEGS[0]), thornback(THORNBACK_LEGS[1])]),
} as const satisfies SpriteSheetDefinition;

export const THORNBACK_ANIMATIONS = {
  walk: facingAnimations('thornback-walk', 5),
  /** The same legs, much faster. */
  charge: facingAnimations('thornback-charge', 16),
} as const;

// --- Flitter: a bat, seen from the front. ---

function flitterBody(drawing: PixelGrid): PixelGrid {
  drawing.fillCircle([7.5, 8], 2.6, 'v');
  drawing.plot(6, 5, 'v');
  drawing.plot(9, 5, 'v');
  drawing.plot(6, 8, 'r');
  drawing.plot(9, 8, 'r');
  return drawing;
}

function flitterWings(tipY: number): PixelMap {
  const drawing = grid();
  drawing.line([5, 8], [1, tipY], 2, 'V');
  drawing.line([10, 8], [14, tipY], 2, 'V');
  return outlined(flitterBody(drawing));
}

function flitterResting(): PixelMap {
  const drawing = grid();
  drawing.fillRect(4, 7, 2, 4, 'V');
  drawing.fillRect(10, 7, 2, 4, 'V');
  return outlined(flitterBody(drawing));
}

export const FLITTER_SHEET = {
  key: 'flitter',
  palette: { k: ART_COLORS.outline, v: ART_COLORS.flitter, V: ART_COLORS.flitterWing, r: ART_COLORS.flitterEye },
  frames: { wingsUp: flitterWings(3), wingsDown: flitterWings(12), rest: flitterResting() },
} as const satisfies SpriteSheetDefinition;

export const FLITTER_ANIMATIONS = {
  fly: { key: 'flitter-fly', frames: ['wingsUp', 'wingsDown'], frameRate: 10, repeat: -1 },
  rest: { key: 'flitter-rest', frames: ['rest'], frameRate: 1 },
} as const satisfies Record<string, PixelAnimationDefinition>;

// --- Pebble: what a Pebblenose spits. ---

function pebble(): PixelMap {
  const drawing = grid();
  drawing.fillCircle([7.5, 7.5], 2.5, 'o');
  drawing.plot(6, 6, 'O');
  return outlined(drawing);
}

export const PEBBLE_SHEET = {
  key: 'pebble',
  palette: { k: ART_COLORS.outline, o: ART_COLORS.rock, O: ART_COLORS.rockLight },
  frames: { pebble: pebble() },
} as const satisfies SpriteSheetDefinition;
