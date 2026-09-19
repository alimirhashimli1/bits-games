import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Osal's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands in a soldier's guard, low and square, trained to take people down. His strikes,
 * jumps and falls share Brand's body mechanics, so those come from Brand's set.
 */

/** Low and square, both hands up in front of him. */
const STANCE: HumanoidPose = {
  head: [36, 13],
  shoulder: [33, 21],
  hip: [30, 38],
  nearArm: [[38, 28], [43, 23]],
  farArm: [[33, 29], [38, 25]],
  nearLeg: [[37, 50], [41, 62]],
  farLeg: [[24, 50], [20, 62]],
};

export const OSAL_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  idle2: { ...STANCE, head: [36, 14], shoulder: [33, 22], nearArm: [[38, 29], [43, 24]], farArm: [[33, 30], [38, 26]] },

  walk1: { ...STANCE, nearLeg: [[38, 50], [42, 62]], farLeg: [[25, 50], [20, 62]] },
  walk2: { ...STANCE, head: [36, 12], shoulder: [33, 20], nearLeg: [[35, 49], [35, 62]], farLeg: [[30, 48], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 50], [24, 62]], farLeg: [[36, 50], [40, 62]] },
  walk4: { ...STANCE, head: [36, 12], shoulder: [33, 20], nearLeg: [[33, 48], [33, 58]], farLeg: [[31, 49], [31, 62]] },

  /** A salute... */
  win1: { ...STANCE, head: [34, 11], shoulder: [32, 19], hip: [30, 36], nearArm: [[39, 17], [37, 10]], farArm: [[29, 27], [30, 34]] },
  /** ...then standing at ease. */
  win2: { ...STANCE, head: [34, 11], shoulder: [32, 19], hip: [30, 36], nearArm: [[34, 27], [31, 34]], farArm: [[28, 27], [29, 34]] },
};

/** Poses for Field Tackle and Adrenaline. */
export const OSAL_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Diving in low, arms out to wrap the legs. */
  tackleDive: {
    head: [42, 24],
    shoulder: [38, 28],
    hip: [28, 40],
    nearArm: [[45, 32], [52, 34]],
    farArm: [[43, 30], [50, 31]],
    nearLeg: [[38, 51], [44, 62]],
    farLeg: [[20, 51], [13, 61]],
  },
  /** Shoulder buried in the midriff, driving forward. */
  tackleDrive: {
    head: [42, 22],
    shoulder: [38, 26],
    hip: [28, 40],
    nearArm: [[42, 34], [46, 30]],
    farArm: [[40, 32], [44, 28]],
    nearLeg: [[37, 51], [43, 62]],
    farLeg: [[21, 51], [14, 61]],
  },
  /** Down on one knee over the one he has taken down, pinning them. */
  tacklePin: {
    head: [40, 32],
    shoulder: [36, 38],
    hip: [28, 48],
    nearArm: [[42, 46], [46, 54]],
    farArm: [[38, 46], [41, 54]],
    nearLeg: [[38, 52], [40, 62]],
    farLeg: [[28, 58], [20, 62]],
  },
  /** Head down, jabbing a shot of adrenaline into his own thigh. */
  adrenalineInject: {
    head: [34, 15],
    shoulder: [31, 23],
    hip: [29, 38],
    nearArm: [[34, 31], [30, 41]],
    farArm: [[27, 30], [24, 36]],
    nearLeg: [[35, 50], [38, 62]],
    farLeg: [[25, 50], [22, 62]],
  },
  /** It kicks in: chest out, head up, fists clenched at his sides. */
  adrenalineFlex: {
    head: [33, 10],
    shoulder: [31, 19],
    hip: [30, 36],
    nearArm: [[37, 26], [39, 33]],
    farArm: [[25, 26], [23, 33]],
    nearLeg: [[36, 49], [39, 62]],
    farLeg: [[24, 49], [21, 62]],
  },
};
