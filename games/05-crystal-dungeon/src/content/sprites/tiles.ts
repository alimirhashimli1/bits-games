import { PixelGrid, type Point } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ROOM } from '../../config';
import { ART_COLORS } from '../palette';

const SIZE = ROOM.tileSize;

/**
 * Every tile is opaque, because a room is a single tilemap layer: a tree or a rock is drawn
 * standing on its own patch of grass.
 */

/** A tile-sized grid filled with one symbol. */
function filled(symbol: string): PixelGrid {
  const grid = new PixelGrid(SIZE, SIZE);
  grid.fillRect(0, 0, SIZE, SIZE, symbol);
  return grid;
}

function dots(grid: PixelGrid, points: readonly Point[], symbol: string): PixelGrid {
  points.forEach(([x, y]) => grid.plot(x, y, symbol));
  return grid;
}

/** Little `^` shaped tufts of darker grass, the point at each position. */
const GRASS_TUFTS: readonly Point[] = [[3, 2], [10, 1], [13, 6], [6, 7], [2, 10], [11, 11], [7, 13]];
const GRASS_SHINE: readonly Point[] = [[5, 4], [14, 13], [1, 6], [9, 9]];

function grass(): PixelGrid {
  const grid = dots(filled('g'), GRASS_SHINE, 'h');
  GRASS_TUFTS.forEach(([x, y]) => {
    grid.plot(x, y, 'G');
    grid.plot(x - 1, y + 1, 'G');
    grid.plot(x + 1, y + 1, 'G');
  });
  return grid;
}

/** A plus-shaped flower of four petals round a yellow middle. */
function flower(grid: PixelGrid, [x, y]: Point, petal: string): void {
  dots(grid, [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]], petal);
  grid.plot(x, y, 'y');
}

function flowers(): PixelGrid {
  const grid = grass();
  flower(grid, [4, 4], 'f');
  flower(grid, [12, 3], 'f');
  flower(grid, [11, 10], 'f');
  flower(grid, [4, 12], 'r');
  return grid;
}

function path(): PixelGrid {
  const grid = dots(filled('p'), [[2, 3], [9, 1], [13, 7], [5, 9], [11, 12], [3, 14], [8, 6]], 'P');
  return dots(grid, [[3, 3], [10, 1], [6, 9], [14, 11], [1, 8]], 'q');
}

function sand(): PixelGrid {
  const grid = dots(filled('a'), [[3, 2], [12, 4], [7, 8], [2, 12], [13, 13], [9, 1]], 'A');
  return dots(grid, [[4, 2], [8, 8], [14, 9], [5, 14]], 'b');
}

/** Short light crests with a dark trough under each, left end of the crest at each position. */
const WAVES: readonly Point[] = [[2, 3], [9, 6], [4, 11], [11, 13]];
const WAVE_LENGTH = 3;

function water(): PixelGrid {
  const grid = filled('w');
  WAVES.forEach(([x, y]) => {
    grid.fillRect(x, y, WAVE_LENGTH, 1, 'W');
    grid.fillRect(x + 1, y + 1, WAVE_LENGTH, 1, 'x');
  });
  return grid;
}

/** Planks across the tile with dark gaps between them, and a rail down each side. */
const PLANK_WIDTH = 4;

function bridge(): PixelGrid {
  const grid = new PixelGrid(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    const inPlank = y % PLANK_WIDTH;
    grid.fillRect(0, y, SIZE, 1, inPlank === PLANK_WIDTH - 1 ? 'N' : inPlank === 0 ? 'm' : 'n');
  }
  grid.fillRect(0, 0, 1, SIZE, 'N');
  grid.fillRect(SIZE - 1, 0, 1, SIZE, 'N');
  return grid;
}

/**
 * A round shape shaded by stacking circles: a dark one, a middle one nudged up and left, and a
 * small light one further up and left, so the light comes from the top left.
 */
function roundThing(center: Point, radius: number, [dark, middle, light]: readonly [string, string, string]): PixelGrid {
  const [x, y] = center;
  const grid = new PixelGrid(SIZE, SIZE);
  grid.fillCircle(center, radius, dark);
  grid.fillCircle([x - 0.5, y - 0.5], radius - 1, middle);
  grid.fillCircle([x - 2, y - 2], radius / 3, light);
  return grid;
}

/** Draws `thing` with an outline, standing on grass. */
function onGrass(thing: PixelGrid): PixelGrid {
  thing.outline('k');
  const grid = grass();
  grid.stamp(thing.toPixelMap(), 0, 0);
  return grid;
}

function tree(): PixelGrid {
  const canopy = roundThing([7.5, 7], 6.4, ['e', 'L', 'l']);
  const trunk = new PixelGrid(SIZE, SIZE);
  trunk.fillRect(6, 13, 4, 3, 't');
  trunk.stamp(canopy.toPixelMap(), 0, 0);
  return onGrass(trunk);
}

