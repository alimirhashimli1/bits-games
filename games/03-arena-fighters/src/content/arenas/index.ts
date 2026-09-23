import { ARENA_IDS, type ArenaDefinition, type ArenaId } from './arenaTypes';
import { BAMBOO_FOREST } from './bamboo';
import { CASINO } from './casino';
import { CLINIC_STREET } from './clinic';
import { DOCKS } from './docks';
import { FIELD_CAMP } from './fieldCamp';
import { FOUNDRY } from './foundry';
import { GYM } from './gym';
import { HANGAR } from './hangar';
import { MINE } from './mine';
import { MONASTERY } from './monastery';
import { PLAZA } from './plaza';
import { POWER_STATION } from './powerStation';
import { RING } from './ring';
import { ROOFTOPS } from './rooftops';
import { RUINS } from './ruins';
import { TOWER_ROOF } from './towerRoof';

/** Arenas painted so far. The rest arrive with their fighter's roster step. */
export const ARENAS: Partial<Record<ArenaId, ArenaDefinition>> = {
  docks: DOCKS,
  plaza: PLAZA,
  mine: MINE,
  powerStation: POWER_STATION,
  bamboo: BAMBOO_FOREST,
  monastery: MONASTERY,
  hangar: HANGAR,
  gym: GYM,
  ring: RING,
  ruins: RUINS,
  foundry: FOUNDRY,
  rooftops: ROOFTOPS,
  casino: CASINO,
  clinic: CLINIC_STREET,
  fieldCamp: FIELD_CAMP,
  towerRoof: TOWER_ROOF,
};

/** The arena to draw. Arenas not painted yet are fought on the docks. */
export function builtArena(id: ArenaId): ArenaDefinition {
  return ARENAS[id] ?? DOCKS;
}

export function isArenaId(value: string): value is ArenaId {
  return ARENA_IDS.some((id) => id === value);
}
