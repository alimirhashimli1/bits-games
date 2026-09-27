import type { TileFrame } from '../sprites/tiles';

export interface TileDefinition {
  readonly frame: TileFrame;
  /** Solid tiles stop Wren and enemies. The rest can be walked on. */
  readonly solid: boolean;
  /** Walking into it goes somewhere else. The room lists where, one door per doorway. */
  readonly door?: boolean;
  /** Walking into it reads it. The room lists what it says, one text per sign. */
  readonly sign?: boolean;
  /** A bomb opens it into a cave mouth. The room lists it as a secret, with where the cave leads. */
  readonly bombable?: boolean;
}

/** What each character in a room map stands for. */
export const TILE_LEGEND: Readonly<Record<string, TileDefinition>> = {
  '.': { frame: 'grass', solid: false },
  ',': { frame: 'flowers', solid: false },
  ':': { frame: 'path', solid: false },
  s: { frame: 'sand', solid: false },
  w: { frame: 'water', solid: true },
  /** Planks run across, so a bridge is crossed going up or down the screen. */
  '=': { frame: 'bridge', solid: false },
  T: { frame: 'tree', solid: true },
  b: { frame: 'bush', solid: true },
  o: { frame: 'rock', solid: true },
  '#': { frame: 'wall', solid: true },
  /** A cave or house door in a wall. */
  D: { frame: 'doorway', solid: false, door: true },
  /** The floor of a cave. */
  _: { frame: 'caveFloor', solid: false },
  /** A signpost: solid, and read by walking into it. */
  S: { frame: 'sign', solid: true, sign: true },
  R: { frame: 'roof', solid: true },
  H: { frame: 'houseWall', solid: true },
  /** A house's front door. */
  h: { frame: 'houseDoor', solid: false, door: true },
  /** Inside a house. */
  '-': { frame: 'woodFloor', solid: false },
  u: { frame: 'stump', solid: true },
  '^': { frame: 'cliff', solid: true },
  /** A cave's way in, in a cliff. */
  C: { frame: 'caveMouth', solid: false, door: true },
  /** A cracked cliff face: solid until a bomb opens it into a cave mouth. */
  '%': { frame: 'crackedCliff', solid: true, bombable: true },
  /** The crystal that seals the Crystal Spire until both shards are back. */
  '*': { frame: 'crystal', solid: true },
  /** A dungeon room's floor. Its doorways are written as floor too; closed doors are drawn over them. */
  '+': { frame: 'dungeonFloor', solid: false },
  X: { frame: 'dungeonWall', solid: true },
  /** A stone block in a dungeon room. */
  B: { frame: 'block', solid: true },
};

/** What a cracked cliff turns into once it is bombed open. */
export const OPENED_SECRET_FRAME: TileDefinition['frame'] = 'caveMouth';

/** Whether a map character can be walked on. Unknown characters count as solid. */
export function isWalkable(symbol: string | undefined): boolean {
  const tile = symbol === undefined ? undefined : TILE_LEGEND[symbol];
  return tile !== undefined && !tile.solid;
}