function bush(): PixelGrid {
  return onGrass(roundThing([7.5, 8.5], 6, ['e', 'L', 'l']));
}

function rock(): PixelGrid {
  return onGrass(roundThing([7.5, 8.5], 6, ['j', 'o', 'O']));
}

/** Rows in one course of wall stones, and how wide each stone is. */
const COURSE_HEIGHT = 4;
const STONE_WIDTH = 8;

/** Courses of stones, every other one shifted half a stone, lit on top and shaded underneath. */
function stoneWall(): PixelGrid {
  const grid = filled('c');
  for (let top = 0; top < SIZE; top += COURSE_HEIGHT) {
    grid.fillRect(0, top, SIZE, 1, 'H');
    grid.fillRect(0, top + COURSE_HEIGHT - 1, SIZE, 1, 'C');
    const shift = (top / COURSE_HEIGHT) % 2 === 0 ? 0 : STONE_WIDTH / 2;
    for (let x = shift; x < SIZE; x += STONE_WIDTH) grid.fillRect(x, top, 1, COURSE_HEIGHT, 'C');
  }
  return grid;
}

/** A dark arched opening in the wall, reaching down to the tile's bottom edge. */
function doorway(): PixelGrid {
  const grid = stoneWall();
  grid.fillRect(3, 7, 10, SIZE - 7, 'k');
  grid.fillCircle([7.5, 7], 5, 'k');
  return grid;
}

/** Dark packed earth with a few pale grains. */
function caveFloor(): PixelGrid {
  return dots(filled('u'), [[2, 3], [11, 2], [6, 8], [14, 10], [3, 13], [9, 14]], 'U');
}

/** A wooden board on a post, with dark strokes on it for writing, standing on grass. */
function sign(): PixelGrid {
  const thing = new PixelGrid(SIZE, SIZE);
  thing.fillRect(7, 9, 2, 6, 't');
  thing.fillRect(2, 2, 12, 8, 'v');
  thing.fillRect(2, 9, 12, 1, 'V');
  thing.fillRect(4, 4, 8, 1, 'V');
  thing.fillRect(4, 6, 6, 1, 'V');
  return onGrass(thing);
}

/** Rows of overlapping roof tiles, each row's lower edge in shadow, the joints staggered. */
function roof(): PixelGrid {
  const grid = filled('R');
  for (let top = 0; top < SIZE; top += COURSE_HEIGHT) {
    grid.fillRect(0, top + COURSE_HEIGHT - 1, SIZE, 1, 'Q');
    const shift = (top / COURSE_HEIGHT) % 2 === 0 ? 2 : 6;
    for (let x = shift; x < SIZE; x += STONE_WIDTH) grid.fillRect(x, top, 1, COURSE_HEIGHT - 1, 'Q');
  }
  return grid;
}

/** Upright wooden boards. */
function houseWall(): PixelGrid {
  const grid = filled('n');
  for (let x = 0; x < SIZE; x += PLANK_WIDTH) grid.fillRect(x, 0, 1, SIZE, 'N');
  grid.fillRect(0, SIZE - 1, SIZE, 1, 'N');
  return grid;
}

/** A dark wooden door in the boards, with a brass knob. */
function houseDoor(): PixelGrid {
  const grid = houseWall();
  grid.fillRect(3, 3, 10, SIZE - 3, 'k');
  grid.fillRect(4, 4, 8, SIZE - 4, 'N');
  grid.plot(10, 10, 'y');
  return grid;
}

/** Floorboards running across, their joints staggered. */
function woodFloor(): PixelGrid {
  const grid = filled('n');
  for (let top = 0; top < SIZE; top += PLANK_WIDTH) {
    grid.fillRect(0, top + PLANK_WIDTH - 1, SIZE, 1, 'N');
    grid.plot(top % 8 === 0 ? 5 : 12, top + 1, 'm');
    grid.fillRect(top % 8 === 0 ? 10 : 3, top, 1, PLANK_WIDTH - 1, 'N');
  }
  return grid;
}

/** An old tree stump with rings on its cut top. Hidden things often lie by one. */
function stump(): PixelGrid {
  const thing = new PixelGrid(SIZE, SIZE);
  thing.fillRect(3, 7, 10, 7, 't');
  thing.fillEllipse([7.5, 7], 5, 3.5, 'm');
  thing.fillEllipse([7.5, 7], 3, 2, 'n');
  thing.plot(7, 7, 'm');
  return onGrass(thing);
}

