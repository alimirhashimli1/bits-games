import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { SABLE_POSES, SABLE_SPECIAL_POSES } from './sablePoses';

/**
 * Sable: a deep hood over a face of shadow with one cold light where the eye should be, a long
 * dark cloak over charcoal wraps, bound forearms and soft dark boots. Symbols: o outline,
 * h hood, s/S shadowed face, k eye-light, c/C cloak, b sash, w/W wraps, p/P leggings, f/F boots.
 * Upper-case symbols are the shaded far side.
 */
export const SABLE_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..hhhhhh..',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      'hhhhhhhhhh',
      'hhhssssshh',
      'hhsssskssh',
      'hhssssssSh',
      '.hSsssssSh',
      '.hhSsssShh',
      '..hhhhhhh.',
      '...hhhhh..',
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
      fist: 'w',
      fistShade: 'W',
      foot: 'f',
      footShade: 'F',
    },
    cape: { symbol: 'C', length: 16, spread: 13 },
    outline: 'o',
  },
  poses: SABLE_POSES,
  specialPoses: SABLE_SPECIAL_POSES,
  palette: {
    o: '#0a0810',
    h: '#241e38',
    s: '#4a4260',
    S: '#332c48',
    k: '#8ae0f0',
    c: '#2e2746',
    C: '#1c1830',
    b: '#5a4a7a',
    w: '#3a3252',
    W: '#282240',
    p: '#221e34',
    P: '#161326',
    f: '#181426',
    F: '#100d1c',
  },
};
