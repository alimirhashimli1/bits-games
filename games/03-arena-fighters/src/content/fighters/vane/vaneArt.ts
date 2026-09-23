import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { VANE_POSES, VANE_SPECIAL_POSES } from './vanePoses';

/**
 * Magnus Vane, host of the Iron Crown: the iron crown itself on swept-back grey hair, a trimmed
 * grey beard, a bone-white coat with gold at the belt, black gauntlets, dark trousers and heavy
 * boots, under a long crimson mantle. Nobody on the roster wears anything like it, which is the
 * point: he is not one of the fighters, he is the man they have all come for.
 *
 * Symbols: o outline, n/N crown gold, j crown stone, h hair and beard, s/S skin, k eye,
 * c/C coat, b belt, w/W gauntlets, p/P trousers, f/F boots, m mantle.
 * Upper-case symbols are the shaded far side.
 */
export const VANE_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      '.n.n.n.n.n..',
      '.nnnnnnnnn..',
      '.nNjnnnjNn..',
      '.hhhhhhhhh..',
      'hhhhhhhhhhh.',
      'hhhssssssss.',
      '.hhssssksss.',
      '.hhsssssssS.',
      '.hhhsssssS..',
      '..hhsssssS..',
      '..hhhsssS...',
      '...hhhhh....',
      '....hhh.....',
    ],
    thickness: { torso: 12, upperArm: 5, forearm: 5, fist: 5, leg: 6 },
    symbols: {
      cloth: 'c',
      clothShade: 'C',
      // His sleeves run the whole length of the arm, so the forearms take the coat's colours too.
      // Only the forearms read the skin symbols; his face keeps its own from the head map above.
      skin: 'c',
      skinShade: 'C',
      belt: 'b',
      sleeve: 'c',
      sleeveShade: 'C',
      legs: 'p',
      legsShade: 'P',
      fist: 'w',
      fistShade: 'W',
      foot: 'f',
      footShade: 'F',
    },
    cape: { symbol: 'm', length: 24, spread: 24 },
    outline: 'o',
  },
  poses: VANE_POSES,
  specialPoses: VANE_SPECIAL_POSES,
  palette: {
    o: '#0c0a12',
    n: '#f0cc60',
    N: '#a07c28',
    j: '#c83a4a',
    h: '#9aa0b0',
    s: '#d8b090',
    S: '#a87c5c',
    k: '#cfe4ff',
    c: '#e8e4d8',
    C: '#b0aca0',
    b: '#e8c860',
    w: '#2a2e40',
    W: '#1c2030',
    p: '#3a3348',
    P: '#282234',
    f: '#1a1826',
    F: '#100e18',
    m: '#6a1a2a',
  },
};
