import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { AZAR_POSES, AZAR_SPECIAL_POSES } from './azarPoses';

/**
 * Azar: neat brown hair and round glasses, a long white doctor's coat whose tails swing behind
 * him, slate trousers and brown shoes. Slim. Symbols: o outline, h hair, g glasses, s/S skin,
 * k eye, c/C coat, b coat belt, p/P trousers, f/F shoes. Upper-case symbols are the shaded far
 * side.
 */
export const AZAR_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..hhhhh...',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      'hhhhhhssss',
      'hhhhsgggg.',
      'hhhSsgkgss',
      '.hSssggsss',
      '..Sssssss.',
      '..sssssss.',
      '...sssss..',
      '....sss...',
    ],
    thickness: { torso: 9, upperArm: 4, forearm: 4, fist: 4, leg: 5 },
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
    cape: { symbol: 'C', length: 14, spread: 11 },
    outline: 'o',
  },
  poses: AZAR_POSES,
  specialPoses: AZAR_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#5a3a22',
    g: '#3a3a48',
    s: '#e8b890',
    S: '#b07c58',
    k: '#1a1216',
    c: '#ececf2',
    C: '#b4b8c6',
    b: '#c8ccd8',
    p: '#3c4658',
    P: '#262e3c',
    f: '#5a3a22',
    F: '#3a2414',
  },
};
