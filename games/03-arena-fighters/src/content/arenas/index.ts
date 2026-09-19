import { ARENA_IDS, type ArenaDefinition, type ArenaId } from './arenaTypes';
import { CASINO } from './casino';
import { CLINIC_STREET } from './clinic';
import { DOCKS } from './docks';
import { FIELD_CAMP } from './fieldCamp';
import { FOUNDRY } from './foundry';
import { MINE } from './mine';
import { PLAZA } from './plaza';
import { ROOFTOPS } from './rooftops';

/** Arenas painted so far. The rest arrive with their fighter's roster step. */
export const ARENAS: Partial<Record<ArenaId, ArenaDefinition>> = {
  docks: DOCKS,
  plaza: PLAZA,
  mine: MINE,
  foundry: FOUNDRY,
  rooftops: ROOFTOPS,
  casino: CASINO,
  clinic: CLINIC_STREET,
  fieldCamp: FIELD_CAMP,
};

/** The arena to draw. Arenas not painted yet are fought on the docks. */
export function builtArena(id: ArenaId): ArenaDefinition {
  return ARENAS[id] ?? DOCKS;
}

export function isArenaId(value: string): value is ArenaId {
  return ARENA_IDS.some((id) => id === value);
}
