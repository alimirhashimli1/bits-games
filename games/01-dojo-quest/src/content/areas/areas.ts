import type * as Phaser from 'phaser';

import { ARENA, type GuardRank } from '../../config';
import type { HazardPlacement } from '../../entities/hazards/Hazard';
import * as paint from './paint';

export interface AreaDefinition {
  /** Shown when Kenji enters the area. */
  readonly name: string;
  /** The guard blocking the way, or null for an empty area. */
  readonly guard: GuardRank | null;
  /** True where Warlord Gorran waits instead of a guard. */
  readonly boss?: boolean;
  /** Bottom-centre positions of animated wall torches. */
  readonly torches: readonly paint.Point[];
  /** Scenery that turns dangerous once the guard is down. */
  readonly hazards?: readonly HazardPlacement[];
  /** Draws the background, including the floor. */
  readonly paint: (g: Phaser.GameObjects.Graphics) => void;
}

const NIGHT_SKY = [0x140c20, 0x1c1230, 0x261840, 0x321f50];
const STARS: readonly paint.Point[] = [
  [20, 12], [57, 30], [96, 8], [140, 22], [181, 10], [214, 34], [290, 16], [305, 44], [120, 40], [70, 50],
];
const GOLD = 0xffd23f;
const BANNER_RED = 0x8c2f39;

