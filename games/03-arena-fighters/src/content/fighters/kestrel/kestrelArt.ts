import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { KESTREL_POSES, KESTREL_SPECIAL_POSES } from './kestrelPoses';

/**
 * Kestrel: a slate-blue crest of hair swept back like feathers, a dark stripe of face paint
 * through the eye and down the cheek, a rust-red sleeveless top, bare arms, buff trousers and
 * cloth-wrapped feet. Slim and light. Symbols: o outline, h hair, m face paint, s/S skin, k eye,
 * c/C top, b sash, p/P trousers, f/F wraps. Upper-case symbols are the shaded far side.
 */
export const KESTREL_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      'hh.hhh....',
      '.hhhhhhhh.',
      'hhhhhhhhhh',
      'hhhhhhssss',
      'hhhhhsssss',
      'hhhmmmmkms',
      '.hhhsssmss',
      '.hhSsssmss',
      '..hssssss.',
      '...sssss..',
      '....sss...',
    ],
    thickness: { torso: 8, upperArm: 4, forearm: 3, fist: 4, leg: 5 },
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
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: KESTREL_POSES,
  specialPoses: KESTREL_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#5e6c8a',
    m: '#2a2230',
    s: '#d8a07a',
    S: '#9e6c4c',
    k: '#f2e6c8',
    c: '#c0602a',
    C: '#82401c',
    b: '#3a2a20',
    p: '#d8c8a0',
    P: '#a0906a',
    f: '#8a7a5a',
    F: '#5e523c',
  },
};
