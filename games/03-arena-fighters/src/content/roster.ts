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

export type FighterId = (typeof FIGHTERS)[number]['id'];

export const FIGHTER_IDS: readonly FighterId[] = FIGHTERS.map((fighter) => fighter.id);

/** True for a known fighter id. Used for the dev shortcut now and for online messages later. */
export function isFighterId(value: string): value is FighterId {
  return FIGHTER_IDS.some((id) => id === value);
}

export function fighterName(id: FighterId): string {
  return FIGHTERS.find((fighter) => fighter.id === id)?.name ?? id.toUpperCase();
}
