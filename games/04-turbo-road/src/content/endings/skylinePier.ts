import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { MOON } from '../backgrounds';
import type { Ending } from './ending';

/** A big wheel ringed with lights, at the end of the pier. */
const FERRIS_WHEEL: PixelMap = [
  '................ypyyppypp................',
  '..............pyy...m...pyp..............',
  '............yccc....m....cccy............',
  '...........ppccc....m....cccyp...........',
  '..........y.........m.........y..........',
  '.........pm.........m.........mp.........',
  '........y..m........m........m..y........',
  '.......pp...m.......m.......m...yp.......',
  '.......y.....m......m......m.....p.......',
  '......y.......m.....m.....m.......y......',
  '.....ccc.......m....m....m.......ccc.....',
  '.....ccc........m...m...m........ccc.....',
  '.....y...........m..m..m...........y.....',
  '.....p............m.m.m............p.....',
  '.....y.............yyy.............p.....',
  '.....ymmmmmmmmmmmmmyyymmmmmmmmmmmmmy.....',
  '.....p.............yyy.............y.....',
  '.....p............mkkkm............p.....',
  '.....y...........mkkmkkm...........y.....',
  '.....pp.........m.kkmkk.m.........yy.....',
  '......p........m.kk.m.kk.m........p......',
  '......y.......m..kk.m.kk..m.......y......',
  '.....ccc.....m..kk..m..kk..m.....ccc.....',
  '.....cccy...m...kk..m..kk...m...pccc.....',
  '........y..m...kk...m...kk...m..y........',
  '.........pm....kk...m...kk....mp.........',
  '..........y...kk....m....kk...y..........',
  '...........py.kk....m....kk.pp...........',
  '............yyk.....m.....kyy............',
  '.............kpyp...m...yypk.............',
  '............kcccppyppyypyccck............',
  '............kccc.........ccck............',
  '...........kk...............kk...........',
  '...........kk...............kk...........',
  '..........kk.................kk..........',
  'y...y...y.kky...y...y...y...ykk.y...y...y',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  '..B.....B.....B.....B.....B.....B.....B..',
  '..B.....B.....B.....B.....B.....B.....B..',
];

/** Neon Boulevard leads here: out over the bay at night, the city lit up behind. */
export const SKYLINE_PIER_ENDING: Ending = {
  sky: ['#050818', '#0a1030', '#101a44', '#182858', '#22386a', '#304a7a'],
  background: [
    { kind: 'stars', speed: 0, count: 70, colors: ['#f4f4f4', '#a8c8ff'], seed: 47 },
    { kind: 'sprites', speed: 0, palette: { m: '#f0ecd8', M: '#c8c0a8' }, sprites: [{ map: MOON, x: 40, y: 8 }] },
    {
      kind: 'skyline',
      speed: 0,
      color: '#101828',
      width: { min: 10, max: 22 },
      height: { min: 8, max: 30 },
      litShare: 0.35,
      windowColors: ['#ffd23f', '#ff5aa8', '#3ad0e0'],
      seed: 12,
    },
  ],
  ground: '#12305a',
  road: '#7a5234',
  roadEdge: '#4a3020',
  roadLine: '#ffd23f',
  landmark: {
    map: FERRIS_WHEEL,
    palette: {
      y: '#ffd23f',
      p: '#ff5aa8',
      m: '#8a8aa8',
      c: '#3ad0e0',
      k: '#2a2a3a',
      b: '#7a5234',
      B: '#4a3020',
    },
  },
  story: ['THE WHEEL LIGHTS UP FOR YOU.', 'THE PARTY ON THE PIER RUNS TILL DAWN.'],
};
