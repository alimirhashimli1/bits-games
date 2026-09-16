import type { HumanoidBody } from '@shared/pixel-art/humanoidRig';

/**
 * Body shared by every fighter in Dojo Quest. Frames are 48×48 pixels, facing right,
 * with the feet on the bottom row. Symbols: h hair, r headband, s skin, k eye,
 * g/G cloth and its shade, S skin shade, b belt.
 */
export const FIGHTER_BODY: HumanoidBody = {
  frameWidth: 48,
  frameHeight: 48,
  head: [
    '...hhhh..',
    '..hhhhhh.',
    'rrrrrrrrr',
    '.r.hhssss',
    'r..hsssks',
    '...hsssss',
    '....sssss',
    '.....sss.',
  ],
  thickness: { torso: 6, upperArm: 3, forearm: 2, fist: 3, leg: 4 },
  symbols: { cloth: 'g', clothShade: 'G', skin: 's', skinShade: 'S', belt: 'b' },
};
