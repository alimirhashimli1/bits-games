import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { OSAL_POSES, OSAL_SPECIAL_POSES } from './osalPoses';

/**
 * Osal: a dark green beret over short hair and a few days' stubble, an olive field jacket,
 * khaki trousers and black combat boots. A little sturdier than Brand, and the only one who
 * brings kit to the fight: a rifle and a grenade, drawn as held props in his special poses.
 * Symbols: o outline, r beret, h hair, s/S skin, k eye, c/C jacket, b belt, p/P trousers,
 * f/F boots, g gunmetal, n rifle stock, y/Y muzzle flash, v grenade. Upper-case symbols are
 * the shaded far side, except Y, the hottest part of the flash.
 */
export const OSAL_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..rrrrr...',
      '.rrrrrrrr.',
      'rrrrrrrrrr',
      'hhhhhsssss',
      'hhhhssskss',
      'hhhSssskss',
      '.hSsssssss',
      '..SssSSss.',
      '..sSSSSss.',
      '...sssss..',
      '....sss...',
    ],
    thickness: { torso: 11, upperArm: 5, forearm: 5, fist: 5, leg: 6 },
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
    outline: 'o',
  },
  poses: OSAL_POSES,
  specialPoses: OSAL_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    r: '#2e4a2a',
    h: '#2a1e16',
    s: '#b87a52',
    S: '#7e5234',
    k: '#1a1216',
    c: '#6a6a3a',
    C: '#48482a',
    b: '#2a2418',
    p: '#8a7a52',
    P: '#5e5238',
    f: '#1a1612',
    F: '#0e0c0a',
    g: '#4a4a52',
    n: '#5a3f28',
    y: '#ffb03a',
    Y: '#fff3b0',
    v: '#4a6a3a',
  },
};