/** A face of layered brown rock: ledges lit on top and shaded below. */
function cliff(): PixelGrid {
  const grid = filled('E');
  for (let top = 0; top < SIZE; top += COURSE_HEIGHT) {
    grid.fillRect(0, top, SIZE, 1, 'B');
    grid.fillRect(0, top + COURSE_HEIGHT - 1, SIZE, 1, 'F');
    const shift = (top / COURSE_HEIGHT) % 2 === 0 ? 3 : 9;
    grid.fillRect(shift, top + 1, 1, COURSE_HEIGHT - 2, 'F');
  }
  return grid;
}

/** A dark opening in the rock, reaching down to the tile's bottom edge. */
function caveMouth(): PixelGrid {
  const grid = cliff();
  grid.fillRect(3, 7, 10, SIZE - 7, 'k');
  grid.fillCircle([7.5, 7], 5, 'k');
  return grid;
}

/** The rock face with a crack running down it: a bomb would open it. */
function crackedCliff(): PixelGrid {
  const grid = cliff();
  grid.line([8, 1], [6, 6], 1, 'k');
  grid.line([6, 6], [9, 10], 1, 'k');
  grid.line([9, 10], [7, 15], 1, 'k');
  grid.line([6, 6], [3, 8], 1, 'k');
  return grid;
}

/** Crystal shards grown up out of the ground, sealing the way. */
function crystal(): PixelGrid {
  const thing = new PixelGrid(SIZE, SIZE);
  thing.line([4, 15], [3, 5], 3, 'i');
  thing.line([8, 15], [8, 1], 4, 'i');
  thing.line([12, 15], [13, 6], 3, 'i');
  thing.line([7, 14], [7, 3], 1, 'I');
  thing.line([3, 14], [3, 7], 1, 'I');
  thing.line([10, 15], [10, 4], 1, 'z');
  thing.line([14, 15], [14, 8], 1, 'z');
  return onGrass(thing);
}

/** Bluish dungeon bricks, lit on top and shaded underneath. */
function dungeonWall(): PixelGrid {
  const grid = filled('X');
  for (let top = 0; top < SIZE; top += COURSE_HEIGHT) {
    grid.fillRect(0, top, SIZE, 1, 'Z');
    grid.fillRect(0, top + COURSE_HEIGHT - 1, SIZE, 1, 'Y');
    const shift = (top / COURSE_HEIGHT) % 2 === 0 ? 0 : STONE_WIDTH / 2;
    for (let x = shift; x < SIZE; x += STONE_WIDTH) grid.fillRect(x, top, 1, COURSE_HEIGHT, 'Y');
  }
  return grid;
}

/** Big dark flagstones, their edges a shade lighter. */
function dungeonFloor(): PixelGrid {
  const grid = filled('M');
  grid.fillRect(0, 0, SIZE, 1, 'J');
  grid.fillRect(0, 0, 1, SIZE, 'J');
  grid.fillRect(0, SIZE / 2, SIZE / 2, 1, 'J');
  grid.fillRect(SIZE / 2, SIZE / 2, 1, SIZE / 2, 'J');
  return grid;
}

/** A square stone block standing on the floor, lit on its top-left edges. */
function block(): PixelGrid {
  const grid = dungeonFloor();
  grid.fillRect(1, 1, SIZE - 2, SIZE - 2, 'k');
  grid.fillRect(2, 2, SIZE - 4, SIZE - 4, 'X');
  grid.fillRect(2, 2, SIZE - 4, 2, 'Z');
  grid.fillRect(2, 2, 2, SIZE - 4, 'Z');
  grid.fillRect(4, SIZE - 4, SIZE - 6, 2, 'Y');
  grid.fillRect(SIZE - 4, 4, 2, SIZE - 6, 'Y');
  return grid;
}

/** A dungeon doorway, closed: `fill` is drawn inside a dark frame. */
function closedDoor(draw: (grid: PixelGrid) => void): PixelGrid {
  const grid = dungeonWall();
  grid.fillRect(1, 1, SIZE - 2, SIZE - 2, 'k');
  draw(grid);
  return grid;
}

/** A wooden door with a gold lock plate and keyhole: a small key opens it. */
function lockedDoor(): PixelGrid {
  return closedDoor((grid) => {
    grid.fillRect(2, 2, SIZE - 4, SIZE - 4, 'n');
    for (let x = 2; x < SIZE - 2; x += PLANK_WIDTH) grid.fillRect(x, 2, 1, SIZE - 4, 'N');
    grid.fillRect(5, 5, 6, 6, 'y');
    grid.fillRect(7, 6, 2, 2, 'k');
    grid.fillRect(7, 8, 1, 2, 'k');
  });
}

/** Iron bars: it opens once the room is clear of enemies. */
function shutDoor(): PixelGrid {
  return closedDoor((grid) => {
    for (let x = 3; x < SIZE - 2; x += 3) grid.fillRect(x, 2, 2, SIZE - 4, '1');
    grid.fillRect(2, 5, SIZE - 4, 1, '2');
    grid.fillRect(2, 10, SIZE - 4, 1, '2');
  });
}

