import type { Area, RoomDefinition, WorldSpot } from '../../systems/worldMap';
import { insideOf } from './interiors';
import { TEST_DUNGEON_ENTRANCE } from './testDungeon';

/**
 * The overworld of Glimmervale: 5 × 4 screens with Emberfen in the middle.
 *
 *            west                                                   east
 *   north    Deep Wood    Mossroot Hollow  Old Pass     Spire Gate      Frost Ridge
 *            Wood Edge    Forest Path      North Road   Stone Hills     Hermit's Rise
 *            West Meadow  Emberfen West    Emberfen     Emberfen East   Eastern Hills
 *   south    Reed Shore   Sunken Lake      Lake Bank    Southern Fields Cliff Coast
 *
 * Neighbours meet through a two-tile gap: rows 4 and 5 on an east or west edge, columns 9 and
 * 10 on a north or south edge. Every other edge tile is solid, so the edges always match.
 * Forest Path and Emberfen West, and Spire Gate and Stone Hills, are not joined.
 */

const DEEP_WOOD: RoomDefinition = {
  name: 'Deep Wood',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTT',
    'TTT....TTTTT....,.TT',
    'TT..u.....T.......TT',
    'TT....b.......T...TT',
    'TT......TT..........',
    'T...,.......b.......',
    'TT...TT..........TTT',
    'TTT.......T....,..TT',
    'TTTTT....,....TTTTTT',
    'TTTTTTTTT..TTTTTTTTT',
  ],
  enemies: [
    { kind: 'flitter', column: 12, row: 2 },
    { kind: 'blub', column: 6, row: 5 },
    { kind: 'blub', column: 14, row: 7 },
  ],
  hidden: [{ id: 'deep-wood-stump', column: 4, row: 2, drop: { kind: 'gem', value: 20 } }],
};

/** The way down to the Mossroot Cellar, through a ruined wall. Until it is built, the test dungeon is down there. */
const MOSSROOT_HOLLOW: RoomDefinition = {
  name: 'Mossroot Hollow',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTT',
    'TTTT############TTTT',
    'TT..######D#####..TT',
    'TT.......:........TT',
    '...b.....:....b.....',
    '.........:..........',
    'TT..,....:.....,..TT',
    'TTT......:.......TTT',
    'TTTTT....:....TTTTTT',
    'TTTTTTTTT:.TTTTTTTTT',
  ],
  doors: [{ column: 10, row: 2, to: TEST_DUNGEON_ENTRANCE }],
  enemies: [
    { kind: 'blub', column: 4, row: 5 },
    { kind: 'blub', column: 15, row: 6 },
    { kind: 'flitter', column: 12, row: 3 },
  ],
};

const OLD_PASS: RoomDefinition = {
  name: 'Old Pass',
  tiles: [
    '^^^^^^^^^^^^^^^^^^^^',
    '^^^^^^^^^^^^^^^^^^^^',
    '^^^^....^^^^....^^^^',
    '^^......^^......o.^^',
    '........:::.........',
    '....o...:.:.........',
    '^^......:.:.....^^^^',
    '^^^^....:.:...^^^^^^',
    '^^^^^^..:.:..^^^^^^^',
    '^^^^^^^^^:.^^^^^^^^^',
  ],
  enemies: [
    { kind: 'pebblenose', column: 5, row: 3 },
    { kind: 'thornback', column: 14, row: 5 },
  ],
};

/** The foot of the Crystal Spire, its door sealed by crystal until both shards are back. */
const SPIRE_GATE: RoomDefinition = {
  name: 'Spire Gate',
  tiles: [
    '^^^^^^^^^^^^^^^^^^^^',
    '^^^^^^^######^^^^^^^',
    '^^^^^^^######^^^^^^^',
    '^^^^^..######..^^^^^',
    '.....S..****........',
    '....................',
    '^^.......o......^^^^',
    '^^^^..........^^^^^^',
    '^^^^^^^....^^^^^^^^^',
    '^^^^^^^^^^^^^^^^^^^^',
  ],
  signs: [{ column: 5, row: 4, text: "The Spire's door is sealed by crystal. It hums, as if it misses something." }],
  enemies: [{ kind: 'thornback', column: 12, row: 5 }],
};

