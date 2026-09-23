import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { KNOX_POSES, KNOX_SPECIAL_POSES } from './knoxPoses';

/**
 * Knox: close-cropped black hair over a flat nose, bare to the waist, crimson boxing gloves,
 * crimson trunks with a gold waistband, and black boxing boots laced high. Built like Brand.
 * His chest is bare, so the torso takes the skin colours. Symbols: o outline, h hair, s/S skin,
 * k eye, b waistband, g/G gloves, p/P trunks and legs, f/F boots. Upper-case symbols are the
 * shaded far side.
 */
export const KNOX_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..hhhhh...',
      '.hhhhhhhh.',
      'hhhhhhhhh.',
      'hhhhhsssss',
      'hhhhssskss',
      'hhhssssssS',
      '.hSsssssss',
      '.Ssssssss.',
      '..ssssssS.',
      '..SsssssS.',
      '...sssss..',
    ],
    thickness: { torso: 11, upperArm: 5, forearm: 4, fist: 6, leg: 6 },
    symbols: {
      // Bare to the waist: the torso and arms are all skin.
      cloth: 's',
      clothShade: 'S',
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
  poses: KNOX_POSES,
  specialPoses: KNOX_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#1a1414',
    s: '#8a5a3a',
    S: '#5e3a22',
    k: '#1a1216',
    b: '#e0b840',
    g: '#c8202a',
    G: '#8a161e',
    p: '#c8202a',
    P: '#8a161e',
    f: '#1e1c20',
    F: '#121014',
  },
};
