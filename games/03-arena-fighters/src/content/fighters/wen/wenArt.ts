import { FIGHTER_FRAME, type FighterArt } from '../fighterArt';
import { WEN_POSES, WEN_SPECIAL_POSES } from './wenPoses';

/**
 * Old Wen: a bald head with a small grey topknot, long white eyebrows and a long white beard, a
 * saffron robe with long sleeves whose tails swing behind him, a dark sash, loose grey trousers
 * and straw sandals. Symbols: o outline, h topknot, w/W beard and brows, s/S skin, k eye, c/C
 * robe, b sash, p/P trousers, f/F sandals. Upper-case symbols are the shaded far side.
 */
export const WEN_ART: FighterArt = {
  body: {
    frameWidth: FIGHTER_FRAME.width,
    frameHeight: FIGHTER_FRAME.height,
    head: [
      'hh.ssss...',
      'hhssssssss',
      '.sssssssss',
      'Ssssssssss',
      'Ssssswwwws',
      'SssssskWss',
      '.Sssssssss',
      '.SswwwwwWs',
      '..wwwwwwww',
      '...wwwwww.',
      '....wwwW..',
      '.....ww...',
    ],
    thickness: { torso: 9, upperArm: 5, forearm: 4, fist: 4, leg: 5 },
    symbols: {
      cloth: 'c',
      clothShade: 'C',
      skin: 's',
      skinShade: 'S',
      belt: 'b',
      legs: 'p',
      legsShade: 'P',
      fist: 's',
      fistShade: 'S',
      foot: 'f',
      footShade: 'F',
    },
    cape: { symbol: 'C', length: 10, spread: 8 },
    outline: 'o',
  },
  poses: WEN_POSES,
  specialPoses: WEN_SPECIAL_POSES,
  palette: {
    o: '#14121c',
    h: '#9a9aa2',
    w: '#f0f0f4',
    W: '#b8b8c4',
    s: '#d8a47c',
    S: '#a0704e',
    k: '#1a1216',
    c: '#d88a2a',
    C: '#9a5a1a',
    b: '#5a2a1a',
    p: '#8a8478',
    P: '#5e5a52',
    f: '#c8a860',
    F: '#8a7440',
  },
};