/** A cracked cliff hides a cave with a heart container. */
const FROST_RIDGE: RoomDefinition = {
  name: 'Frost Ridge',
  tiles: [
    '^^^^^^^^^^^^^^^^^^^^',
    '^^^^^^^^^^^^%^^^^^^^',
    '^^^^^^.........^^^^^',
    '^^^.....o.......^^^^',
    '...............o.^^^',
    '..........,.......^^',
    '^^^.....b.........^^',
    '^^^^^.............^^',
    '^^^^^^^^..:....^^^^^',
    '^^^^^^^^^:.^^^^^^^^^',
  ],
  secrets: [{ id: 'frost-ridge-cave', column: 12, row: 1, to: insideOf('ridgeCave') }],
  enemies: [
    { kind: 'thornback', column: 5, row: 5 },
    { kind: 'pebblenose', column: 13, row: 6 },
  ],
};

const WOOD_EDGE: RoomDefinition = {
  name: 'Wood Edge',
  tiles: [
    'TTTTTTTTT..TTTTTTTTT',
    'TTT......:.....TTTTT',
    'TT....b..:......,.TT',
    'TT.......::::.....TT',
    'TT..,.......::::....',
    'T..............:....',
    'TT....T....b...:..TT',
    'TT.............:..TT',
    'TTTT....T.:::::...TT',
    'TTTTTTTTT:.TTTTTTTTT',
  ],
  enemies: [
    { kind: 'blub', column: 5, row: 5 },
    { kind: 'blub', column: 13, row: 2 },
  ],
};

const FOREST_PATH: RoomDefinition = {
  name: 'Forest Path',
  tiles: [
    'TTTTTTTTT:.TTTTTTTTT',
    'TTT......:.......TTT',
    'TT...b...:....o...TT',
    'TT......::::.......T',
    '..........::::::::::',
    '...,..........,.....',
    'TT.....b.......T..TT',
    'TTT......,.......TTT',
    'TTTTTT......TTTTTTTT',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  enemies: [
    { kind: 'blub', column: 6, row: 4 },
    { kind: 'flitter', column: 12, row: 6 },
    { kind: 'pebblenose', column: 4, row: 7 },
  ],
};

const NORTH_ROAD: RoomDefinition = {
  name: 'North Road',
  tiles: [
    '^^^^^^^^^:.^^^^^^^^^',
    'TT.......:.......TTT',
    'TT..o....:...S...TTT',
    'TT.......:........TT',
    ':::::::::::.........',
    '.........:::::::::::',
    'TT.......:........TT',
    'TT..,....:....b...TT',
    'TTT......:.......TTT',
    'TTTTTTTTT:.TTTTTTTTT',
  ],
  signs: [{ column: 13, row: 2, text: 'North: the Old Pass and the Crystal Spire. East: the stone hills. West: the forest.' }],
  enemies: [{ kind: 'pebblenose', column: 6, row: 6 }],
};

const STONE_HILLS: RoomDefinition = {
  name: 'Stone Hills',
  tiles: [
    '^^^^^^^^^^^^^^^^^^^^',
    '^^^^...^^^^^...^^^^^',
    '^^.......o.......^^^',
    '^^..o.......o.....^^',
    '...........:::::::::',
    '.....o.....:........',
    '^^.........:....o.^^',
    '^^^...o....:......^^',
    '^^^^^......:...^^^^^',
    '^^^^^^^^^.:^^^^^^^^^',
  ],
  enemies: [
    { kind: 'thornback', column: 8, row: 5 },
    { kind: 'pebblenose', column: 14, row: 3 },
  ],
};

/** Old Fennick lives in the cave up here. */
const HERMITS_RISE: RoomDefinition = {
  name: "Hermit's Rise",
  tiles: [
    '^^^^^^^^^:.^^^^^^^^^',
    '^^^^^....:....^^^^^^',
    '^^^......:....^^C^^^',
    '^^.......::::::::.^^',
    '.........:......o.^^',
    '.........:........^^',
    '^^...o...:........^^',
    '^^.......:....o...^^',
    '^^^^.....:.....^^^^^',
    '^^^^^^^^^:.^^^^^^^^^',
  ],
  doors: [{ column: 16, row: 2, to: insideOf('hermitCave') }],
  enemies: [{ kind: 'thornback', column: 12, row: 6 }],
};

const WEST_MEADOW: RoomDefinition = {
  name: 'West Meadow',
  tiles: [
    'TTTTTTTTT:.TTTTTTTTT',
    'TT.......:.........T',
    'T...,....:...b.....T',
    'T....,...:.........T',
    'T........::::::::::.',
    'T....b..............',
    'T...,.......,......T',
    'T.........o........T',
    'TT.......:.........T',
    'TTTTTTTTT:.TTTTTTTTT',
  ],
  enemies: [
    { kind: 'blub', column: 14, row: 6 },
    { kind: 'flitter', column: 4, row: 7 },
  ],
};

/** The edge of the village: the back of a cottage, and a signpost. */
const EMBERFEN_WEST: RoomDefinition = {
  name: 'Emberfen West',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTT',
    'TT.....,.....,....TT',
    'T...RRRRR....,....TT',
    'T...HHHHH.........TT',
    '.......:::::::::::::',
    '::::::::....,.......',
    'T..S.....:.........T',
    'T..,.....:...b.....T',
    'TT.......:.........T',
    'TTTTTTTTT:.TTTTTTTTT',
  ],
  signs: [{ column: 3, row: 6, text: 'West: the meadow and the woods. South: the bridge over the lake.' }],
};