/** The eight fortress areas, in the order Kenji climbs through them. */
export const AREAS: readonly AreaDefinition[] = [
  {
    name: 'THE MOUNTAIN PATH',
    guard: 'rookie',
    torches: [],
    paint: (g) => {
      paint.bands(g, NIGHT_SKY, 0, ARENA.groundY);
      paint.dots(g, 0xf4f4f4, STARS);
      paint.circle(g, 0xf4e9c1, [256, 30], 9);
      paint.polygon(g, 0x2a1d3d, [
        [0, 110], [40, 70], [80, 95], [130, 55], [190, 100], [240, 65], [290, 90], [320, 75], [320, 150], [0, 150],
      ]);
      paint.polygon(g, 0x1b1328, [
        [0, 130], [50, 105], [100, 125], [160, 100], [220, 128], [270, 108], [320, 122], [320, 150], [0, 150],
      ]);
      paint.floor(g, 0x3a2f2a, 0x57473d);
      paint.dots(g, 0x57473d, [[30, 160], [88, 170], [150, 158], [210, 174], [275, 163]]);
    },
  },
  {
    name: 'THE CLIFF STAIRS',
    guard: 'rookie',
    torches: [[26, 112]],
    hazards: [{ kind: 'hawk' }],
    paint: (g) => {
      paint.bands(g, NIGHT_SKY, 0, ARENA.groundY);
      paint.dots(g, 0xf4f4f4, STARS);
      paint.circle(g, 0xf4e9c1, [272, 24], 8);
      // The valley, far below and to the right.
      paint.polygon(g, 0x2a1d3d, [
        [130, 124], [174, 98], [224, 120], [268, 94], [320, 114], [320, 150], [130, 150],
      ]);
      // The cliff face on the left, with steps cut into it.
      paint.rect(g, 0x3b3145, 0, 0, 116, 150);
      paint.polygon(g, 0x3b3145, [[116, 0], [116, 66], [148, 150], [116, 150]]);
      for (let step = 0; step < 6; step++) {
        paint.rect(g, 0x4a3f58, 6 + step * 14, 58 + step * 14, 18, 6);
      }
      paint.floor(g, 0x3a3348, 0x5b5270);
    },
  },
  {
    name: 'THE OUTER GATE',
    guard: 'veteran',
    torches: [[210, 104], [302, 104]],
    hazards: [{ kind: 'gate', left: 222, width: 66, openingTop: 70 }],
    paint: (g) => {
      paint.bands(g, NIGHT_SKY, 0, 60);
      paint.dots(g, 0xf4f4f4, STARS.filter(([, y]) => y < 36));
      paint.battlements(g, 0x4a4458, 36, 8, 8);
      paint.brickWall(g, { left: 0, top: 44, width: 320, height: 106, color: 0x4a4458, mortar: 0x3b3647 });
      // The gateway and its lintel. The portcullis itself is a hazard, so it can move.
      paint.rect(g, 0x5b5270, 216, 64, 78, 6);
      paint.rect(g, 0x120c18, 222, 70, 66, 80);
      paint.floor(g, 0x3c3548, 0x5b5270);
    },
  },
  {
    name: 'THE COURTYARD',
    guard: 'veteran',
    torches: [],
    paint: (g) => {
      paint.bands(g, NIGHT_SKY, 0, 72);
      paint.dots(g, 0xf4f4f4, STARS.filter(([, y]) => y < 44));
      paint.brickWall(g, { left: 0, top: 70, width: 320, height: 80, color: 0x5a4a3e, mortar: 0x4a3c32 });
      paint.polygon(g, 0x5e1f25, [[10, 70], [40, 48], [280, 48], [310, 70]]);
      paint.rect(g, 0x3e1418, 40, 44, 240, 4);
      for (const x of [70, 160, 250]) {
        paint.rect(g, 0x2b1d14, x, 70, 1, 10);
        paint.rect(g, 0xe4572e, x - 3, 80, 7, 9);
        paint.rect(g, GOLD, x - 1, 82, 3, 5);
      }
      // Cherry tree.
      paint.rect(g, 0x3b2418, 26, 96, 5, 54);
      paint.circle(g, 0xd98ca6, [22, 92], 12);
      paint.circle(g, 0xe8a9bf, [34, 86], 10);
      paint.circle(g, 0xd98ca6, [42, 98], 9);
      paint.floor(g, 0x4a3f36, 0x6b5a4b);
      for (let x = 32; x < 320; x += 32) paint.rect(g, 0x3e342c, x, 151, 1, 29);
    },
  },
  {
    name: 'THE BARRACKS',
    guard: 'veteran',
    torches: [[28, 106], [292, 106]],
    paint: (g) => {
      paint.bands(g, NIGHT_SKY, 0, 66);
      paint.dots(g, 0xf4f4f4, STARS.filter(([, y]) => y < 40));
      paint.brickWall(g, { left: 0, top: 64, width: 320, height: 86, color: 0x4a3f36, mortar: 0x3c332b });
      paint.polygon(g, 0x2e2119, [[0, 64], [44, 44], [276, 44], [320, 64]]);
      // Shuttered windows along the bunkhouse.
      for (const x of [62, 122, 182, 242]) {
        paint.rect(g, 0x241a14, x, 84, 24, 20);
        paint.rect(g, 0x5a4a3e, x + 2, 86, 20, 16);
        paint.rect(g, 0x241a14, x + 11, 86, 2, 16);
      }
      // Spear rack.
      paint.rect(g, 0x3b2418, 96, 118, 44, 3);
      for (const x of [100, 110, 120, 130]) {
        paint.rect(g, 0x6b5a4b, x, 92, 2, 26);
        paint.rect(g, 0xa9a9bd, x - 1, 88, 4, 5);
      }
      paint.floor(g, 0x413a32, 0x60564a);
    },
  },
  {
    name: 'THE INNER HALL',
    guard: 'elite',
    torches: [[47, 96], [157, 96], [267, 96]],
    paint: (g) => {
      paint.rect(g, 0x3b2a22, 0, 0, 320, 150);
      for (let x = 10; x < 320; x += 20) paint.rect(g, 0x33241d, x, 16, 1, 134);
      paint.rect(g, 0x24170f, 0, 0, 320, 16);
      paint.rect(g, 0x1b1109, 0, 16, 320, 2);
      paint.banner(g, { x: 90, top: 26, width: 24, height: 60, color: BANNER_RED, trim: GOLD });
      paint.banner(g, { x: 200, top: 26, width: 24, height: 60, color: BANNER_RED, trim: GOLD });
      for (const x of [40, 150, 260]) {
        paint.pillar(g, { x, width: 14, top: 18, bottom: 150, color: 0x6b3f24, shade: 0x4e2d19 });
      }
      paint.floor(g, 0x4a3222, 0x6b4a33);
      for (let x = 24; x < 320; x += 24) paint.rect(g, 0x3e2a1c, x, 151, 1, 29);
    },
  },
  {
    name: 'THE WATCHTOWER',
    guard: 'elite',
    torches: [[42, 100], [278, 100]],
    hazards: [{ kind: 'hawk' }],
    paint: (g) => {
      paint.bands(g, NIGHT_SKY, 0, ARENA.groundY);
      paint.dots(g, 0xf4f4f4, STARS);
      paint.circle(g, 0xf4e9c1, [62, 26], 10);
      // Fortress roofs far below the tower.
      paint.polygon(g, 0x241a2e, [
        [0, 116], [60, 102], [110, 118], [170, 100], [230, 118], [290, 104], [320, 116], [320, 150], [0, 150],
      ]);
      // The alarm bell under its little canopy.
      paint.rect(g, 0x2e2119, 140, 40, 40, 4);
      paint.polygon(g, 0x2e2119, [[130, 40], [160, 24], [190, 40]]);
      paint.rect(g, 0xa0663a, 157, 44, 6, 6);
      paint.circle(g, 0xa0663a, [160, 58], 10);
      paint.rect(g, 0xa0663a, 150, 56, 20, 8);
      paint.rect(g, 0x6b3f24, 158, 66, 4, 4);
      // The parapet Kenji fights behind.
      paint.battlements(g, 0x4a4458, 116, 10, 10);
      paint.brickWall(g, { left: 0, top: 126, width: 320, height: 24, color: 0x4a4458, mortar: 0x3b3647 });
      paint.floor(g, 0x3c3548, 0x5b5270);
    },
  },
  {
    name: 'THE THRONE ROOM',
    guard: null,
    boss: true,
    torches: [[70, 100], [230, 100]],
    paint: (g) => {
      paint.rect(g, 0x2a1b2e, 0, 0, 320, 150);
      for (const x of [20, 110, 190]) {
        paint.pillar(g, { x, width: 12, top: 0, bottom: 150, color: 0x4a3b63, shade: 0x3a2e4f });
      }
      paint.banner(g, { x: 268, top: 16, width: 36, height: 70, color: BANNER_RED, trim: GOLD });
      // Throne.
      paint.rect(g, 0x3b2a1a, 272, 86, 28, 64);
      paint.rect(g, GOLD, 272, 86, 28, 2);
      paint.rect(g, 0x3b2a1a, 266, 120, 40, 10);
      paint.rect(g, GOLD, 266, 120, 40, 1);
      paint.floor(g, 0x332538, 0x4a3b63);
      // Red carpet with gold edges, kept above the health pips at the bottom.
      paint.rect(g, BANNER_RED, 0, 152, 320, 17);
      paint.rect(g, GOLD, 0, 152, 320, 1);
      paint.rect(g, GOLD, 0, 168, 320, 1);
    },
  },
];

/** The area at `index`; throws if it does not exist. */
export function areaAt(index: number): AreaDefinition {
  const area = AREAS[index];
  if (!area) throw new Error(`There is no area ${index}.`);
  return area;
}
