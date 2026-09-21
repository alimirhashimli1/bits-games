import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { RAJAB_POSES, RAJAB_SPECIAL_POSES } from './rajabPoses';

/**
 * Rajab: slicked-back black hair and a clean-shaven face, a burgundy waistcoat over a white shirt
 * with the sleeves showing, black suit trousers and polished black shoes. Slimmer than Brand.
 * Symbols: o outline, h hair, s/S skin, k eye, c/C waistcoat, w/W shirt sleeves, b belt,
 * p/P trousers, f/F shoes. Upper-case symbols are the shaded far side.
 */
export const RAJAB_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..hhhhh...',
      '.hhhhhhhh.',
      'hhhhhhhhhs',
      'hhhhhsssss',
      'hhhhssskss',
      '.hhSssskss',
      '.hSsssssss',
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
      sleeve: 'w',
      sleeveShade: 'W',
      legs: 'p',
      legsShade: 'P',
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: RAJAB_POSES,
  specialPoses: RAJAB_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#0e0c10',
    s: '#d8a07a',
    S: '#9a6a48',
    k: '#1a1216',
    c: '#7a1e2c',
    C: '#4e121c',
    w: '#f0ece4',
    W: '#b8b4ac',
    b: '#1a1216',
    p: '#26262e',
    P: '#16161c',
    f: '#1e1e24',
    F: '#0c0c10',
  },
};
