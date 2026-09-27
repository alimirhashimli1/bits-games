import { ROOM } from '../config';
import { isWalkable, TILE_LEGEND } from '../content/world/tileLegend';
import { FACING_VECTORS, FACINGS } from './facing';
import { roomAt, type Areas, type Cell, type Door, type RoomDefinition, type ScreenPosition, type WorldSpot } from './worldMap';

/** A cell of a screen, as a string, so a set can hold it. */
function spotKey({ area, column, row, cell }: WorldSpot): string {
  return `${area}/${column},${row}/${cell.column},${cell.row}`;
}

function screenKey({ area, column, row }: ScreenPosition): string {
  return `${area}/${column},${row}`;
}

/** Whether Wren could stand here, counting cracked cliffs as open: a bomb opens every one. */
function isPassable(room: RoomDefinition, { column, row }: Cell): boolean {
  const symbol = room.tiles[row]?.[column];
  return isWalkable(symbol) || (symbol !== undefined && TILE_LEGEND[symbol]?.bombable === true);
}

/** A room's doors and its secret walls, all as doors. */
function allDoors(room: RoomDefinition): readonly Door[] {
  return [...(room.doors ?? []), ...(room.secrets ?? [])];
}

/** Everywhere Wren can reach, and the screens those cells are on. */
export interface Reach {
  readonly cells: ReadonlySet<string>;
  readonly screens: ReadonlySet<string>;
  /** Whether she can reach the cell itself, or stand next to it (for people, signs and solid stumps). */
  readonly canReach: (screen: ScreenPosition, cell: Cell) => boolean;
  readonly canReachBeside: (screen: ScreenPosition, cell: Cell) => boolean;
}

/**
 * Walks the whole world from `start`, as Wren could: to the four neighbouring cells, across open
 * screen edges, through doors (and bombed-open secret walls), and out of the bottom of a cave or
 * house back to below the door that led in. Enemies and locks are ignored.
 */
export function walkWorld(areas: Areas, start: WorldSpot): Reach {
  // Where each cave or house is left to: below every door leading into it.
  const exits = new Map<string, WorldSpot[]>();
  for (const [area, { screens }] of Object.entries(areas)) {
    screens.forEach((line, row) =>
      line.forEach((room, column) => {
        for (const door of room ? allDoors(room) : []) {
          const list = exits.get(door.to.area) ?? [];
          list.push({ area, column, row, cell: { column: door.column, row: door.row + 1 } });
          exits.set(door.to.area, list);
        }
      }),
    );
  }

  const cells = new Set<string>();
  const screens = new Set<string>();
  const queue: WorldSpot[] = [start];
  while (queue.length > 0) {
    const spot = queue.pop();
    if (!spot) break;
    const room = roomAt(areas, spot);
    const key = spotKey(spot);
    if (!room || cells.has(key) || !isPassable(room, spot.cell)) continue;
    cells.add(key);
    screens.add(screenKey(spot));

    const door = allDoors(room).find((candidate) => candidate.column === spot.cell.column && candidate.row === spot.cell.row);
    if (door) queue.push(door.to);

    for (const facing of FACINGS) {
      const { x, y } = FACING_VECTORS[facing];
      const next = { column: spot.cell.column + x, row: spot.cell.row + y };
      const inside = next.column >= 0 && next.column < ROOM.columns && next.row >= 0 && next.row < ROOM.rows;
      if (inside) {
        queue.push({ ...spot, cell: next });
        continue;
      }
      // Across the edge, onto the same row or column of the next screen.
      const across = {
        area: spot.area,
        column: spot.column + x,
        row: spot.row + y,
        cell: { column: (next.column + ROOM.columns) % ROOM.columns, row: (next.row + ROOM.rows) % ROOM.rows },
      };
      // Out of the bottom of a cave, a house or a dungeon's entrance room: back to the door that led in.
      const leavesArea = areas[spot.area]?.kind !== 'overworld' && facing === 'down' && !roomAt(areas, across);
      if (leavesArea) queue.push(...(exits.get(spot.area) ?? []));
      else queue.push(across);
    }
  }

  const canReach = (screen: ScreenPosition, cell: Cell): boolean => cells.has(spotKey({ ...screen, cell }));
  const canReachBeside = (screen: ScreenPosition, cell: Cell): boolean =>
    FACINGS.some((facing) => {
      const { x, y } = FACING_VECTORS[facing];
      return canReach(screen, { column: cell.column + x, row: cell.row + y });
    });
  return { cells, screens, canReach, canReachBeside };
}
