import { CARRY, DROPS, HEALTH } from '../config';
import type { Drop, DungeonItemKind } from './drops';
import { ITEM_KINDS, type ItemKind } from './items';

/**
 * Everything about the adventure that outlives a screen: Wren's health, in half hearts, what
 * she carries, and which placed pickups she has taken. Opened doors and progress join it in
 * later steps, and it is what gets saved.
 */
export interface GameState {
  maxHealth: number;
  health: number;
  gems: number;
  keys: number;
  bombs: number;
  /** How many bombs she can carry: 0 until she finds the bomb bag. */
  maxBombs: number;
  /** The items she has found, in the order she found them. */
  items: ItemKind[];
  itemInHand: ItemKind | null;
  /** The ids of placed pickups she has taken, so they do not come back. */
  collected: string[];
  /** Bought in the Emberfen shop: it stops what her grandmother's old shield cannot. */
  hasBrightshield: boolean;
  /** The ids of secret walls and cracked dungeon walls she has bombed open, so they stay open. */
  opened: string[];
  /** The ids of locked and boss doors she has opened. */
  unlocked: string[];
  /** Dungeon rooms she has cleared of enemies: they stay clear, and their shut doors open. */
  cleared: string[];
  /** Dungeon rooms she has been in, for the mini-map before she has the dungeon's map. */
  visited: string[];
  /** For each dungeon (area) name, which of its map, compass and boss key she has. */
  dungeonItems: Record<string, DungeonItemKind[]>;
}

export function newGameState(): GameState {
  const maxHealth = HEALTH.startHearts * HEALTH.unitsPerHeart;
  return {
    maxHealth,
    health: maxHealth,
    gems: 0,
    keys: 0,
    bombs: 0,
    maxBombs: 0,
    items: [],
    itemInHand: null,
    collected: [],
    hasBrightshield: false,
    opened: [],
    unlocked: [],
    cleared: [],
    visited: [],
    dungeonItems: {},
  };
}

/** Takes health away, never below zero. Returns true if none is left. */
export function loseHealth(state: GameState, amount: number): boolean {
  state.health = Math.max(0, state.health - amount);
  return state.health === 0;
}

export function hasFullHealth(state: GameState): boolean {
  return state.health === state.maxHealth;
}

/** Gives health back, never above the maximum. */
export function gainHealth(state: GameState, amount: number): void {
  state.health = Math.min(state.maxHealth, state.health + amount);
}

/** Adds gems, never above what her purse holds. */
export function addGems(state: GameState, amount: number): void {
  state.gems = Math.min(CARRY.maxGems, state.gems + amount);
}

export function addKeys(state: GameState, amount: number): void {
  state.keys = Math.min(CARRY.maxKeys, state.keys + amount);
}

/** Adds bombs, never above what her bag holds (none, before she has it). */
export function addBombs(state: GameState, amount: number): void {
  state.bombs = Math.min(state.maxBombs, state.bombs + amount);
}

export function canCarryBombs(state: GameState): boolean {
  return state.maxBombs > 0;
}

/**
 * Gives her an item. The first item she finds goes straight into her hand. The bombs item comes
 * with the bomb bag, full.
 */
export function giveItem(state: GameState, item: ItemKind): void {
  if (!state.items.includes(item)) state.items.push(item);
  state.itemInHand ??= item;
  if (item === 'bombs') {
    state.maxBombs = CARRY.bombBagSize;
    state.bombs = CARRY.bombBagSize;
  }
}

/** Puts the next item she owns in her hand, in the inventory's order. */
export function cycleItemInHand(state: GameState): void {
  const owned = ITEM_KINDS.filter((item) => state.items.includes(item));
  if (owned.length === 0) return;
  const index = state.itemInHand ? owned.indexOf(state.itemInHand) : -1;
  state.itemInHand = owned[(index + 1) % owned.length] ?? null;
}

/** Whether she can take a pickup: bombs stay on the floor until she has the bag to carry them in. */
export function canCollect(state: GameState, drop: Drop): boolean {
  return drop.kind !== 'bombs' || canCarryBombs(state);
}

/** Adds what a pickup gives. */
export function collectDrop(state: GameState, drop: Drop): void {
  switch (drop.kind) {
    case 'heart':
      gainHealth(state, DROPS.heartHealth);
      break;
    case 'gem':
      addGems(state, drop.value);
      break;
    case 'key':
      addKeys(state, 1);
      break;
    case 'bombs':
      addBombs(state, CARRY.bombsPerPickup);
      break;
    case 'heartContainer':
      state.maxHealth += HEALTH.unitsPerHeart;
      state.health = state.maxHealth;
      break;
    case 'map':
    case 'compass':
    case 'bossKey':
      giveDungeonItem(state, drop.dungeon, drop.kind);
      break;
  }
}

export function giveDungeonItem(state: GameState, dungeon: string, item: DungeonItemKind): void {
  const items = state.dungeonItems[dungeon] ?? [];
  if (!items.includes(item)) items.push(item);
  state.dungeonItems[dungeon] = items;
}

export function hasDungeonItem(state: GameState, dungeon: string, item: DungeonItemKind): boolean {
  return state.dungeonItems[dungeon]?.includes(item) ?? false;
}
