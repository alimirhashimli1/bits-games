import * as Phaser from 'phaser';

import { LEVEL } from '../config';
import {
  COIN_MARKER,
  EMPTY_TILE,
  ENEMY_MARKERS,
  HIDDEN_BLOCK_MARKERS,
  RETURN_MARKER,
  SPAWN_MARKER,
  TILE_LEGEND,
  type BlockKind,
  type HiddenBlockReward,
} from '../content/levels/tileLegend';
import { TILES_SHEET, type TileFrame } from '../content/sprites/tiles';
import type { EnemyForm } from './enemyRules';

/** A level written as text: one string per row of tiles, one character per tile. */
export type LevelMap = readonly string[];

/** A cell of the level grid. */
export interface Cell {
  readonly column: number;
  readonly row: number;
}

export interface HiddenBlock extends Cell {
  readonly reward: HiddenBlockReward;
}

export interface EnemySpawn extends Cell {
  readonly form: EnemyForm;
}

export interface LoadedLevel {
  readonly tilemap: Phaser.Tilemaps.Tilemap;
  readonly layer: Phaser.Tilemaps.TilemapLayer;
  readonly widthInPixels: number;
  readonly heightInPixels: number;
  /** Where Rusty's feet start, in level pixels: the bottom middle of the spawn cell. */
  readonly spawn: { readonly x: number; readonly y: number };
  /** The top of the pole that ends the level. Rooms reached through pipes have none. */
  readonly levelEnd: Cell | undefined;
  /** The left half of the pipe Rusty can go down, and where he comes back out. */
  readonly pipeEntry: Cell | undefined;
  readonly pipeReturn: Cell | undefined;
  /** Blocks that react to being hit from below, by `cellKey`. */
  readonly blocks: ReadonlyMap<string, BlockKind>;
  readonly hiddenBlocks: readonly HiddenBlock[];
  readonly coins: readonly Cell[];
  readonly enemies: readonly EnemySpawn[];
}

/** Tilemaps mark an empty cell with -1. */
const NO_TILE = -1;

const FRAME_NAMES = Object.keys(TILES_SHEET.frames) as TileFrame[];

/** A tile's index in the tilemap is its frame's position in the tile sheet. */
export function tileIndex(frame: TileFrame): number {
  return FRAME_NAMES.indexOf(frame);
}

export function tileFrame(index: number): TileFrame | undefined {
  return FRAME_NAMES[index];
}

/** A key for looking a cell up in a map. */
export function cellKey(column: number, row: number): string {
  return `${column},${row}`;
}

const SOLID_TILE_INDICES = Object.values(TILE_LEGEND)
  .filter((tile) => tile.solid)
  .map((tile) => tileIndex(tile.frame));

interface ParsedLevel {
  readonly data: number[][];
  readonly spawns: Cell[];
  readonly blocks: Map<string, BlockKind>;
  readonly hiddenBlocks: HiddenBlock[];
  readonly coins: Cell[];
  readonly enemies: EnemySpawn[];
  readonly levelEnds: Cell[];
  readonly pipeEntries: Cell[];
  readonly pipeReturns: Cell[];
}

/** Turns a level's text map into a tilemap layer. Solid tiles collide. */
export function loadLevel(scene: Phaser.Scene, map: LevelMap): LoadedLevel {
  const { data, spawns, blocks, hiddenBlocks, coins, enemies, levelEnds, pipeEntries, pipeReturns } =
    parseLevelMap(map);
  const [spawn] = spawns;
  if (!spawn || spawns.length > 1) {
    throw new Error(`Level map needs exactly one "${SPAWN_MARKER}" spawn marker, found ${spawns.length}.`);
  }
  if (levelEnds.length > 1) throw new Error(`Level map has ${levelEnds.length} level-end pole tops, expected one.`);
  if (pipeEntries.length > 1) throw new Error(`Level map has ${pipeEntries.length} pipes to go down, expected one.`);
  if (pipeReturns.length > 1) {
    throw new Error(`Level map has ${pipeReturns.length} "${RETURN_MARKER}" markers, expected one.`);
  }

  const tilemap = scene.make.tilemap({ data, tileWidth: LEVEL.tileSize, tileHeight: LEVEL.tileSize });
  const tileset = tilemap.addTilesetImage(TILES_SHEET.key, TILES_SHEET.key, LEVEL.tileSize, LEVEL.tileSize, 0, 0);
  if (!tileset) throw new Error(`Could not create the "${TILES_SHEET.key}" tileset.`);

  const layer = tilemap.createLayer(0, tileset, 0, 0);
  // Only a GPU layer is created when asked for, but the return type allows either.
  if (!(layer instanceof Phaser.Tilemaps.TilemapLayer)) throw new Error('Could not create the level layer.');
  layer.setCollision(SOLID_TILE_INDICES);

  return {
    tilemap,
    layer,
    widthInPixels: tilemap.widthInPixels,
    heightInPixels: tilemap.heightInPixels,
    spawn: { x: (spawn.column + 0.5) * LEVEL.tileSize, y: (spawn.row + 1) * LEVEL.tileSize },
    levelEnd: levelEnds[0],
    pipeEntry: pipeEntries[0],
    pipeReturn: pipeReturns[0],
    blocks,
    hiddenBlocks,
    coins,
    enemies,
  };
}

/** Checks the map's shape and characters, collects markers and blocks, and converts it to rows of tile indices. */
function parseLevelMap(map: LevelMap): ParsedLevel {
  if (map.length !== LEVEL.rows) throw new Error(`Level map has ${map.length} rows, expected ${LEVEL.rows}.`);

  const width = map[0]?.length ?? 0;
  const parsed: ParsedLevel = {
    data: [],
    spawns: [],
    blocks: new Map(),
    hiddenBlocks: [],
    coins: [],
    enemies: [],
    levelEnds: [],
    pipeEntries: [],
    pipeReturns: [],
  };
  const markers: Readonly<Record<string, Cell[]>> = {
    [SPAWN_MARKER]: parsed.spawns,
    [COIN_MARKER]: parsed.coins,
    [RETURN_MARKER]: parsed.pipeReturns,
  };

  map.forEach((line, row) => {
    if (line.length !== width) throw new Error(`Level map row ${row} is ${line.length} tiles wide, expected ${width}.`);

    parsed.data.push(
      [...line].map((symbol, column) => {
        if (symbol === EMPTY_TILE) return NO_TILE;
        const hiddenReward = HIDDEN_BLOCK_MARKERS[symbol];
        if (hiddenReward) {
          parsed.hiddenBlocks.push({ column, row, reward: hiddenReward });
          return NO_TILE;
        }
        const enemyForm = ENEMY_MARKERS[symbol];
        if (enemyForm) {
          parsed.enemies.push({ column, row, form: enemyForm });
          return NO_TILE;
        }
        const markerCells = markers[symbol];
        if (markerCells) {
          markerCells.push({ column, row });
          return NO_TILE;
        }
        const tile = TILE_LEGEND[symbol];
        if (!tile) throw new Error(`Level map has an unknown tile "${symbol}" at column ${column}, row ${row}.`);
        if (tile.block) parsed.blocks.set(cellKey(column, row), tile.block);
        if (tile.levelEnd) parsed.levelEnds.push({ column, row });
        if (tile.pipeEntry) parsed.pipeEntries.push({ column, row });
        return tileIndex(tile.frame);
      }),
    );
  });
  return parsed;
}
