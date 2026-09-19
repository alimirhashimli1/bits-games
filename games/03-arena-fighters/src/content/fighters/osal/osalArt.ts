import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { OSAL_POSES, OSAL_SPECIAL_POSES } from './osalPoses';

/**
 * Osal: a dark green beret over short hair and a few days' stubble, an olive field jacket,
 * khaki trousers and black combat boots. A little sturdier than Brand. Symbols: o outline,
 * r beret, h hair, s/S skin, k eye, c/C jacket, b belt, p/P trousers, f/F boots. Upper-case
 * symbols are the shaded far side.
 */
export const OSAL_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..rrrrr...',
      '.rrrrrrrr.',
      'rrrrrrrrrr',
      'hhhhhsssss',
      'hhhhssskss',
      'hhhSssskss',
      '.hSsssssss',
      '..SssSSss.',
      '..sSSSSss.',
      '...sssss..',
      '....sss...',
    ],
    thickness: { torso: 11, upperArm: 5, forearm: 5, fist: 5, leg: 6 },
    symbols: {
      cloth: 'c',
      clothShade: 'C',
      skin: 's',
      skinShade: 'S',
      belt: 'b',
      legs: 'p',
      legsShade: 'P',
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: OSAL_POSES,
  specialPoses: OSAL_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    r: '#2e4a2a',
    h: '#2a1e16',
    s: '#b87a52',
    S: '#7e5234',
    k: '#1a1216',
    c: '#6a6a3a',
    C: '#48482a',
    b: '#2a2418',
    p: '#8a7a52',
    P: '#5e5238',
    f: '#1a1612',
    F: '#0e0c0a',
  },
};
