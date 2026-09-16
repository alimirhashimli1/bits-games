import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { HERO_POSES } from './heroPoses';

const FIGHT = HERO_POSES.fight;

/**
 * Poses only Gorran has. He shares every other pose with the rest of the cast, so only his
 * signature move needs drawing: an overhead smash, cocked high above the helmet and brought
 * straight down.
 */
export const GORRAN_POSES = {
  /** The fist raised above the horns, which is the warning that the smash is coming. */
  smashWindup: {
    ...FIGHT,
    head: [25, 12],
    shoulder: [24, 18],
    nearArm: [[28, 12], [30, 4]],
    farArm: [[26, 22], [29, 19]],
  },
  /** The hammer blow, coming down in front of him. */
  smashStrike: {
    ...FIGHT,
    head: [26, 13],
    shoulder: [25, 18],
    nearArm: [[31, 17], [34, 24]],
    farArm: [[26, 23], [29, 21]],
  },
} as const satisfies Record<string, HumanoidPose>;

export type GorranPoseName = keyof typeof GORRAN_POSES;