/** Wren's village: Gran's house on the left, Pim's shop on the right. The adventure starts here. */
const EMBERFEN: RoomDefinition = {
  name: 'Emberfen',
  tiles: [
    'TTTTTTTTT:.TTTTTTTTT',
    'T.RRRRR..:...RRRRR.T',
    'T.RRRRR..:...RRRRR.T',
    'T.HHhHH..:...HHhHH.T',
    '::::::::::::::::::::',
    '.........:..........',
    'T..,.....:....S....T',
    'T.....,..:.......,.T',
    'T..,.....:.....,...T',
    'TTTTTTTTT:.TTTTTTTTT',
  ],
  doors: [
    { column: 4, row: 3, to: insideOf('granHouse') },
    { column: 15, row: 3, to: insideOf('shop') },
  ],
  people: [{ who: 'bree', column: 6, row: 6 }],
  signs: [{ column: 14, row: 6, text: "Emberfen. Gran Maudie's house is on the left, and Pim's shop on the right." }],
};

const EMBERFEN_EAST: RoomDefinition = {
  name: 'Emberfen East',
  tiles: [
    'TTTTTTTTT.:TTTTTTTTT',
    'T.........:.RRRR...T',
    'T..RRRR...:.RRRR...T',
    'T..HHHH...:.HHHH...T',
    '::::::::::::::::::::',
    '..........:.........',
    'T....,....:....,...T',
    'T..b......:......b.T',
    'T.........:........T',
    'TTTTTTTTT.:TTTTTTTTT',
  ],
};

const EASTERN_HILLS: RoomDefinition = {
  name: 'Eastern Hills',
  tiles: [
    '^^^^^^^^^:.^^^^^^^^^',
    '^^.......:......o.^^',
    '^^..o....:........^^',
    '^^.......:....o...^^',
    '.........:........^^',
    '.........:.....o..^^',
    '^^..o....:........^^',
    '^^.......:...o....^^',
    '^^^......:.......^^^',
    '^^^^^^^^^:.^^^^^^^^^',
  ],
  enemies: [
    { kind: 'thornback', column: 6, row: 4 },
    { kind: 'pebblenose', column: 13, row: 2 },
  ],
};

