import type { HumanoidBody } from '@shared/pixel-art/humanoidRig';

/**
 * Mei is built to be told apart from the fighters at a glance: long hair down her back
 * instead of a headband, and a slighter frame than anyone who fights for a living.
 *
 * Head symbols: h hair, r ribbon, s skin, k eye. The body uses the shared rig symbols.
 */
export const MEI_BODY: HumanoidBody = {
  frameWidth: 48,
  frameHeight: 48,
  head: [
    '...hhhhh...',
    '..hhhhhhh..',
    '.hhhhhhhhh.',
    '.hhrhhssss.',
    '.hh.hsssks.',
    '.hh..sssss.',
    '.hhh.sssss.',
    '.hhh..sss..',
    '.hhh.......',
    '..hh.......',
  ],
  thickness: { torso: 5, upperArm: 2, forearm: 2, fist: 2, leg: 3 },
  symbols: { cloth: 'g', clothShade: 'G', skin: 's', skinShade: 'S', belt: 'b' },
};
