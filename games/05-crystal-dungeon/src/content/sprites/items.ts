import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

const SIZE = 16;
const ICON_SIZE = 8;

/** A crescent blade: a disc with a smaller disc cut out of its upper right, lit along its outer edge. */
function moonrang(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([7.5, 7.5], 6, 'd');
  drawing.fillCircle([7, 7], 5, 'm');
  drawing.fillCircle([6.5, 6.5], 3.5, 'l');
  drawing.fillCircle([10, 5], 5, '.');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A round bomb with a cap, a fuse and a flame at its tip. */
function bomb(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([7.5, 9.5], 4.5, 'b');
  drawing.fillRect(5, 7, 2, 2, 'B');
  drawing.fillRect(6, 4, 4, 2, 'b');
  drawing.line([9, 3], [11, 1], 1, 'f');
  drawing.plot(12, 0, 'y');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A brass lantern: a handle, a cap, a glowing glass middle and a base. */
function lantern(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillRect(6, 1, 4, 1, 'r');
  drawing.fillRect(6, 2, 1, 1, 'r');
  drawing.fillRect(9, 2, 1, 1, 'r');
  drawing.fillRect(4, 3, 8, 2, 'r');
  drawing.fillRect(5, 5, 6, 7, 'G');
  drawing.fillRect(6, 6, 4, 5, 'g');
  drawing.fillRect(7, 5, 2, 7, 'R');
  drawing.fillRect(4, 12, 8, 2, 'r');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** The Brightshield: a silver heater shield, lit on its left, with a gold cross on it. */
function brightshield(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillRect(3, 2, 10, 7, 'm');
  // Below its straight top half, each row is a pixel narrower on both sides, down to the point.
  for (let row = 0; row < 5; row++) drawing.fillRect(4 + row, 9 + row, 8 - row * 2, 1, 'm');
  drawing.fillRect(3, 2, 2, 7, 'l');
  drawing.fillRect(10, 2, 3, 7, 'd');
  drawing.fillRect(7, 3, 2, 8, 'y');
  drawing.fillRect(5, 5, 6, 2, 'y');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A heart potion: a round glass bottle of red, with a cork. */
function potion(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([7.5, 10], 4.5, 'w');
  drawing.fillCircle([7.5, 10.5], 3.5, 'p');
  drawing.fillRect(6, 4, 4, 3, 'w');
  drawing.fillRect(6, 2, 4, 2, 'f');
  drawing.fillRect(5, 9, 1, 2, 'P');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A key: a ring with a hole, a shaft going down and two teeth, `size` pixels square. */
function key(size: number): PixelMap {
  const drawing = new PixelGrid(size, size);
  const unit = size / ICON_SIZE;
  const middle = size / 2 - 0.5;
  drawing.fillCircle([middle, 2 * unit], 1.6 * unit, 'y');
  drawing.fillRect(Math.round(middle - unit / 2), Math.round(3 * unit), Math.max(1, Math.round(unit)), Math.round(3.5 * unit), 'y');
  drawing.fillRect(Math.round(middle + unit / 2), Math.round(5 * unit), Math.round(unit), Math.max(1, Math.round(unit / 2)), 'Y');
  drawing.fillRect(Math.round(middle + unit / 2), Math.round(6 * unit), Math.round(unit), Math.max(1, Math.round(unit / 2)), 'Y');
  drawing.plot(Math.round(middle), Math.round(2 * unit), '.');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A dungeon's map: a rolled-out parchment with ink lines for rooms. */
function dungeonMap(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillRect(2, 3, 12, 10, 'q');
  drawing.fillRect(2, 3, 1, 10, 'Q');
  drawing.fillRect(13, 3, 1, 10, 'Q');
  drawing.fillRect(4, 5, 3, 2, 'i');
  drawing.fillRect(9, 5, 3, 2, 'i');
  drawing.fillRect(6, 9, 4, 2, 'i');
  drawing.fillRect(7, 7, 1, 2, 'i');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A dungeon's compass: a brass rim round a pale face, its red needle pointing up. */
function compass(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([7.5, 8], 6, 'c');
  drawing.fillCircle([7.5, 8], 4.5, 'e');
  drawing.line([7.5, 4], [7.5, 8], 1, 'n');
  drawing.line([7.5, 9], [7.5, 11], 1, 'k');
  drawing.fillRect(7, 1, 2, 1, 'c');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** The boss key: bigger than a small key, with a crystal set in its bow. */
function bossKey(): PixelMap {
  const drawing = new PixelGrid(SIZE, SIZE);
  drawing.fillCircle([7.5, 4], 3.5, 'y');
  drawing.fillCircle([7.5, 4], 1.5, 'j');
  drawing.fillRect(6, 7, 3, 7, 'y');
  drawing.fillRect(9, 10, 3, 1, 'Y');
  drawing.fillRect(9, 12, 3, 2, 'Y');
  drawing.outline('k');
  return drawing.toPixelMap();
}

/** A dungeon's map, compass and boss key, as they lie in its rooms. */
export const DUNGEON_ITEM_SHEET = {
  key: 'dungeon-items',
  palette: {
    k: ART_COLORS.outline,
    q: ART_COLORS.parchment,
    Q: ART_COLORS.parchmentDark,
    i: ART_COLORS.ink,
    c: ART_COLORS.compassRim,
    e: ART_COLORS.compassFace,
    n: ART_COLORS.needle,
    y: ART_COLORS.keyGold,
    Y: ART_COLORS.keyGoldDark,
    j: ART_COLORS.crystal,
  },
  frames: { map: dungeonMap(), compass: compass(), bossKey: bossKey() },
} as const satisfies SpriteSheetDefinition;

/** A small green gem for the HUD's counter: lit top left, shaded bottom right. */
const GEM_ICON: PixelMap = [
  '...kk...',
  '..kaek..',
  '.kaaeek.',
  'kaaeeeck',
  'keeeecck',
  '.keecck.',
  '..kcck..',
  '...kk...',
];

/** A small bomb for the HUD's counter. */
function bombIcon(): PixelMap {
  const drawing = new PixelGrid(ICON_SIZE, ICON_SIZE);
  drawing.fillCircle([3.5, 4.5], 2.6, 'b');
  drawing.plot(2, 3, 'B');
  drawing.plot(5, 1, 'f');
  drawing.outline('k');
  drawing.plot(6, 0, 'F');
  return drawing.toPixelMap();
}

const ITEM_PALETTE = {
  k: ART_COLORS.outline,
  m: ART_COLORS.moonrang,
  l: ART_COLORS.moonrangLight,
  d: ART_COLORS.moonrangDark,
  b: ART_COLORS.bomb,
  B: ART_COLORS.bombLight,
  f: ART_COLORS.fuse,
  y: ART_COLORS.flame,
  r: ART_COLORS.brass,
  R: ART_COLORS.brassDark,
  g: ART_COLORS.lanternGlow,
  G: ART_COLORS.lanternGlowDark,
  p: ART_COLORS.potion,
  P: ART_COLORS.potionLight,
  w: ART_COLORS.glass,
} as const;

/** The items as they show in the HUD's box, the inventory, when found, and in the shop. */
export const ITEM_SHEET = {
  key: 'items',
  palette: ITEM_PALETTE,
  frames: { moonrang: moonrang(), bombs: bomb(), lantern: lantern(), brightshield: brightshield(), potion: potion() },
} as const satisfies SpriteSheetDefinition;

/** A small key lying in a room, the same size as the other pickups. */
export const KEY_SHEET = {
  key: 'key',
  palette: { k: ART_COLORS.outline, y: ART_COLORS.keyGold, Y: ART_COLORS.keyGoldDark },
  frames: { key: key(SIZE) },
} as const satisfies SpriteSheetDefinition;

/** The 8-pixel icons beside the HUD's counters. */
export const HUD_ICON_SHEET = {
  key: 'hud-icons',
  palette: {
    ...ITEM_PALETTE,
    y: ART_COLORS.keyGold,
    Y: ART_COLORS.keyGoldDark,
    F: ART_COLORS.flame,
    a: ART_COLORS.gemGreenLight,
    e: ART_COLORS.gemGreen,
    c: ART_COLORS.gemGreenDark,
  },
  frames: {
    gem: GEM_ICON,
    key: key(ICON_SIZE),
    bomb: bombIcon(),
  },
} as const satisfies SpriteSheetDefinition;