/** Reeds and sand at the lake's west end. Tolly's grandad hid his savings by the stump. */
const REED_SHORE: RoomDefinition = {
  name: 'Reed Shore',
  tiles: [
    'TTTTTTTTT:.TTTTTTTTT',
    'TT.......:.....sswww',
    'TT..,....:....sswwww',
    'T.......::...sswwwww',
    'T....,....:sssssssss',
    'T........:.sssssssss',
    'T..b.......sswwwwwww',
    'TT..u.....sswwwwwwww',
    'TTT.....ssswwwwwwwww',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  enemies: [{ kind: 'flitter', column: 15, row: 7 }],
  hidden: [{ id: 'reed-shore-stump', column: 4, row: 7, drop: { kind: 'gem', value: 20 } }],
};

/** The lake, crossed by a sandbar, with the Sunken Vault's way in on its island. */
const SUNKEN_LAKE: RoomDefinition = {
  name: 'Sunken Lake',
  tiles: [
    'wwwwwwwww==wwwwwwwww',
    'wwwwwwwww==wwwwwwwww',
    'wwwwwwwww==wwwwwwwww',
    'wwwwwwwww==wwwwwwwww',
    'ssssssssssssssssssss',
    'ssssssssssssssssssss',
    'wwwwwwwww==wwwwwwwww',
    'wwwwwwwsss##D##wwwww',
    'wwwwwwwssssssssswwww',
    'wwwwwwwwwwwwwwwwwwww',
  ],
  doors: [{ column: 12, row: 7, to: insideOf('vaultHall') }],
  enemies: [
    { kind: 'flitter', column: 4, row: 2 },
    { kind: 'pebblenose', column: 15, row: 4 },
  ],
};

/** Tolly fishes here, where the path from the village meets the water. */
const LAKE_BANK: RoomDefinition = {
  name: 'Lake Bank',
  tiles: [
    'TTTTTTTTT:.TTTTTTTTT',
    'wwwwsss..:.......TTT',
    'wwwwwss..:....,...TT',
    'wwwwwss..:........TT',
    'sssssss..:::::::::::',
    'ssssss...:..........',
    'wwwwwss...........TT',
    'wwwwwwss.....o....TT',
    'wwwwwwwss.......TTTT',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  people: [{ who: 'tolly', column: 6, row: 2 }],
  enemies: [{ kind: 'blub', column: 13, row: 6 }],
};

const SOUTHERN_FIELDS: RoomDefinition = {
  name: 'Southern Fields',
  tiles: [
    'TTTTTTTTT.:TTTTTTTTT',
    'TT.......:.......,TT',
    'T...,....:...u.....T',
    'T........:.........T',
    '.........:..........',
    '::::::::::::::::::::',
    'T....b.......,.....T',
    'T..,.........b.....T',
    'TT..........,.....TT',
    'TTTTTTTTTTTTTTTTTTTT',
  ],
  enemies: [
    { kind: 'blub', column: 5, row: 3 },
    { kind: 'thornback', column: 15, row: 7 },
  ],
  hidden: [{ id: 'south-fields-stump', column: 13, row: 2, drop: { kind: 'gem', value: 5 } }],
};

/** A cracked cliff hides a cave with a heart container and gems. */
const CLIFF_COAST: RoomDefinition = {
  name: 'Cliff Coast',
  tiles: [
    '^^^^^^^^^:.^^^^^^^^^',
    '^^^......:......^^^^',
    '^^.......:......^%^^',
    '^^.......:........o^',
    '.........:.........^',
    '....o....:.........^',
    '^^.......:.....o...^',
    '^^^......sssss.....^',
    '^^^^sssssswwwwssss^^',
    '^^^^wwwwwwwwwwwwww^^',
  ],
  secrets: [{ id: 'cliff-coast-cave', column: 17, row: 2, to: insideOf('coastCave') }],
  enemies: [
    { kind: 'pebblenose', column: 6, row: 6 },
    { kind: 'flitter', column: 12, row: 8 },
  ],
};

export const OVERWORLD: Area = {
  kind: 'overworld',
  screens: [
    [DEEP_WOOD, MOSSROOT_HOLLOW, OLD_PASS, SPIRE_GATE, FROST_RIDGE],
    [WOOD_EDGE, FOREST_PATH, NORTH_ROAD, STONE_HILLS, HERMITS_RISE],
    [WEST_MEADOW, EMBERFEN_WEST, EMBERFEN, EMBERFEN_EAST, EASTERN_HILLS],
    [REED_SHORE, SUNKEN_LAKE, LAKE_BANK, SOUTHERN_FIELDS, CLIFF_COAST],
  ],
};

/** A new game starts in the middle of Emberfen. */
export const START: WorldSpot = { area: 'overworld', column: 2, row: 2, cell: { column: 10, row: 5 } };
