import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { NOVA_POSES, NOVA_SPECIAL_POSES } from './novaPoses';

/**
 * Nova: a short platinum crop with an electric-blue streak, a blue sleeveless kickboxing top,
 * bare arms, yellow gloves, black trousers with a slate waistband, and white boxing boots.
 * Slim, and long in the leg. Symbols: o outline, h hair, e streak, s/S skin, k eye, t/T top,
 * y/Y gloves, p/P trousers, a waistband, f/F boots. Upper-case symbols are the shaded far side.
 */
export const NOVA_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..hhhhh...',
      '.hhhhhhhh.',
      'hhheeeehhh',
      'hhhhhhhhss',
      'hhhhssssss',
      'hhhsssksss',
      'hhhsssksss',
      '.hhSssssss',
      '..hsssss..',
      '...ssks...',
      '....ss....',
    ],
    thickness: { torso: 9, upperArm: 4, forearm: 3, fist: 5, leg: 6 },
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
      fist: 'y',
      fistShade: 'Y',
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: NOVA_POSES,
  specialPoses: NOVA_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#e6e2ee',
    e: '#3ab4f2',
    s: '#f0c8a4',
    S: '#b88c6a',
    k: '#1a1216',
    t: '#2a7ad8',
    T: '#1a4e94',
    y: '#f4d03a',
    Y: '#b8961e',
    p: '#26242e',
    P: '#16151c',
    a: '#3a3450',
    f: '#eeeef4',
    F: '#a8a8b8',
  },
};
