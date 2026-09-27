import type * as Phaser from 'phaser';

import { createTileLayer } from '@shared/phaser/tileLayer';

import { ROOM } from '../config';
import { TILES_SHEET, type TileFrame } from '../content/sprites/tiles';
import { TILE_LEGEND } from '../content/world/tileLegend';
import type { TileOverlay } from './dungeonDoors';
import type { RoomDefinition } from './worldMap';

export interface LoadedRoom {
  readonly tilemap: Phaser.Tilemaps.Tilemap;
  readonly layer: Phaser.Tilemaps.TilemapLayer;
}

const FRAME_NAMES = Object.keys(TILES_SHEET.frames) as TileFrame[];

/** A tile's index in the tilemap is its frame's position in the tile sheet. */
export function tileIndex(frame: TileFrame): number {
  return FRAME_NAMES.indexOf(frame);
}

/** Closed doors are never written in maps, only drawn over them, but they are solid too. */
const SOLID_OVERLAY_FRAMES: readonly TileFrame[] = ['lockedDoor', 'shutDoor', 'crackedWall', 'bossDoor'];

const SOLID_TILE_INDICES = [
  ...Object.values(TILE_LEGEND)
    .filter((tile) => tile.solid)
    .map((tile) => tileIndex(tile.frame)),
  ...SOLID_OVERLAY_FRAMES.map(tileIndex),
];

/**
 * Turns a room's text map into a tilemap layer, with `overlays` (opened secrets, closed doors)
 * drawn over it. Solid tiles collide.
 */
export function loadRoom(scene: Phaser.Scene, room: RoomDefinition, overlays: readonly TileOverlay[]): LoadedRoom {
  const loaded = createTileLayer(scene, {
    data: parseRoomMap(room),
    textureKey: TILES_SHEET.key,
    tileSize: ROOM.tileSize,
    solidIndices: SOLID_TILE_INDICES,
  });
  overlays.forEach((overlay) => drawTile(loaded, overlay));
  return loaded;
}

/** Changes one tile of a room on show. It collides if its frame is solid. */
export function drawTile({ layer }: LoadedRoom, { column, row, frame }: TileOverlay): void {
  layer.putTileAt(tileIndex(frame), column, row);
}

/**
 * Checks the map's size and characters and converts it to rows of tile indices. Every room is
 * exactly one screen, so the size is fixed. Errors name the room, and the row and column.
 */
export function parseRoomMap({ name, tiles }: RoomDefinition): number[][] {
  if (tiles.length !== ROOM.rows) throw new Error(`Room "${name}" has ${tiles.length} rows, expected ${ROOM.rows}.`);

  return tiles.map((line, row) => {
    if (line.length !== ROOM.columns) {
      throw new Error(`Room "${name}" row ${row} is ${line.length} tiles wide, expected ${ROOM.columns}.`);
    }
    return [...line].map((symbol, column) => {
      const tile = TILE_LEGEND[symbol];
      if (!tile) throw new Error(`Room "${name}" has an unknown tile "${symbol}" at column ${column}, row ${row}.`);
      return tileIndex(tile.frame);
    });
  });
}
