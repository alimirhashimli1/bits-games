import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { HERO_POSES } from './heroPoses';

const STAND = HERO_POSES.stand;

/**
 * Poses only Mei has. She shares the walking and standing poses with everyone else, but a
 * captive at the bars and someone flinching from a raised fist are not things a fighter does.
 */
export const MEI_POSES = {
  /** Both hands on the bars, waiting. */
  caged: {
    ...STAND,
    head: [25, 9],
    shoulder: [24, 16],
    hip: [24, 30],
    nearArm: [[27, 20], [31, 17]],
    farArm: [[26, 21], [30, 18]],
    nearLeg: [[25, 38], [26, 47]],
    farLeg: [[22, 38], [21, 47]],
  },
  /** Arms up in front of her face, leaning away from whoever is coming. */
  shield: {
    ...STAND,
    head: [24, 11],
    shoulder: [23, 18],
    hip: [23, 30],
    nearArm: [[26, 17], [28, 11]],
    farArm: [[24, 18], [26, 12]],
    nearLeg: [[25, 38], [26, 47]],
    farLeg: [[21, 38], [20, 47]],
  },
} as const satisfies Record<string, HumanoidPose>;

export type MeiPoseName = keyof typeof MEI_POSES;
