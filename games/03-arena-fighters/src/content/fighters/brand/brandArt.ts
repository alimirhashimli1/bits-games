import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { BRAND_POSES, BRAND_SPECIAL_POSES, REACHING_KICKS } from './brandPoses';

/**
 * Brand: spiky dark hair, a sleeveless red top, bare arms with white hand wraps, blue jeans
 * and brown boots. Symbols: o outline, h hair, s/S skin, k eye, c/C top, p/P jeans, b belt,
 * w/W wraps, f/F boots. Upper-case symbols are the shaded far side.
 */
export const BRAND_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..h.h.h...',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      'hhhhhhhhhh',
      'hhhhhsssss',
      'hhhhssskss',
      '.hhhssskss',
      '.hhSssssss',
      '..hssssss.',
      '...ssskss.',
      '....ssss..',
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
      fist: 'w',
      fistShade: 'W',
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: { ...BRAND_POSES, ...REACHING_KICKS },
  specialPoses: BRAND_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#3a1f1a',
    s: '#e0a47c',
    S: '#a8704e',
    k: '#1a1216',
    c: '#d8342c',
    C: '#8e1f22',
    p: '#3f5f9e',
    P: '#2a3f6c',
    b: '#2a1a14',
    w: '#f0ece0',
    W: '#b8b2a4',
    f: '#6b4226',
    F: '#4a2c18',
  },
};
