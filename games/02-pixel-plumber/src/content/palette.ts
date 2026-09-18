/** Every colour used in Pixel Plumber's pixel art, so all sprites look like one game. */
export const ART_COLORS = {
  outline: '#1b1b22',

  cobbleLight: '#c8b8a4',
  cobble: '#9c8a78',
  cobbleShade: '#6e5e50',
  cobbleMortar: '#3e3028',

  brickLight: '#e8905a',
  brick: '#b5532d',
  brickShade: '#7e3418',
  brickMortar: '#3a160a',

  questionLight: '#ffe08a',
  question: '#f0b030',
  questionShade: '#a0601c',

  usedLight: '#b08060',
  used: '#7a5238',
  usedShade: '#4e3222',

  stairLight: '#d8c8b0',
  stair: '#a08c70',
  stairShade: '#5e4e3a',

  brassLight: '#f2d27a',
  brass: '#c9912e',
  brassShade: '#7a5218',

  cloud: '#ffffff',
  cloudShade: '#bcd4fc',

  bushLight: '#8ce05a',
  bush: '#4aa83a',
  bushShade: '#2a6e2a',

  /** World 2, the sewers: wet stone, brick gone blue underground, algae and dim steam. */
  sewerStoneLight: '#8ea0ac',
  sewerStone: '#5c6e7c',
  sewerStoneShade: '#3a4854',
  sewerStoneMortar: '#20262e',

  sewerBrickLight: '#7d8ad4',
  sewerBrick: '#4a56a4',
  sewerBrickShade: '#2b3370',
  sewerBrickMortar: '#161a34',

  sewerBlockLight: '#c0ccd4',
  sewerBlock: '#84939f',
  sewerBlockShade: '#4c5a66',

  sewerSteam: '#6e808c',
  sewerSteamShade: '#4a5a66',

  algaeLight: '#7fae4a',
  algae: '#4c7a2c',
  algaeShade: '#2c4a1c',

  /** World 3, the rooftops at dusk: slate, chimney brick, warm stone and pink evening cloud. */
  slateLight: '#a4a4cc',
  slate: '#6e6e9a',
  slateShade: '#4a4a72',
  slateMortar: '#26243e',

  chimneyLight: '#e0906e',
  chimney: '#a84e3c',
  chimneyShade: '#6e2c24',
  chimneyMortar: '#2e1410',

  chimneyStoneLight: '#dcc4b0',
  chimneyStone: '#a48a78',
  chimneyStoneShade: '#644e44',

  duskCloud: '#f4c4d4',
  duskCloudShade: '#c08aac',

  planterLight: '#7cc05a',
  planter: '#3e8e44',
  planterShade: '#245a30',

  rustyCap: '#5a3a28',
  rustyCapLight: '#8a5e40',
  rustyBeard: '#d8662a',
  rustySkin: '#f0b88a',
  rustyShirt: '#2e9a9a',
  rustyOveralls: '#c8a860',
  rustyBoots: '#4a2c1c',

  /** Steam Rusty: a white shirt and red overalls. */
  steamShirt: '#eef2f6',
  steamOveralls: '#c0392b',

  valveLight: '#ff7a5c',
  valve: '#d23a2a',
  valveShade: '#7e1c14',

  steamLight: '#ffffff',
  steam: '#cfe0ee',
  steamShade: '#8aa6bc',

  /** Gloop, the Sludge Baron's walking slime. */
  gloopLight: '#b6f05a',
  gloop: '#7fbe2a',
  gloopShade: '#4a7a1a',

  /** A Shellbug's copper shell, and the beetle underneath it. */
  shellLight: '#f0a050',
  shell: '#c05a1e',
  shellShade: '#7a3410',
  bugBody: '#5a4a62',

  /** A Spark's flame. */
  flameLight: '#fff3b0',
  flame: '#ff9a3c',
  flameShade: '#d2402a',

  steelLight: '#e4eaf0',
  steel: '#a8b4c0',
  steelShade: '#5e6a78',
  gripLight: '#7cfc9a',
  grip: '#2e9a4a',
} as const;
