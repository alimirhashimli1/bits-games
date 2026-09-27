import { ROOM } from '../config';
import { PEOPLE, type Person } from '../content/people';
import { isWalkable, TILE_LEGEND } from '../content/world/tileLegend';
import { ANSWER_ROWS, checkText } from './dialogue';
import { FLYING_KINDS } from './enemyKinds';
import { FACINGS } from './facing';
import { walkWorld } from './reachability';
import { parseRoomMap } from './roomLoader';
import { WARE_KINDS, wareQuestion } from './shop';
import { doorwayCells, matchingSide, neighbourOf, roomAt, type Area, type Areas, type Cell, type RoomDefinition, type WorldSpot } from './worldMap';

/**
 * Checks the whole world once at boot, so a mistake in a map is an error naming the room
 * rather than Wren stuck in a wall:
 * - every map is the right size and uses known tiles;
 * - neighbouring screens' shared edges match, so every open edge leads somewhere open;
 * - every doorway has exactly one door and every door is on a doorway;
 * - every door leads to an open cell of a real screen, and the cell below it, where Wren comes
 *   back out, is open too;
 * - every enemy starts inside its room on an open cell (flying ones may start anywhere);
 * - every placed pickup lies on an open cell, and no two share an id;
 * - every signpost has exactly one text and every text is on a signpost; people and wares stand
 *   on open cells;
 * - everything anyone says fits the dialogue box and the pixel font can draw it;
 * - every cracked cliff has exactly one secret, leading somewhere open, and every hidden spot is
 *   in its room, with an id no placed pickup shares;
 * - in a dungeon, every room's doorways are open exactly where it lists a side door, the rooms on
 *   either side of a door list the same kind, only a bottom door may lead out of the dungeon
 *   (the entrance), every shut door has enemies on one side of it, every map, compass and boss key
 *   belongs to the dungeon it lies in, and the boss room exists;
 * - from `start`, Wren can reach every screen, and every pickup, person, ware, sign, secret wall
 *   and hidden spot (counting every cracked cliff as bombed open).
 */
export function checkWorld(areas: Areas, start: WorldSpot): void {
  checkSayings();
  const pickupIds = new Set<string>();
  for (const [areaName, area] of Object.entries(areas)) {
    area.screens.forEach((screenRow, row) => {
      screenRow.forEach((room, column) => {
        if (!room) return;
        parseRoomMap(room);
        checkDoors(areas, room);
        checkEnemies(room);
        checkPickups(room, pickupIds);
        checkSigns(room);
        checkStanding(room);
        checkSecrets(areas, room);
        checkHidden(room, pickupIds);
        if (area.kind === 'dungeon') checkDungeonRoom(areas, areaName, room, column, row);

        const east = screenRow[column + 1];
        if (east) checkEdge(room, east, 'east', (i) => [ROOM.columns - 1, i], (i) => [0, i], ROOM.rows);
        const south = area.screens[row + 1]?.[column];
        if (south) checkEdge(room, south, 'south', (i) => [i, ROOM.rows - 1], (i) => [i, 0], ROOM.columns);
      });
    });
    if (area.screens.length === 0) throw new Error(`Area "${areaName}" has no screens.`);
    if (area.kind === 'dungeon') checkBossRoom(areaName, area);
  }
  checkReachable(areas, start);
}

function symbolAt(room: RoomDefinition, [column, row]: readonly [number, number]): string | undefined {
  return room.tiles[row]?.[column];
}

/** Walks along the shared edge, comparing each cell of `room` with the one next to it in `next`. */
function checkEdge(
  room: RoomDefinition,
  next: RoomDefinition,
  side: string,
  cellHere: (index: number) => readonly [number, number],
  cellThere: (index: number) => readonly [number, number],
  length: number,
): void {
  for (let index = 0; index < length; index++) {
    const here = cellHere(index);
    if (isWalkable(symbolAt(room, here)) !== isWalkable(symbolAt(next, cellThere(index)))) {
      throw new Error(
        `Room "${room.name}" and its ${side} neighbour "${next.name}" do not match at column ${here[0]}, row ${here[1]}: ` +
          'one side is open and the other is solid.',
      );
    }
  }
}

function checkDoors(areas: Areas, room: RoomDefinition): void {
  const doors = room.doors ?? [];
  room.tiles.forEach((line, row) => {
    [...line].forEach((symbol, column) => {
      const count = doors.filter((door) => door.column === column && door.row === row).length;
      if (TILE_LEGEND[symbol]?.door && count !== 1) {
        throw new Error(`Room "${room.name}" has a doorway at column ${column}, row ${row} with ${count} doors, expected 1.`);
      }
    });
  });

  for (const door of doors) {
    if (!TILE_LEGEND[symbolAt(room, [door.column, door.row]) ?? '']?.door) {
      throw new Error(`Room "${room.name}" has a door at column ${door.column}, row ${door.row}, which is not a doorway.`);
    }
    checkOpenSpot(areas, door.to, `the door at column ${door.column}, row ${door.row} of "${room.name}" leads to`);
    checkOpenCell(room, { column: door.column, row: door.row + 1 }, 'Wren comes back out of its door at');
  }
}

