import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES, REACHING_KICKS } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Rook's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands square and still, guard tight to the chin, weight evenly on both feet: a soldier
 * waiting for the other side to make the first mistake. His strikes, jumps and falls share
 * Brand's body mechanics, so those come from Brand's set, and he kicks with Brand's long reach.
 */

/** Square and still, guard tight. */
const STANCE: HumanoidPose = {
  head: [34, 11],
  shoulder: [31, 19],
  hip: [30, 36],
  nearArm: [[36, 25], [39, 18]],
  farArm: [[31, 26], [35, 19]],
  nearLeg: [[35, 49], [39, 62]],
  farLeg: [[25, 49], [21, 62]],
};

export const ROOK_POSES: FighterPoses = {
  ...BRAND_POSES,
  ...REACHING_KICKS,

  idle1: STANCE,
  /** Barely moving: a breath. */
  idle2: { ...STANCE, head: [34, 12], shoulder: [31, 20], nearArm: [[36, 26], [39, 19]], farArm: [[31, 27], [35, 20]] },

  walk1: { ...STANCE, nearLeg: [[36, 49], [40, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: { ...STANCE, head: [34, 10], shoulder: [31, 18], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 10], shoulder: [31, 18], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  /** A salute... */
  win1: { ...STANCE, nearArm: [[38, 14], [36, 8]], farArm: [[29, 28], [30, 34]] },
  /** ...then at ease, hands behind his back. */
  win2: { ...STANCE, head: [33, 11], nearArm: [[30, 27], [27, 33]], farArm: [[29, 27], [26, 33]] },
};

/** Poses for Rail Shot and Hook Flip. */
export const ROOK_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Both fists drawn back past the ear, the body coiled. */
  railWindup: {
    head: [32, 12],
    shoulder: [30, 20],
    hip: [30, 36],
    nearArm: [[27, 20], [24, 14]],
    farArm: [[26, 22], [23, 16]],
    nearLeg: [[36, 49], [41, 62]],
    farLeg: [[24, 49], [19, 62]],
  },
  /** Both fists driven straight out together, sending the shot down the arena. */
  railRelease: {
    head: [36, 12],
    shoulder: [34, 20],
    hip: [30, 36],
    nearArm: [[43, 19], [52, 18]],
    farArm: [[42, 21], [51, 21]],
    nearLeg: [[38, 49], [43, 62]],
    farLeg: [[24, 49], [19, 62]],
  },
  /** Sunk down on both legs, about to spring. */
  hookCrouch: {
    head: [34, 30],
    shoulder: [32, 37],
    hip: [28, 50],
    nearArm: [[37, 43], [41, 38]],
    farArm: [[31, 44], [35, 39]],
    nearLeg: [[39, 51], [40, 62]],
    farLeg: [[30, 57], [21, 62]],
  },
  /** Flipping over backwards, the kicking leg swept up in an arc high in front of him. */
  hookFlip: {
    head: [26, 26],
    shoulder: [28, 31],
    hip: [33, 40],
    nearArm: [[25, 36], [21, 42]],
    farArm: [[27, 37], [23, 44]],
    nearLeg: [[41, 31], [46, 19]],
    farLeg: [[36, 50], [32, 58]],
  },
};
