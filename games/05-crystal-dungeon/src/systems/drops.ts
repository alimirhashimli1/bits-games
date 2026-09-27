import { DROPS } from '../config';
import type { Random } from './ai/gridWalk';

/** Something to pick up: a heart, a gem worth 1, 5 or 20, a small key, a few bombs, or a heart container. */
export type Drop =
  | { readonly kind: 'heart' }
  | { readonly kind: 'heartContainer' }
  | { readonly kind: 'gem'; readonly value: number }
  | { readonly kind: 'key' }
  | { readonly kind: 'bombs' }
  /** A dungeon's map, compass or boss key, for the dungeon (area) it lies in. */
  | { readonly kind: DungeonItemKind; readonly dungeon: string };

/** What each dungeon holds one of. */
export const DUNGEON_ITEM_KINDS = ['map', 'compass', 'bossKey'] as const;

export type DungeonItemKind = (typeof DUNGEON_ITEM_KINDS)[number];

/**
 * Rolls for what a defeated enemy leaves: a heart, bombs, a gem, or nothing. Bombs only come
 * once she can carry them; before that their share leaves nothing, so the other odds never
 * change. Enemies never drop keys: those lie in rooms.
 */
export function rollDrop(random: Random, canCarryBombs: boolean): Drop | null {
  const roll = random();
  if (roll < DROPS.heartChance) return { kind: 'heart' };
  if (roll < DROPS.heartChance + DROPS.bombChance) return canCarryBombs ? { kind: 'bombs' } : null;
  if (roll >= DROPS.heartChance + DROPS.bombChance + DROPS.gemChance) return null;

  const total = DROPS.gemValues.reduce((sum, gem) => sum + gem.weight, 0);
  let valueRoll = random() * total;
  for (const gem of DROPS.gemValues) {
    valueRoll -= gem.weight;
    if (valueRoll < 0) return { kind: 'gem', value: gem.value };
  }
  return { kind: 'gem', value: DROPS.gemValues[0].value };
}