/** A heavy purple door with a crystal seal: the boss key opens it. */
function bossDoor(): PixelGrid {
  return closedDoor((grid) => {
    grid.fillRect(2, 2, SIZE - 4, SIZE - 4, '3');
    grid.fillRect(2, 2, SIZE - 4, 1, '4');
    grid.line([8, 4], [4, 8], 1, 'i');
    grid.line([4, 8], [8, 12], 1, 'i');
    grid.line([8, 12], [12, 8], 1, 'i');
    grid.line([12, 8], [8, 4], 1, 'i');
    grid.fillRect(7, 7, 2, 2, 'I');
  });
}

/** The dungeon wall with a crack in it: a bomb would open a way through. */
function crackedWall(): PixelGrid {
  const grid = dungeonWall();
  grid.line([8, 1], [6, 6], 1, 'k');
  grid.line([6, 6], [9, 10], 1, 'k');
  grid.line([9, 10], [7, 15], 1, 'k');
  grid.line([9, 10], [13, 12], 1, 'k');
  return grid;
}

function map(grid: PixelGrid): PixelMap {
  return grid.toPixelMap();
}

/**
 * The overworld tile sheet. A tile's index in the tilemap is its frame's position here, so new
 * frames only ever go at the end.
 */
export const TILES_SHEET = {
  key: 'tiles-overworld',
  palette: {
    k: ART_COLORS.outline,
    g: ART_COLORS.grass,
    G: ART_COLORS.grassDark,
    h: ART_COLORS.grassLight,
    f: ART_COLORS.petal,
    r: ART_COLORS.petalPink,
    y: ART_COLORS.flowerMiddle,
    p: ART_COLORS.path,
    P: ART_COLORS.pathDark,
    q: ART_COLORS.pathLight,
    a: ART_COLORS.sand,
    A: ART_COLORS.sandDark,
    b: ART_COLORS.sandLight,
    w: ART_COLORS.water,
    W: ART_COLORS.waterLight,
    x: ART_COLORS.waterDark,
    n: ART_COLORS.plank,
    N: ART_COLORS.plankDark,
    m: ART_COLORS.plankLight,
    L: ART_COLORS.leaf,
    l: ART_COLORS.leafLight,
    e: ART_COLORS.leafDark,
    t: ART_COLORS.bark,
    o: ART_COLORS.rock,
    O: ART_COLORS.rockLight,
    j: ART_COLORS.rockDark,
    c: ART_COLORS.stone,
    C: ART_COLORS.stoneDark,
    H: ART_COLORS.stoneLight,
    u: ART_COLORS.caveFloor,
    U: ART_COLORS.caveFloorLight,
    v: ART_COLORS.signBoard,
    V: ART_COLORS.signBoardDark,
    R: ART_COLORS.roof,
    Q: ART_COLORS.roofDark,
    E: ART_COLORS.cliff,
    F: ART_COLORS.cliffDark,
    B: ART_COLORS.cliffLight,
    i: ART_COLORS.crystal,
    I: ART_COLORS.crystalLight,
    z: ART_COLORS.crystalDark,
    X: ART_COLORS.dungeonWall,
    Y: ART_COLORS.dungeonWallDark,
    Z: ART_COLORS.dungeonWallLight,
    M: ART_COLORS.dungeonFloor,
    J: ART_COLORS.dungeonFloorLight,
    1: ART_COLORS.iron,
    2: ART_COLORS.ironDark,
    3: ART_COLORS.bossDoor,
    4: ART_COLORS.bossDoorLight,
  },
  frames: {
    grass: map(grass()),
    flowers: map(flowers()),
    path: map(path()),
    sand: map(sand()),
    water: map(water()),
    bridge: map(bridge()),
    tree: map(tree()),
    bush: map(bush()),
    rock: map(rock()),
    wall: map(stoneWall()),
    doorway: map(doorway()),
    caveFloor: map(caveFloor()),
    sign: map(sign()),
    roof: map(roof()),
    houseWall: map(houseWall()),
    houseDoor: map(houseDoor()),
    woodFloor: map(woodFloor()),
    stump: map(stump()),
    cliff: map(cliff()),
    caveMouth: map(caveMouth()),
    crackedCliff: map(crackedCliff()),
    crystal: map(crystal()),
    dungeonWall: map(dungeonWall()),
    dungeonFloor: map(dungeonFloor()),
    block: map(block()),
    lockedDoor: map(lockedDoor()),
    shutDoor: map(shutDoor()),
    bossDoor: map(bossDoor()),
    crackedWall: map(crackedWall()),
  },
} as const satisfies SpriteSheetDefinition;

export type TileFrame = keyof typeof TILES_SHEET.frames;
