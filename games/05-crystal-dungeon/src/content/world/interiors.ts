import type { Area, RoomDefinition, WorldSpot } from '../../systems/worldMap';

/**
 * The caves and houses of Glimmervale: each a single screen, entered through a door and left by
 * walking out of the gap at the bottom, back to the door. Wren always comes in just above the gap.
 */

/** Where Wren appears inside any of them: just above the way out. */
const JUST_INSIDE = { column: 9, row: 8 } as const;

/** Where a door leads: just inside the interior called `area`. */
export function insideOf(area: InteriorName): WorldSpot {
  return { area, column: 0, row: 0, cell: JUST_INSIDE };
}

/** A wooden house: board walls, a plank floor, the way out at the bottom. */
const HOUSE_TILES = [
  'HHHHHHHHHHHHHHHHHHHH',
  'H------------------H',
  'H------------------H',
  'H------------------H',
  'H------------------H',
  'H------------------H',
  'H------------------H',
  'H------------------H',
  'H------------------H',
  'HHHHHHHHH-HHHHHHHHHH',
] as const;

/** A cave in the rock: cliff walls, an earth floor, the way out at the bottom. */
const CAVE_TILES = [
  '^^^^^^^^^^^^^^^^^^^^',
  '^^^^____________^^^^',
  '^^________________^^',
  '^__________________^',
  '^__________________^',
  '^__________________^',
  '^__________________^',
  '^^________________^^',
  '^^^^^__________^^^^^',
  '^^^^^^^^^_^^^^^^^^^^',
] as const;

/** A dungeon's first hall: stone walls and floor, and a sign where the way on will be. */
const DUNGEON_HALL_TILES = [
  '####################',
  '#########S##########',
  '#__________________#',
  '#__________________#',
  '#__________________#',
  '#__________________#',
  '#__________________#',
  '#__________________#',
  '#__________________#',
  '#########_##########',
] as const;

const GRAN_HOUSE: RoomDefinition = {
  name: "Gran's house",
  tiles: HOUSE_TILES,
  people: [{ who: 'gran', column: 9, row: 3 }],
};

const SHOP: RoomDefinition = {
  name: "Pim's shop",
  tiles: HOUSE_TILES,
  people: [{ who: 'pim', column: 9, row: 2 }],
  wares: [
    { ware: 'brightshield', column: 6, row: 4 },
    { ware: 'bombRefill', column: 9, row: 4 },
    { ware: 'potion', column: 12, row: 4 },
  ],
};

const HERMIT_CAVE: RoomDefinition = {
  name: "Old Fennick's cave",
  tiles: CAVE_TILES,
  people: [{ who: 'hermit', column: 9, row: 3 }],
};

/** Behind the cracked cliff on Frost Ridge. */
const RIDGE_CAVE: RoomDefinition = {
  name: 'Frost Ridge cave',
  tiles: CAVE_TILES,
  pickups: [{ id: 'ridge-heart', column: 9, row: 3, drop: { kind: 'heartContainer' } }],
};

/** Behind the cracked cliff on the Cliff Coast. */
const COAST_CAVE: RoomDefinition = {
  name: 'Cliff Coast cave',
  tiles: CAVE_TILES,
  pickups: [
    { id: 'coast-heart', column: 9, row: 3, drop: { kind: 'heartContainer' } },
    { id: 'coast-gem-left', column: 5, row: 4, drop: { kind: 'gem', value: 20 } },
    { id: 'coast-gem-right', column: 14, row: 4, drop: { kind: 'gem', value: 20 } },
  ],
};

/** Until the Sunken Vault is built (dungeon 2), its door leads to this hall. */
const VAULT_HALL: RoomDefinition = {
  name: 'Sunken Vault hall',
  tiles: DUNGEON_HALL_TILES,
  signs: [{ column: 9, row: 1, text: 'Sunken Vault. Water fills the stairs down, for now.' }],
};

export const INTERIORS = {
  granHouse: { kind: 'interior', screens: [[GRAN_HOUSE]] },
  shop: { kind: 'interior', screens: [[SHOP]] },
  hermitCave: { kind: 'interior', screens: [[HERMIT_CAVE]] },
  ridgeCave: { kind: 'interior', screens: [[RIDGE_CAVE]] },
  coastCave: { kind: 'interior', screens: [[COAST_CAVE]] },
  vaultHall: { kind: 'interior', screens: [[VAULT_HALL]] },
} as const satisfies Record<string, Area>;

export type InteriorName = keyof typeof INTERIORS;
