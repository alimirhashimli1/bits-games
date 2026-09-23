import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { COMETA_POSES, COMETA_SPECIAL_POSES } from './cometaPoses';

/**
 * Cometa: a blue luchador mask with a silver star around the eye and a fringe of silver trim,
 * a blue singlet with a silver star on the chest, bare arms, blue tights with silver flashes and
 * silver boots. Symbols: o outline, m/M mask, a star and trim, k eye, s/S skin, c/C singlet,
 * b belt, p/P tights, f/F boots. Upper-case symbols are the shaded far side.
 */
export const COMETA_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '..mmmmm...',
      '.mmmmmmmm.',
      'mmmmmmmmmm',
      'mmmmmaaamm',
      'mmmmaakamm',
      'mmmmmaaamm',
      '.mmmmmmmmm',
      '.Mmmssssmm',
      '..Mmsssssm',
      '..aaaaaaa.',
      '...MmmmM..',
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
      foot: 'f',
      footShade: 'F',
    },
    outline: 'o',
  },
  poses: COMETA_POSES,
  specialPoses: COMETA_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    m: '#2a58c8',
    M: '#1a3a8a',
    a: '#e0e4f0',
    k: '#1a1216',
    s: '#c8885a',
    S: '#8e5c38',
    c: '#2a58c8',
    C: '#1a3a8a',
    b: '#e0e4f0',
    p: '#2246a8',
    P: '#16306e',
    f: '#e0e4f0',
    F: '#a8acbc',
  },
};
