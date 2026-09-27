import type { Area, WorldSpot } from '../../systems/worldMap';
import { dungeonRoom } from './dungeonRoom';

/**
 * A small test dungeon behind the Mossroot Hollow door, until the real Mossroot Cellar is built
 * (dungeon 1). Every kind of door is needed to reach the boss room:
 *
 *                 [boss room]
 *                      ‖ boss door
 *   [key room] =locked= [hub] =shut= [compass room]
 *        |              ‖ locked
 *   [map room] ---- [entrance] ~cracked~ [cracked room]
 *                      | out
 *
 * The entrance holds the first small key (for the hub), the cracked room the second (for the
 * key room), which holds the boss key and is dark until the Lantern lights it. The compass room
 * shuts behind Wren until it is cleared.
 */

export const TEST_DUNGEON_NAME = 'testDungeon';
const DUNGEON = TEST_DUNGEON_NAME;

const OPEN_FLOOR = [
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
] as const;

/** Blocks near each corner. */
const CORNER_BLOCKS = [
  '++++++++++++++++++',
  '++B++++++++++++B++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++++++++++++++++++',
  '++B++++++++++++B++',
  '++++++++++++++++++',
] as const;

const ENTRANCE = dungeonRoom({
  name: 'Test dungeon entrance',
  inside: CORNER_BLOCKS,
  sides: { down: 'open', up: 'locked', left: 'open', right: 'cracked' },
  pickups: [{ id: 'test-dungeon-key-1', column: 5, row: 4, drop: { kind: 'key' } }],
});

const MAP_ROOM = dungeonRoom({
  name: 'Test dungeon map room',
  inside: OPEN_FLOOR,
  sides: { right: 'open' },
  enemies: [
    { kind: 'blub', column: 5, row: 3 },
    { kind: 'blub', column: 5, row: 6 },
  ],
  pickups: [{ id: 'test-dungeon-map', column: 3, row: 4, drop: { kind: 'map', dungeon: DUNGEON } }],
});

const CRACKED_ROOM = dungeonRoom({
  name: 'Test dungeon cracked room',
  inside: [
    '++++++++++++++++++',
    '++++++++++++++++++',
    '+++++++BBBB+++++++',
    '+++++++B++B+++++++',
    '+++++++B++B+++++++',
    '+++++++B++B+++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
  ],
  sides: { left: 'cracked' },
  enemies: [{ kind: 'pebblenose', column: 15, row: 2 }],
  pickups: [{ id: 'test-dungeon-key-2', column: 9, row: 5, drop: { kind: 'key' } }],
});

const HUB = dungeonRoom({
  name: 'Test dungeon hub',
  inside: CORNER_BLOCKS,
  sides: { down: 'locked', left: 'locked', right: 'shut', up: 'boss' },
});

/** Dark, until the Lantern lights it. */
const KEY_ROOM = dungeonRoom({
  name: 'Test dungeon key room',
  inside: OPEN_FLOOR,
  dark: true,
  sides: { right: 'locked' },
  enemies: [{ kind: 'thornback', column: 4, row: 3 }],
  pickups: [{ id: 'test-dungeon-boss-key', column: 3, row: 6, drop: { kind: 'bossKey', dungeon: DUNGEON } }],
});

const COMPASS_ROOM = dungeonRoom({
  name: 'Test dungeon compass room',
  inside: CORNER_BLOCKS,
  sides: { left: 'shut' },
  enemies: [
    { kind: 'blub', column: 12, row: 3 },
    { kind: 'blub', column: 12, row: 6 },
  ],
  pickups: [{ id: 'test-dungeon-compass', column: 15, row: 4, drop: { kind: 'compass', dungeon: DUNGEON } }],
});

const BOSS_ROOM = dungeonRoom({
  name: 'Test dungeon boss room',
  inside: [
    '++++++++++++++++++',
    '++++++++S+++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
    '++++++++++++++++++',
  ],
  sides: { down: 'boss' },
  signs: [{ column: 9, row: 2, text: 'The end of the test dungeon. A real boss waits here once the dungeons are built.' }],
});

export const TEST_DUNGEON: Area = {
  kind: 'dungeon',
  screens: [
    [null, BOSS_ROOM, null],
    [KEY_ROOM, HUB, COMPASS_ROOM],
    [MAP_ROOM, ENTRANCE, CRACKED_ROOM],
  ],
  boss: { column: 1, row: 0 },
};

/** Where its door leads: just inside the entrance room's way out. */
export const TEST_DUNGEON_ENTRANCE: WorldSpot = { area: DUNGEON, column: 1, row: 2, cell: { column: 9, row: 8 } };
