import type { PersonId } from '../content/people';
import type { Drop } from './drops';
import type { EnemyKind } from './enemyKinds';
import { FACING_VECTORS, OPPOSITE_FACING, type Facing } from './facing';
import type { Box, Vector } from './playerMovement';
import type { WareKind } from './shop';

/** A room written as text: one string per row of tiles, one character per tile. */
export type RoomMap = readonly string[];

/** A tile position in a room. */
export interface Cell {
  readonly column: number;
  readonly row: number;
}

/** Which screen of which area. */
export interface ScreenPosition {
  readonly area: string;
  readonly column: number;
  readonly row: number;
}

/** A place to stand: a cell of a screen. */
export interface WorldSpot extends ScreenPosition {
  readonly cell: Cell;
}

/** A doorway tile, and where walking into it leads. */
export interface Door extends Cell {
  readonly to: WorldSpot;
}

/** An enemy that appears on a screen each time it is shown, standing in the middle of its cell. */
export interface EnemySpawn extends Cell {
  readonly kind: EnemyKind;
}

/**
 * A pickup that lies in a room from the start, such as a small key, in the middle of its cell.
 * Once taken it never comes back, so its `id` must be unique in the whole world.
 */
export interface PlacedPickup extends Cell {
  readonly id: string;
  readonly drop: Drop;
}

/**
 * A cracked cliff face that a bomb opens into a cave mouth, which then leads `to` somewhere like
 * any door. Once open it stays open, so its `id` must be unique in the whole world.
 */
export interface SecretWall extends Cell {
  readonly id: string;
  readonly to: WorldSpot;
}

/**
 * Something hidden in a cell, often by an old stump: striking the cell with the sword makes it
 * appear. Taken, it is gone for good, so its `id` is unique among placed pickups too.
 */
export interface HiddenSpot extends Cell {
  readonly id: string;
  readonly drop: Drop;
}

/** Someone standing in the middle of a cell, who talks when Wren walks into them. */
export interface PersonSpot extends Cell {
  readonly who: PersonId;
}

/** What a signpost tile says. */
export interface SignText extends Cell {
  readonly text: string;
}

/** Something for sale, on show in the middle of a cell with its price under it. */
export interface WareSpot extends Cell {
  readonly ware: WareKind;
}

/**
 * A dungeon room's doorway on one side: always **open**; **locked** until a small key opens it;
 * **shut** while the room Wren is in still has enemies; **cracked**, a wall until a bomb opens
 * it; or the **boss** door, opened by the dungeon's boss key. Both rooms list the same kind.
 */
export type SideDoorKind = 'open' | 'locked' | 'shut' | 'cracked' | 'boss';

/** One overworld screen or dungeon room. */
export interface RoomDefinition {
  /** Named in every error about the room, so a broken map is easy to find. */
  readonly name: string;
  readonly tiles: RoomMap;
  /** One for every doorway tile in the map. */
  readonly doors?: readonly Door[];
  readonly enemies?: readonly EnemySpawn[];
  readonly pickups?: readonly PlacedPickup[];
  readonly people?: readonly PersonSpot[];
  /** One for every signpost tile in the map. */
  readonly signs?: readonly SignText[];
  readonly wares?: readonly WareSpot[];
  /** One for every cracked cliff tile in the map. */
  readonly secrets?: readonly SecretWall[];
  readonly hidden?: readonly HiddenSpot[];
  /** A dungeon room's doorways, by side. The tiles show every doorway as floor; closed ones are drawn over. */
  readonly sides?: Partial<Record<Facing, SideDoorKind>>;
  /** Shown in near darkness until the Lantern's flame lights it, for the rest of the visit. */
  readonly dark?: boolean;
}

/** A room's doors, with its secret walls that have been opened counted as doors too. */
export function doorsOf(room: RoomDefinition, opened: readonly string[]): readonly Door[] {
  const openSecrets = (room.secrets ?? []).filter((secret) => opened.includes(secret.id));
  return [...(room.doors ?? []), ...openSecrets];
}

/**
 * Overworld areas scroll from screen to screen. An interior (a cave or a house) is a single
 * screen entered through a door, and walking off its bottom edge goes back out of that door. A
 * dungeon is a grid of rooms that scroll like the overworld, joined by side doors; walking out of
 * its entrance room's bottom door goes back out of the door that led in.
 */
export type AreaKind = 'overworld' | 'interior' | 'dungeon';

export interface Area {
  readonly kind: AreaKind;
  /** Rows of screens. `null` where there is no screen, so the edge next to it is closed. */
  readonly screens: readonly (readonly (RoomDefinition | null)[])[];
  /** A dungeon's boss room, which its compass marks. */
  readonly boss?: { readonly column: number; readonly row: number };
}

/** The two cells of the doorway in a room's wall on `side`: columns 9 and 10 across the top or bottom, rows 4 and 5 down a side. */
export function doorwayCells(side: Facing): readonly Cell[] {
  const DOORWAY = [9, 10] as const;
  const SIDE_DOORWAY = [4, 5] as const;
  switch (side) {
    case 'up':
      return DOORWAY.map((column) => ({ column, row: 0 }));
    case 'down':
      return DOORWAY.map((column) => ({ column, row: 9 }));
    case 'left':
      return SIDE_DOORWAY.map((row) => ({ column: 0, row }));
    case 'right':
      return SIDE_DOORWAY.map((row) => ({ column: 19, row }));
  }
}

/**
 * The same id for a door seen from either room, so opening it from one side opens it from both:
 * it is named after the room above it or to its left.
 */
export function sideDoorId(position: ScreenPosition, side: Facing): string {
  const { x, y } = FACING_VECTORS[side];
  const first = x < 0 || y < 0 ? { column: position.column + x, row: position.row + y } : position;
  const across = x !== 0 ? 'right' : 'down';
  return `${position.area}:${first.column},${first.row}:${across}`;
}

/** A dungeon room's own id, for remembering that it was cleared or visited. */
export function roomId({ area, column, row }: ScreenPosition): string {
  return `${area}:${column},${row}`;
}

/** The side door on the far side of a doorway, as the next room lists it. */
export function matchingSide(side: Facing): Facing {
  return OPPOSITE_FACING[side];
}

export type Areas = Readonly<Record<string, Area>>;

export function roomAt(areas: Areas, { area, column, row }: ScreenPosition): RoomDefinition | undefined {
  return areas[area]?.screens[row]?.[column] ?? undefined;
}

/** The screen next to this one in the same area, if there is one. */
export function neighbourOf(areas: Areas, position: ScreenPosition, facing: Facing): ScreenPosition | undefined {
  const { x, y } = FACING_VECTORS[facing];
  const next = { area: position.area, column: position.column + x, row: position.row + y };
  return roomAt(areas, next) ? next : undefined;
}

/**
 * The room edge Wren is pushing against, if any: her body touches it (within `tolerance`) and
 * the player is pushing that way. Diagonal pushes count on either axis.
 */
export function edgePushedAgainst(body: Box, direction: Vector, width: number, height: number, tolerance: number): Facing | undefined {
  if (direction.x < 0 && body.left <= tolerance) return 'left';
  if (direction.x > 0 && body.right >= width - tolerance) return 'right';
  if (direction.y < 0 && body.top <= tolerance) return 'up';
  if (direction.y > 0 && body.bottom >= height - tolerance) return 'down';
  return undefined;
}

/** The cell under the middle of a body. */
export function cellUnder(body: Box, tileSize: number): Cell {
  return {
    column: Math.floor((body.left + body.right) / 2 / tileSize),
    row: Math.floor((body.top + body.bottom) / 2 / tileSize),
  };
}
