import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { ROOK_POSES, ROOK_SPECIAL_POSES } from './rookPoses';

/**
 * Rook: a sandy crew cut over a square jaw, a navy sleeveless top with a dog tag on its chain,
 * bare arms, black fingerless gloves, grey cargo trousers and black boots. Built like Brand.
 * Symbols: o outline, h hair, s/S skin, k eye, c/C top, t dog tag, g/G gloves, b belt, p/P
 * trousers, f/F boots. Upper-case symbols are the shaded far side.
 */
export const ROOK_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '...hhhh...',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      'hhhhhhssss',
      'hhhhsssss.',
      'hhhSssskss',
      '.hSsssssss',
      '.SSssssss.',
      '.SSsssssss',
      '..sssssss.',
      '...tsss...',
    ],
    thickness: { torso: 10, upperArm: 5, forearm: 4, fist: 5, leg: 6 },
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
      fist: 'g',
      fistShade: 'G',
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: ROOK_POSES,
  specialPoses: ROOK_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#c8a860',
    s: '#e8b48c',
    S: '#b07c58',
    k: '#1a1216',
    t: '#c8ccd4',
    c: '#2a3a5e',
    C: '#1a2640',
    g: '#24222a',
    G: '#16151a',
    b: '#3a3226',
    p: '#6a6e72',
    P: '#4a4e52',
    f: '#1e1c20',
    F: '#121014',
  },
};
