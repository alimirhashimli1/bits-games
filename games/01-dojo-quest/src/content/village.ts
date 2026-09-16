import type * as Phaser from 'phaser';

import { VILLAGE } from '../config';
import * as paint from './areas/paint';

/** Whether the village is still whole (the raid) or wrecked and burning (the opening scene). */
export type VillageState = 'intact' | 'burnt';

/** Where fires burn: x position and whole-number size. They frame the dojo instead of hiding it. */
export const FIRE_SPOTS: readonly (readonly [x: number, scale: number])[] = [
  [40, 1],
  [90, 2],
  [161, 1],
  [232, 2],
  [288, 1],
];

/** Where smoke drifts up from. */
export const SMOKE_SPOTS: readonly paint.Point[] = [
  [100, 116],
  [161, 98],
  [250, 112],
];

/** Night sky lit from below by the burning village. */
const BURNING_SKY = [0x140c20, 0x22122a, 0x341a2c, 0x4a2430];

const WALL = 0x3a2a20;
const ROOF = 0x241a14;
const BEAM = 0x2a1d16;
const DOORWAY = 0x120c0a;
/** The dojo's plastered walls are lighter than the houses, so it stands out. */
const DOJO_WALL = 0x4a3728;

/** One low, wide house with a broad overhanging roof and a dark doorway. */
function house(g: Phaser.GameObjects.Graphics, left: number, width: number, top: number): void {
  const bottom = VILLAGE.groundY;
  paint.rect(g, WALL, left, top, width, bottom - top);
  paint.polygon(g, ROOF, [
    [left - 8, top],
    [left + width / 2, top - 18],
    [left + width + 8, top],
  ]);
  paint.rect(g, DOORWAY, left + width / 2 - 5, bottom - 18, 10, 18);
}

/** The dojo before the raid: one wide hall under a single sweeping roof. */
function wholeDojo(g: Phaser.GameObjects.Graphics): void {
  paint.rect(g, DOJO_WALL, 96, 116, 130, VILLAGE.groundY - 116);
  paint.rect(g, WALL, 96, VILLAGE.groundY - 8, 130, 8);
  paint.rect(g, DOORWAY, 150, 134, 22, VILLAGE.groundY - 134);
  paint.polygon(g, ROOF, [[84, 118], [161, 86], [238, 118]]);
  paint.rect(g, BEAM, 96, 116, 130, 2);
}

/** The dojo after the raid: both ends still stand, the middle has caved in. */
function ruinedDojo(g: Phaser.GameObjects.Graphics): void {
  paint.rect(g, DOJO_WALL, 96, 116, 54, VILLAGE.groundY - 116);
  paint.rect(g, DOJO_WALL, 172, 116, 54, VILLAGE.groundY - 116);
  paint.rect(g, WALL, 96, VILLAGE.groundY - 8, 54, 8);
  paint.rect(g, WALL, 172, VILLAGE.groundY - 8, 54, 8);
  paint.rect(g, DOORWAY, 112, 138, 20, VILLAGE.groundY - 138);

  // The roof broke in two and slid apart where it fell in.
  paint.polygon(g, ROOF, [[84, 118], [128, 90], [152, 112], [98, 118]]);
  paint.polygon(g, ROOF, [[170, 112], [196, 88], [238, 118], [180, 118]]);

  // Rubble and beams in the gap between the two halves.
  paint.rect(g, BEAM, 148, 146, 28, VILLAGE.groundY - 146);
  paint.polygon(g, BEAM, [[146, 150], [151, 150], [168, 96], [163, 96]]);
  paint.polygon(g, BEAM, [[156, 152], [161, 152], [186, 118], [181, 118]]);
  paint.dots(g, 0x4a4038, [[104, 160], [140, 163], [158, 158], [186, 162], [214, 159]]);
}

/** Kenji's village: houses either side of the dojo, whole or wrecked. */
export function paintVillage(g: Phaser.GameObjects.Graphics, state: VillageState): void {
  paint.bands(g, BURNING_SKY, 0, VILLAGE.groundY);
  paint.polygon(g, 0x1b1328, [
    [0, 126], [46, 104], [96, 122], [150, 100], [206, 124], [258, 106], [320, 120],
    [320, VILLAGE.groundY], [0, VILLAGE.groundY],
  ]);

  house(g, 14, 62, 124);
  house(g, 246, 60, 120);

  if (state === 'intact') wholeDojo(g);
  else ruinedDojo(g);

  paint.floor(g, 0x2f2a25, 0x4a4038, VILLAGE.groundY);
}
