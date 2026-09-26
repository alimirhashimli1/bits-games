import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { MOON } from '../backgrounds';
import type { Ending } from './ending';

/** A domed observatory on a mesa, its slit open and the telescope pointing up. */
const OBSERVATORY: PixelMap = [
  '................kkkkkkkk................',
  '..............kkwkkkkkkwkk..............',
  '............kkwwwkkggkkwwWkk............',
  '...........kwwwwwkkggkkwwWWWk...........',
  '..........kwwwwwwkkggkkwwWWWWk..........',
  '.........kwwwwwwwkkggkkwwWWWWWk.........',
  '.........kwwwwwwwkkggkkwwWWWWWk.........',
  '........kwwwwwwwwkggggkwwWWWWWWk........',
  '........kwwwwwwwwkggggkwwWWWWWWk........',
  '.......kwwwwwwwwwkkkkkkwwWWWWWWWk.......',
  '.......kwwwwwwwwwkkkkkkwwWWWWWWWk.......',
  '.......kwwwwwwwwwkkkkkkwwWWWWWWWk.......',
  '.......kwwwwwwwwwkkkkkkwwWWWWWWWk.......',
  '.....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.....',
  '......sssssssssssssssssssssSSSSSSS......',
  '......sssssssssssssssssssssSSSSSSS......',
  '......sssssssssssssssssssssSSSSSSS......',
  '......SSSSSSSSSSSSSSSSSSSSSkkkkkkk......',
  '......sssyyssssssssssssssssSSyySSS......',
  '......sssyyssssssssssssssssSSyySSS......',
  '......sssyyssssssssssssssssSSyySSS......',
  '......SSSSSSSSSSSSSSSSSSSSSkkkkkkk......',
  '......sssssssssssssssssssssSSSSSSS......',
  '......sssssssssssssssssssssSSSSSSS......',
  '......sssssssssssssssssssssSSSSSSS......',
  '......SSSSSSSSSSSddddddSSSSkkkkkkk......',
  '......sssssssssssdyyyydssssSSSSSSS......',
  '......sssssssssssdyyyydssssSSSSSSS......',
  '......sssssssssssdyyyydssssSSSSSSS......',
  '......SSSSSSSSSSSdyyyydSSSSkkkkkkk......',
  '......sssssssssssdyyyydssssSSSSSSS......',
  '......sssssssssssdyyyydssssSSSSSSS......',
  '......sssssssssssdyyyydssssSSSSSSS......',
  '...ssssssssssssssssssssssssssssssssss...',
  '...SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS...',
];

/** Redrock Desert leads here: the desert at night, under a sky full of stars. */
export const STAR_OBSERVATORY_ENDING: Ending = {
  sky: ['#0a0a24', '#121236', '#1c1a48', '#2a2458', '#3e2e66', '#5a3a6e'],
  background: [
    { kind: 'stars', speed: 0, count: 160, colors: ['#f4f4f4', '#ffe8a0', '#a8c8ff'], seed: 31 },
    { kind: 'sprites', speed: 0, palette: { m: '#f0ecd8', M: '#c8c0a8' }, sprites: [{ map: MOON, x: 284, y: 22 }] },
    {
      kind: 'ridge',
      speed: 0,
      color: '#2a1630',
      baseHeight: 10,
      maxHeight: 22,
      waves: [
        { amplitude: 14, cycles: 3, phase: 2.4 },
        { amplitude: 3, cycles: 11, phase: 0.3 },
      ],
    },
  ],
  ground: '#5a3024',
  road: '#3a3440',
  roadEdge: '#8a4a36',
  roadLine: '#e8d8a0',
  landmark: {
    map: OBSERVATORY,
    palette: {
      w: '#e8e8f4',
      W: '#a8a8c4',
      k: '#1b1b22',
      g: '#6a6a80',
      s: '#9a6a52',
      S: '#6e4a3a',
      y: '#ffd23f',
      d: '#3a2a22',
    },
  },
  story: ['THE DOME OPENS AS YOU PULL IN.', 'TONIGHT THE STARS ARE ALL YOURS.'],
};