function checkOpenSpot(areas: Areas, spot: WorldSpot, what: string): void {
  const room = roomAt(areas, spot);
  if (!room) throw new Error(`There is no screen at ${spot.area} ${spot.column},${spot.row}, which ${what}.`);
  checkOpenCell(room, spot.cell, what);
}

function checkOpenCell(room: RoomDefinition, { column, row }: Cell, what: string): void {
  if (!isWalkable(symbolAt(room, [column, row]))) {
    throw new Error(`Room "${room.name}" is solid at column ${column}, row ${row}, where ${what}.`);
  }
}

function checkEnemies(room: RoomDefinition): void {
  for (const { kind, column, row } of room.enemies ?? []) {
    const inside = column >= 0 && column < ROOM.columns && row >= 0 && row < ROOM.rows;
    if (!inside) throw new Error(`Room "${room.name}" has a ${kind} outside the room, at column ${column}, row ${row}.`);
    if (!FLYING_KINDS.has(kind)) checkOpenCell(room, { column, row }, `a ${kind} starts`);
  }
}

function checkPickups(room: RoomDefinition, seen: Set<string>): void {
  for (const { id, drop, column, row } of room.pickups ?? []) {
    if (seen.has(id)) throw new Error(`Room "${room.name}" has a pickup with the id "${id}", which another pickup already uses.`);
    seen.add(id);
    checkOpenCell(room, { column, row }, `a ${drop.kind} pickup lies`);
  }
}

/** Every person's lines and every shop question, whether or not a room uses them yet. */
function checkSayings(): void {
  for (const [id, person] of Object.entries<Person>(PEOPLE)) {
    checkText(person.talk, `What ${id} says`);
    if (person.gift) checkText(person.gift.after, `What ${id} says after giving the ${person.gift.item}`);
  }
  // A question shares its page with the two answer rows.
  for (const ware of WARE_KINDS) checkText([wareQuestion(ware)], `The shop's question about ${ware}`, ANSWER_ROWS);
}

function checkSigns(room: RoomDefinition): void {
  const signs = room.signs ?? [];
  room.tiles.forEach((line, row) => {
    [...line].forEach((symbol, column) => {
      const count = signs.filter((sign) => sign.column === column && sign.row === row).length;
      if (TILE_LEGEND[symbol]?.sign && count !== 1) {
        throw new Error(`Room "${room.name}" has a signpost at column ${column}, row ${row} with ${count} texts, expected 1.`);
      }
    });
  });
  for (const sign of signs) {
    if (!TILE_LEGEND[symbolAt(room, [sign.column, sign.row]) ?? '']?.sign) {
      throw new Error(`Room "${room.name}" has a sign text at column ${sign.column}, row ${sign.row}, which is not a signpost.`);
    }
    checkText([sign.text], `The sign at column ${sign.column}, row ${sign.row} of "${room.name}"`);
  }
}

function checkStanding(room: RoomDefinition): void {
  for (const { who, column, row } of room.people ?? []) checkOpenCell(room, { column, row }, `${who} stands`);
  for (const { ware, column, row } of room.wares ?? []) {
    checkOpenCell(room, { column, row }, `the ${ware} is on show`);
    checkOpenCell(room, { column, row: row + 1 }, `the ${ware}'s price is shown`);
  }
}

function checkSecrets(areas: Areas, room: RoomDefinition): void {
  const secrets = room.secrets ?? [];
  room.tiles.forEach((line, row) => {
    [...line].forEach((symbol, column) => {
      const count = secrets.filter((secret) => secret.column === column && secret.row === row).length;
      if (TILE_LEGEND[symbol]?.bombable && count !== 1) {
        throw new Error(`Room "${room.name}" has a cracked cliff at column ${column}, row ${row} with ${count} secrets, expected 1.`);
      }
    });
  });
  for (const secret of secrets) {
    if (!TILE_LEGEND[symbolAt(room, [secret.column, secret.row]) ?? '']?.bombable) {
      throw new Error(`Room "${room.name}" has a secret at column ${secret.column}, row ${secret.row}, which is not a cracked cliff.`);
    }
    checkOpenSpot(areas, secret.to, `the secret at column ${secret.column}, row ${secret.row} of "${room.name}" leads to`);
    checkOpenCell(room, { column: secret.column, row: secret.row + 1 }, 'Wren comes back out of its secret cave at');
  }
}

