import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { GROM_POSES, GROM_SPECIAL_POSES } from './gromPoses';

/**
 * Grom: a bald, bearded giant with a heavy brow, an olive wrestling singlet with a wide
 * leather belt, bare arms with leather wrist wraps, a miner's brown trousers and iron-grey
 * boots. Much thicker than Brand everywhere. Symbols: o outline, h beard, s/S skin, k eye, c/C singlet,
 * b belt, w/W wraps, p/P trousers, f/F boots. Upper-case symbols are the shaded far side.
 */
export const GROM_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '...sssss....',
      '..sssssssS..',
      '.sssssssssS.',
      '.Sssssssssss',
      '.SSssshhhhs.',
      '.SSSsssskss.',
      '.SSssssssss.',
      '..SShhhhhsss',
      '..Shhhhhhhh.',
      '..hhhhhhhhh.',
      '...hhhhhhh..',
      '....hhhhh...',
      '.....hhh....',
    ],
    thickness: { torso: 15, upperArm: 7, forearm: 6, fist: 7, leg: 7 },
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
  poses: GROM_POSES,
  specialPoses: GROM_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#4a2a1a',
    s: '#c9855a',
    S: '#8f5536',
    k: '#1a1216',
    c: '#6f7d32',
    C: '#48531e',
    b: '#2e1e14',
    w: '#7a4a2a',
    W: '#553220',
    p: '#5c4634',
    P: '#3d2e22',
    f: '#5c5f6a',
    F: '#3b3d46',
  },
};
