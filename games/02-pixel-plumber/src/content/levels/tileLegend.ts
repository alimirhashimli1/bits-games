import type { EnemyForm } from '../../systems/enemyRules';
import type { TileFrame } from '../sprites/tiles';

/** What a tile does when Rusty's head hits it from below. Tiles without one do nothing. */
export type BlockKind = 'coinBlock' | 'powerUpBlock' | 'gasketBrick' | 'brick' | 'multiCoinBrick';

/** What a hidden block holds. */
export type HiddenBlockReward = 'coin' | 'wrench';

export interface TileDefinition {
  readonly frame: TileFrame;
  /** Solid tiles stop Rusty and enemies. The rest is scenery. */
  readonly solid: boolean;
  readonly block?: BlockKind;
  /** The top of the pole that ends the level. Every level has exactly one. */
  readonly levelEnd?: boolean;
  /** The left half of a pipe Rusty can go down. A map has at most one. */
  readonly pipeEntry?: boolean;
}

/** An empty cell: sky, or whatever the level's background is. */
export const EMPTY_TILE = '.';

/** Where Rusty starts: his feet on the bottom of this cell. Every level has exactly one. */
export const SPAWN_MARKER = '@';

/** A loose coin, collected by touching it. */
export const COIN_MARKER = 'o';

/**
 * Where Rusty comes back out of a pipe: the empty cell above the left half of the pipe he
 * rises from. A level with a pipe to go down needs one of these.
 */
export const RETURN_MARKER = 'R';

/** Invisible blocks, and what each holds. They are not there until Rusty jumps into them from below. */
export const HIDDEN_BLOCK_MARKERS: Readonly<Record<string, HiddenBlockReward>> = {
  H: 'coin',
  W: 'wrench',
};

/**
 * Where each enemy starts, standing on the bottom of its cell. A Sprout goes in the empty cell
 * above the left half of a pipe top, and rises out of the middle of that pipe. A Spark hangs in
 * the middle of its cell and swings round it.
 */
export const ENEMY_MARKERS: Readonly<Record<string, EnemyForm>> = {
  g: 'gloop',
  b: 'shellbug',
  f: 'flutterbug',
  v: 'sprout',
  '^': 'spark',
};

/** How a moving platform travels. */
export type PlatformMotion = 'sideways' | 'lift';

/**
 * Moving platforms are written as their tracks. A row of `=` is a sideways track: the platform
 * starts at its left end and rides to the right end and back. A column of `:` is a lift: the
 * platform's left end rides from the top cell to the bottom one and back, its top level with
 * the top of the cell. Either way the platform is three tiles wide, so a lift's other two
 * columns are left empty.
 */
export const PLATFORM_MARKERS: Readonly<Record<string, PlatformMotion>> = {
  '=': 'sideways',
  ':': 'lift',
};

/** What each character in a level map stands for. */
export const TILE_LEGEND: Readonly<Record<string, TileDefinition>> = {
  '#': { frame: 'ground', solid: true },
  B: { frame: 'brick', solid: true, block: 'brick' },
  /** Looks like any other brick, but keeps giving coins for a few seconds. */
  C: { frame: 'brick', solid: true, block: 'multiCoinBrick' },
  /** Looks like any other brick, but holds a Golden Gasket. */
  '*': { frame: 'brick', solid: true, block: 'gasketBrick' },
  '?': { frame: 'question', solid: true, block: 'coinBlock' },
  /** Looks like a coin block, but holds a Gear or a Steam Valve. */
  P: { frame: 'question', solid: true, block: 'powerUpBlock' },
  U: { frame: 'used', solid: true },
  X: { frame: 'stair', solid: true },
  '[': { frame: 'pipeTopLeft', solid: true },
  /** Looks like any other pipe top, but ducking on it goes down the pipe. */
  D: { frame: 'pipeTopLeft', solid: true, pipeEntry: true },
  ']': { frame: 'pipeTopRight', solid: true },
  '{': { frame: 'pipeBodyLeft', solid: true },
  '}': { frame: 'pipeBodyRight', solid: true },
  /** The pole at the end of the level: `E` is its top, where the valve wheel starts. */
  E: { frame: 'poleTop', solid: false, levelEnd: true },
  '|': { frame: 'pole', solid: false },
  '(': { frame: 'cloudLeft', solid: false },
  ')': { frame: 'cloudRight', solid: false },
  '<': { frame: 'bushLeft', solid: false },
  '>': { frame: 'bushRight', solid: false },
};
