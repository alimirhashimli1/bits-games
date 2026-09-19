import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { TALA_POSES, TALA_SPECIAL_POSES } from './talaPoses';

/**
 * Tala: a dark ponytail and a gold headband, a teal top, bare arms, flowing orange trousers
 * with a gold sash, and bare feet. Slimmer than Brand. Symbols: o outline, h hair, g headband,
 * s/S skin, k eye, t/T top, p/P trousers, a sash. Upper-case symbols are the shaded far side.
 */
export const TALA_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '...hhhh...',
      '.hhhhhhh..',
      'ggggggggg.',
      'hhhhhsssss',
      'hhhhssskss',
      'hhhhssskss',
      'hh..ssssss',
      'hh..sssss.',
      'h....ssss.',
      'h....sks..',
      '......ss..',
    ],
    thickness: { torso: 8, upperArm: 4, forearm: 3, fist: 4, leg: 5 },
    symbols: {
      cloth: 't',
      clothShade: 'T',
      skin: 's',
      skinShade: 'S',
      belt: 'a',
      sleeve: 's',
      sleeveShade: 'S',
      legs: 'p',
      legsShade: 'P',
    },
    outline: 'o',
  },
  poses: TALA_POSES,
  specialPoses: TALA_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#1c1410',
    g: '#f2c14e',
    s: '#c68642',
    S: '#8d5a2b',
    k: '#1a1216',
    t: '#1f9e8f',
    T: '#136b61',
    p: '#e0703a',
    P: '#a34d22',
    a: '#f2c14e',
  },
};
