import type { LevelMap } from '../../systems/levelLoader';
import type { LevelId } from './levelOrder';
import { TEST_LEVEL } from './testLevel';
import { TEST_ROOM } from './testRoom';
import { LEVEL_1_1, LEVEL_1_1_ROOM, LEVEL_1_2, LEVEL_1_2_ROOM } from './world1';

/** A level, and the room under it that its pipe leads to. */
export interface LevelMaps {
  readonly map: LevelMap;
  readonly room: LevelMap;
}

const BUILT: Partial<Record<LevelId, LevelMaps>> = {
  '1-1': { map: LEVEL_1_1, room: LEVEL_1_1_ROOM },
  '1-2': { map: LEVEL_1_2, room: LEVEL_1_2_ROOM },
};

/** The maps for a level. Worlds that are not built yet still play the test street. */
export function levelMaps(id: LevelId): LevelMaps {
  return BUILT[id] ?? { map: TEST_LEVEL, room: TEST_ROOM };
}
