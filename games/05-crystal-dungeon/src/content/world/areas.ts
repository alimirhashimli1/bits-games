import type { Areas, WorldSpot } from '../../systems/worldMap';
import { INTERIORS } from './interiors';
import { OVERWORLD, START } from './overworld';
import { TEST_DUNGEON, TEST_DUNGEON_NAME } from './testDungeon';

/** Every area of the world: the overworld, the caves and houses, and later the dungeons. */
export const AREAS: Areas = { overworld: OVERWORLD, ...INTERIORS, [TEST_DUNGEON_NAME]: TEST_DUNGEON };

/** Where a new game starts. */
export const START_SPOT: WorldSpot = START;
