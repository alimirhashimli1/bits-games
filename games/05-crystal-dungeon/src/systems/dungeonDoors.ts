import type { TileFrame } from '../content/sprites/tiles';
import { OPENED_SECRET_FRAME } from '../content/world/tileLegend';
import { FACINGS, type Facing } from './facing';
import type { GameState } from './gameState';
import { doorwayCells, roomId, sideDoorId, type Cell, type RoomDefinition, type ScreenPosition, type SideDoorKind } from './worldMap';

/** A tile drawn over a room's map as it is shown: an opened secret, or a closed door. */
export interface TileOverlay extends Cell {
  readonly frame: TileFrame;
}

/** A side door that is closed right now. */
export interface ClosedDoor {
  readonly side: Facing;
  readonly kind: Exclude<SideDoorKind, 'open'>;
  readonly id: string;
  readonly cells: readonly Cell[];
}

/** What a closed door looks like. Open doorways are the floor the map already shows. */
const CLOSED_DOOR_FRAMES: Readonly<Record<ClosedDoor['kind'], TileFrame>> = {
  locked: 'lockedDoor',
  shut: 'shutDoor',
  cracked: 'crackedWall',
  boss: 'bossDoor',
};

/** An open doorway, once a door in it is gone. */
export const OPEN_DOORWAY_FRAME: TileFrame = 'dungeonFloor';

/** Whether a room still has enemies to fight: it lists some, and has not been cleared. */
export function hasEnemiesLeft(state: GameState, position: ScreenPosition, room: RoomDefinition): boolean {
  return (room.enemies?.length ?? 0) > 0 && !state.cleared.includes(roomId(position));
}

/**
 * The room's side doors that are closed now: locked and boss doors until opened, cracked walls
 * until bombed, and shut doors while `enemiesLeft` (the room Wren is in still has enemies).
 */
export function closedDoors(state: GameState, position: ScreenPosition, room: RoomDefinition, enemiesLeft: boolean): ClosedDoor[] {
  const closed: ClosedDoor[] = [];
  for (const side of FACINGS) {
    const kind = room.sides?.[side];
    if (!kind || kind === 'open') continue;
    const id = sideDoorId(position, side);
    const isClosed =
      kind === 'shut' ? enemiesLeft : kind === 'cracked' ? !state.opened.includes(id) : !state.unlocked.includes(id);
    if (isClosed) closed.push({ side, kind, id, cells: doorwayCells(side) });
  }
  return closed;
}

/** Everything drawn over a room's map as it is shown: opened secret walls, and closed doors. */
export function roomOverlays(state: GameState, position: ScreenPosition, room: RoomDefinition, enemiesLeft: boolean): TileOverlay[] {
  const secrets = (room.secrets ?? [])
    .filter((secret) => state.opened.includes(secret.id))
    .map(({ column, row }) => ({ column, row, frame: OPENED_SECRET_FRAME }));
  const doors = closedDoors(state, position, room, enemiesLeft).flatMap((door) =>
    door.cells.map((cell) => ({ ...cell, frame: CLOSED_DOOR_FRAMES[door.kind] })),
  );
  return [...secrets, ...doors];
}

/** The closed door whose doorway includes this cell, if any. */
export function closedDoorAt(doors: readonly ClosedDoor[], { column, row }: Cell): ClosedDoor | undefined {
  return doors.find((door) => door.cells.some((cell) => cell.column === column && cell.row === row));
}
