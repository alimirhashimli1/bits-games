import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { KANAN_POSES, KANAN_SPECIAL_POSES } from './kananPoses';

/**
 * Kanan: a red-haired powerhouse with a wild mane and a full red beard, a black vest, bare
 * arms with leather wrist bands, grey work trousers and heavy black boots. Built nearly as big
 * as Grom, but he fights upright with his fists high. Symbols: o outline, h hair, s/S skin,
 * k eye, c/C vest, b belt, w/W bands, p/P trousers, f/F boots. Upper-case symbols are the
 * shaded far side.
 */
export const KANAN_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..h.hhh.h...',
      '.hhhhhhhhh..',
      'hhhhhhhhhhh.',
      'hhhhhhsssss.',
      'hhhhhsssksss',
      'hhhhSssskss.',
      'hhhSsssssss.',
      '.hhSshhhhss.',
      '.hhhhhhhhh..',
      '..hhhhhhhh..',
      '...hhhhhh...',
      '....hhh.....',
    ],
    thickness: { torso: 14, upperArm: 7, forearm: 6, fist: 7, leg: 7 },
    symbols: {
      cloth: 'c',
      clothShade: 'C',
      skin: 's',
      skinShade: 'S',
      belt: 'b',
      sleeve: 's',
      sleeveShade: 'S',
      legs: 'p',
      legsShade: 'P',
      fist: 'w',
      fistShade: 'W',
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: KANAN_POSES,
  specialPoses: KANAN_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#c8401c',
    s: '#f0b890',
    S: '#b87c5a',
    k: '#1a1216',
    c: '#2c2c34',
    C: '#1a1a20',
    b: '#141418',
    w: '#8a5a34',
    W: '#5e3c22',
    p: '#4e5460',
    P: '#33373f',
    f: '#221c1a',
    F: '#141010',
  },
};
