import type { LevelMap } from '../../systems/levelLoader';

/**
 * The coin room under the test street, reached by going down the pipe in the middle of it.
 * Rooms are ordinary level maps with no pole to finish on: the pipe in the corner leads back
 * up to the street. See `tileLegend.ts` for what each character means.
 */
export const TEST_ROOM: LevelMap = [
  '####################',
  '#..................#',
  '#...@..............#',
  '#..................#',
  '#...oooooooo.......#',
  '#...oooooooo.......#',
  '#...oooooooo.......#',
  '#................D]#',
  '#................{}#',
  '####################',
  '####################',
  '####################',
];
