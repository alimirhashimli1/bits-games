import { ROOM } from '../../config';
import { FACINGS, type Facing } from '../../systems/facing';
import { doorwayCells, type RoomDefinition, type SideDoorKind } from '../../systems/worldMap';

/** A dungeon room as written: its inside only, and its side doors. The wall round it is built. */
export interface DungeonRoomSpec extends Omit<RoomDefinition, 'tiles'> {
  /** The floor inside the wall: 8 rows of 18 tiles, with no border. */
  readonly inside: readonly string[];
  readonly sides?: Partial<Record<Facing, SideDoorKind>>;
}

const WALL = 'X';
const FLOOR = '+';
const INSIDE_COLUMNS = ROOM.columns - 2;
const INSIDE_ROWS = ROOM.rows - 2;

/**
 * Builds a dungeon room's map: a wall a tile thick all round the inside, with a two-tile
 * doorway (written as floor) on every side that has a door. Closed doors are drawn over the
 * doorway when the room is shown. Errors name the room.
 */
export function dungeonRoom({ inside, ...room }: DungeonRoomSpec): RoomDefinition {
  if (inside.length !== INSIDE_ROWS || inside.some((line) => line.length !== INSIDE_COLUMNS)) {
    throw new Error(`Dungeon room "${room.name}" must have ${INSIDE_ROWS} inside rows of ${INSIDE_COLUMNS} tiles.`);
  }
  const grid = [
    WALL.repeat(ROOM.columns).split(''),
    ...inside.map((line) => [WALL, ...line.split(''), WALL]),
    WALL.repeat(ROOM.columns).split(''),
  ];
  for (const side of FACINGS) {
    if (!room.sides?.[side]) continue;
    for (const { column, row } of doorwayCells(side)) {
      const line = grid[row];
      if (line) line[column] = FLOOR;
    }
  }
  return { ...room, tiles: grid.map((line) => line.join('')) };
}