/** Hidden spots may be under something solid (a stump), but must be in the room, and their ids unique. */
function checkHidden(room: RoomDefinition, seen: Set<string>): void {
  for (const { id, column, row } of room.hidden ?? []) {
    if (seen.has(id)) throw new Error(`Room "${room.name}" has a hidden spot with the id "${id}", which another pickup already uses.`);
    seen.add(id);
    const inside = column >= 0 && column < ROOM.columns && row >= 0 && row < ROOM.rows;
    if (!inside) throw new Error(`Room "${room.name}" has a hidden spot outside the room, at column ${column}, row ${row}.`);
  }
}

/** Walks the world from the start, and names everything she could never get to. */
function checkReachable(areas: Areas, start: WorldSpot): void {
  const reach = walkWorld(areas, start);
  const missing: string[] = [];
  for (const [area, { screens }] of Object.entries(areas)) {
    screens.forEach((line, row) =>
      line.forEach((room, column) => {
        if (!room) return;
        const screen = { area, column, row };
        if (!reach.screens.has(`${area}/${column},${row}`)) {
          missing.push(`the screen "${room.name}"`);
          return;
        }
        const where = (what: string, cell: Cell): string => `${what} at column ${cell.column}, row ${cell.row} of "${room.name}"`;
        for (const pickup of room.pickups ?? []) if (!reach.canReach(screen, pickup)) missing.push(where(`the ${pickup.drop.kind}`, pickup));
        for (const spot of room.hidden ?? []) if (!reach.canReach(screen, spot) && !reach.canReachBeside(screen, spot)) missing.push(where('the hidden spot', spot));
        for (const person of room.people ?? []) if (!reach.canReachBeside(screen, person)) missing.push(where(person.who, person));
        for (const sign of room.signs ?? []) if (!reach.canReachBeside(screen, sign)) missing.push(where('the sign', sign));
        for (const secret of room.secrets ?? []) if (!reach.canReachBeside(screen, secret)) missing.push(where('the secret wall', secret));
        // A ware's solid part covers its price in the cell below, so she reaches it from beside either.
        for (const ware of room.wares ?? []) {
          const below = { column: ware.column, row: ware.row + 1 };
          if (!reach.canReachBeside(screen, ware) && !reach.canReachBeside(screen, below)) missing.push(where(`the ${ware.ware}`, ware));
        }
      }),
    );
  }
  if (missing.length > 0) throw new Error(`From the start, Wren cannot reach ${missing.join('; ')}.`);
}

function checkDungeonRoom(areas: Areas, area: string, room: RoomDefinition, column: number, row: number): void {
  const position = { area, column, row };
  for (const side of FACINGS) {
    const kind = room.sides?.[side];
    for (const cell of doorwayCells(side)) {
      if (isWalkable(symbolAt(room, [cell.column, cell.row])) !== (kind !== undefined)) {
        throw new Error(`Room "${room.name}" should have its doorway on the ${side} side ${kind ? 'open, for its door' : 'walled up, as it has no door there'}.`);
      }
    }
    if (!kind) continue;
    const next = neighbourOf(areas, position, side);
    if (!next) {
      if (side !== 'down' || kind !== 'open') throw new Error(`Room "${room.name}" lists its ${side} door as ${kind}, but there is no room on that side.`);
      continue;
    }
    const nextRoom = roomAt(areas, next);
    const theirs = nextRoom?.sides?.[matchingSide(side)];
    if (theirs !== kind) {
      throw new Error(`Room "${room.name}" lists its ${side} door as ${kind}, but "${nextRoom?.name}" lists that door as ${theirs ?? 'missing'}.`);
    }
    // A shut door closes on the side with enemies; with none on either side it would never close.
    const enemiesEitherSide = (room.enemies?.length ?? 0) + (nextRoom?.enemies?.length ?? 0) > 0;
    if (kind === 'shut' && !enemiesEitherSide) throw new Error(`Room "${room.name}" has a shut door on the ${side} side, but no enemies on either side of it.`);
  }
  for (const { drop } of [...(room.pickups ?? []), ...(room.hidden ?? [])]) {
    if ('dungeon' in drop && drop.dungeon !== area) {
      throw new Error(`Room "${room.name}" holds the ${drop.kind} of "${drop.dungeon}", but it is in "${area}".`);
    }
  }
}

function checkBossRoom(areaName: string, area: Area): void {
  if (!area.boss) return;
  if (!area.screens[area.boss.row]?.[area.boss.column]) {
    throw new Error(`Dungeon "${areaName}" has its boss room at ${area.boss.column},${area.boss.row}, where there is no room.`);
  }
}
