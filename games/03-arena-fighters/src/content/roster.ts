/** The fifteen playable fighters, in character-select order (left to right, top row first). */
export const FIGHTERS = [
  { id: 'brand', name: 'BRAND' },
  { id: 'tala', name: 'TALA' },
  { id: 'grom', name: 'GROM' },
  { id: 'nova', name: 'NOVA' },
  { id: 'kestrel', name: 'KESTREL' },
  { id: 'wen', name: 'OLD WEN' },
  { id: 'rook', name: 'ROOK' },
  { id: 'knox', name: 'KNOX' },
  { id: 'cometa', name: 'COMETA' },
  { id: 'sable', name: 'SABLE' },
  { id: 'kanan', name: 'KANAN' },
  { id: 'mahmood', name: 'MAHMOOD' },
  { id: 'rajab', name: 'RAJAB' },
  { id: 'azar', name: 'AZAR' },
  { id: 'osal', name: 'OSAL' },
] as const;

/**
 * The boss, who is fought but never chosen: he waits at the end of arcade mode and is kept out
 * of `FIGHTERS` so the character select's grid stays the fifteen anyone may pick, and its `?` box
 * can never hand a player the boss.
 */
export const BOSS = { id: 'vane', name: 'MAGNUS VANE' } as const;

/** A fighter someone can pick. */
export type PlayableId = (typeof FIGHTERS)[number]['id'];

/** Anyone who can be in a fight: the fifteen, or the boss. */
export type FighterId = PlayableId | typeof BOSS.id;

/** The fifteen, in character-select order. The boss is not among them. */
export const FIGHTER_IDS: readonly PlayableId[] = FIGHTERS.map((fighter) => fighter.id);

/** Everyone who can be in a fight, boss last. A fighter's place here is their number in the checksum. */
export const ALL_FIGHTER_IDS: readonly FighterId[] = [...FIGHTER_IDS, BOSS.id];

/** True for a known fighter id, the boss included. Used for the dev shortcut now and for online messages later. */
export function isFighterId(value: string): value is FighterId {
  return ALL_FIGHTER_IDS.some((id) => id === value);
}

/** True for a fighter someone is allowed to pick, which the boss is not. */
export function isPlayableId(value: string): value is PlayableId {
  return FIGHTER_IDS.some((id) => id === value);
}

export function fighterName(id: FighterId): string {
  if (id === BOSS.id) return BOSS.name;
  return FIGHTERS.find((fighter) => fighter.id === id)?.name ?? id.toUpperCase();
}
