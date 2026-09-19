import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { MAHMOOD_POSES, MAHMOOD_SPECIAL_POSES } from './mahmoodPoses';

/**
 * Mahmood: short black hair and a trimmed beard, a blue track top with long sleeves, black
 * trousers and white trainers. He has one hand: his far arm ends at the wrist. Brand's build.
 * Symbols: o outline, h hair, s/S skin, k eye, c/C top, b waistband, p/P trousers, f/F
 * trainers. Upper-case symbols are the shaded far side.
 */
export const MAHMOOD_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '...hhhh...',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      'hhhhhsssss',
      'hhhhssskss',
      'hhhSssskss',
      'hhSsssssss',
      '.hSshhhhs.',
      '..hhhhhhh.',
      '...hhhhh..',
      '....hhh...',
    ],
    thickness: { torso: 10, upperArm: 5, forearm: 4, fist: 5, leg: 6 },
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
    missingHand: 'far',
    outline: 'o',
  },
  poses: MAHMOOD_POSES,
  specialPoses: MAHMOOD_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#1a1412',
    s: '#c8906a',
    S: '#8e5e40',
    k: '#1a1216',
    c: '#2f6a8a',
    C: '#1f4658',
    b: '#1a1a20',
    p: '#2a2a32',
    P: '#18181e',
    f: '#ececf0',
    F: '#a8a8b4',
  },
};
