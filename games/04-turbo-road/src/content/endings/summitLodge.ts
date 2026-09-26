import type { PixelMap } from '@shared/pixel-art/pixelMap';

import type { Ending } from './ending';

/** An A-frame lodge with a snowy roof, a wall of lit glass and smoke from the chimney. */
const LODGE: PixelMap = [
  '.................................m..........',
  '................................m...........',
  '...................kwwwwk......m............',
  '....................kwwk.......kkk..........',
  '...................wwkkww......SSS..........',
  '..................wwwkkwww.....SSS..........',
  '.................wwwkbbkwww....SSS..........',
  '................wwwkbbbbkwww...SSS..........',
  '...............wwwkbbbbbbkwww..SSS..........',
  '..............wwwkbbbBBbbbkwww.SSS..........',
  '.............wwwkbbbbBBbbbbkwwwSSS..........',
  '............wwwkbbbbyBBybbbbkwwwSS..........',
  '...........wwwkbbbbbyBBybbbbbkwwwS..........',
  '..........wwwkbbbbbBBBBBBbbbbbkwww..........',
  '.........wwwkbbbbbbyyBByybbbbbbkwww.........',
  '........wwwkbbbbbbByyBByyBbbbbbbkwww........',
  '.......wwwkbbbbbbbByyBByyBbbbbbbbkwww.......',
  '......wwwkbbbbbbbBBBBBBBBBBbbbbbbbkwww......',
  '.....wwwkbbbbbbbbyByyBByyBybbbbbbbbkwww.....',
  '....wwwkbbbbbbbbyyByyBByyByybbbbbbbbkwww....',
  '...wwwkbbbbbbbbbyyByyBByyByybbbbbbbbbkwww...',
  '..wwwkbbbbbbbbbBBBBBBBBBBBBBBbbbbbbbbbkwww..',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  '..BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB..',
  '..bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..',
  '..BBBkkkkkkkBBBBBBBkkkkkkBBBBBBBkkkkkkkBBB..',
  '..bbbkyykyykbbbbbbbkddddkbbbbbbbkyykyykbbb..',
  '..BBBkyykyykBBBBBBBkddddkBBBBBBBkyykyykBBB..',
  '..bbbkyykyykbbbbbbbkddddkbbbbbbbkyykyykbbb..',
  '..BBBkkkkkkkBBBBBBBkddddkBBBBBBBkkkkkkkBBB..',
  '..bbbbbbbbbbbbbbbbbkddydkbbbbbbbbbbbbbbbbb..',
  '..BBBBBBBBBBBBBBBBBkddddkBBBBBBBBBBBBBBBBB..',
  '..bbbbbbbbbbbbbbbbbkddddkbbbbbbbbbbbbbbbbb..',
  '..BwwBBBBwBBBBwwBBBkddddkBBBwwBBBBBBBBwwwB..',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
];

/** Pinewood Pass leads here: the top of the pass at dusk, deep in snow. */
export const SUMMIT_LODGE_ENDING: Ending = {
  sky: ['#2a2458', '#4a3070', '#7a3e7a', '#b0527a', '#e0766a', '#f4a070'],
  background: [
    {
      kind: 'ridge',
      speed: 0,
      color: '#5a4a7a',
      baseHeight: 24,
      cap: { color: '#e8e0f0', from: 30 },
      waves: [
        { amplitude: 14, cycles: 2, phase: 1.9 },
        { amplitude: 6, cycles: 7, phase: 0.4 },
      ],
    },
    {
      kind: 'ridge',
      speed: 0,
      color: '#1e3a34',
      baseHeight: 6,
      waves: [
        { amplitude: 3, cycles: 4, phase: 1.2 },
        { amplitude: 2, cycles: 90, phase: 0 },
      ],
    },
  ],
  ground: '#e4ecf6',
  road: '#5a5a6a',
  roadEdge: '#b8c4d8',
  roadLine: '#f4f4f4',
  landmark: {
    map: LODGE,
    palette: {
      w: '#f4f8ff',
      b: '#8a5a32',
      B: '#6a4024',
      k: '#2a1a14',
      y: '#ffc850',
      d: '#4a2a18',
      S: '#7a7a86',
      m: '#c8ccd8',
    },
  },
  story: ['A LOG FIRE AND HOT COCOA WAIT', 'AT THE TOP OF THE WORLD.'],
};
