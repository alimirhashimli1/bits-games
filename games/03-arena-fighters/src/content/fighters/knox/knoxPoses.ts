import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Knox's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * A boxer: side on, chin tucked behind a high guard, up on the balls of his feet. He never
 * kicks, so the kick buttons throw hooks and uppercuts to the body instead, and his legs only
 * ever carry him. His jumps and falls are the same body mechanics as Brand's.
 */

/** Side on, both gloves high, chin down. */
const STANCE: HumanoidPose = {
  head: [34, 13],
  shoulder: [32, 21],
  hip: [30, 37],
  nearArm: [[37, 26], [38, 17]],
  farArm: [[30, 27], [34, 18]],
  nearLeg: [[36, 49], [40, 62]],
  farLeg: [[25, 49], [21, 62]],
};

const CROUCH: HumanoidPose = {
  head: [37, 33],
  shoulder: [34, 40],
  hip: [28, 51],
  nearArm: [[40, 45], [41, 36]],
  farArm: [[34, 46], [38, 38]],
  nearLeg: [[40, 52], [42, 62]],
  farLeg: [[30, 58], [21, 62]],
};

export const KNOX_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** Bouncing: the guard lifts a pixel with him. */
  idle2: { ...STANCE, head: [34, 12], shoulder: [32, 20], nearArm: [[37, 25], [38, 16]], farArm: [[30, 26], [34, 17]] },

  // Short, quick steps, the guard never dropping.
  walk1: { ...STANCE, nearLeg: [[37, 49], [41, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: { ...STANCE, head: [34, 12], shoulder: [32, 20], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[28, 49], [25, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 12], shoulder: [32, 20], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  crouch: CROUCH,

  /** The guard pulled tight, both gloves in front of the face. */
  blockStand: { ...STANCE, head: [32, 14], shoulder: [30, 22], nearArm: [[35, 24], [36, 14]], farArm: [[33, 25], [37, 16]] },
  blockCrouch: { ...CROUCH, head: [35, 34], shoulder: [33, 41], nearArm: [[38, 43], [38, 33]], farArm: [[36, 45], [40, 37]] },

  hitStand: {
    ...STANCE,
    head: [28, 14],
    shoulder: [28, 22],
    hip: [31, 37],
    nearArm: [[32, 29], [35, 34]],
    farArm: [[25, 28], [21, 33]],
  },
  hitCrouch: { ...CROUCH, head: [31, 35], shoulder: [30, 42], hip: [28, 52], nearArm: [[34, 48], [37, 52]], farArm: [[27, 48], [24, 53]] },

  /** One glove raised to the crowd... */
  win1: {
    ...STANCE,
    head: [33, 13],
    nearArm: [[37, 15], [39, 6]],
    farArm: [[29, 27], [31, 33]],
  },
  /** ...then both, gloves touched together over his head. */
  win2: {
    ...STANCE,
    head: [33, 14],
    nearArm: [[37, 14], [34, 6]],
    farArm: [[28, 15], [31, 6]],
  },

  /** The jab: lead glove snapped straight out. */
  standLP: { ...STANCE, head: [35, 13], shoulder: [33, 21], nearArm: [[41, 20], [49, 19]] },
  /** Turning into the cross... */
  standHPWindup: { ...STANCE, head: [32, 13], shoulder: [30, 21], farArm: [[26, 24], [29, 17]] },
  /** ...and driving it through. */
  standHP: {
    ...STANCE,
    head: [36, 13],
    shoulder: [34, 21],
    nearArm: [[36, 27], [39, 23]],
    farArm: [[43, 19], [52, 18]],
  },
  /** A short hook to the body with the lead hand. */
  standLK: { ...STANCE, head: [35, 14], shoulder: [33, 22], nearArm: [[40, 27], [47, 30]] },
  /** Dropping the shoulder for the big hook... */
  standHKWindup: { ...STANCE, head: [32, 14], shoulder: [30, 22], farArm: [[25, 26], [23, 32]] },
  /** ...which comes round wide into the ribs. */
  standHK: {
    ...STANCE,
    head: [36, 14],
    shoulder: [34, 22],
    nearArm: [[37, 28], [40, 24]],
    farArm: [[44, 27], [53, 30]],
  },

  /** A jab from the crouch, under the guard. */
  crouchLP: { ...CROUCH, nearArm: [[43, 41], [50, 40]] },
  /** The uppercut: straight up out of the crouch, his answer to jump-ins. */
  crouchHP: { ...CROUCH, head: [37, 29], shoulder: [35, 36], hip: [29, 50], nearArm: [[40, 30], [42, 19]] },
  /** A dig to the body. */
  crouchLK: { ...CROUCH, nearArm: [[42, 45], [49, 47]] },
  /** A heavy hook under the ribs, dropping low with it. */
  crouchHK: {
    ...CROUCH,
    head: [35, 36],
    shoulder: [33, 43],
    hip: [28, 53],
    nearArm: [[40, 48], [48, 51]],
    farArm: [[33, 49], [37, 52]],
  },

  /** Overhand rights and hooks on the way down. */
  jumpLP: { ...BRAND_POSES.jumpTuck, nearArm: [[39, 24], [46, 27]] },
  jumpHP: { ...BRAND_POSES.jumpTuck, nearArm: [[36, 27], [38, 23]], farArm: [[40, 24], [49, 30]] },
  jumpLK: { ...BRAND_POSES.jumpTuck, nearArm: [[39, 28], [46, 32]] },
  jumpHK: { ...BRAND_POSES.jumpTuck, nearArm: [[37, 28], [40, 24]], farArm: [[41, 27], [50, 34]] },
};

/** Poses for Rush Jab and Dash Upper. */
export const KNOX_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Weight loaded on the back foot, the lead glove cocked. */
  rushWind: {
    ...STANCE,
    head: [31, 14],
    shoulder: [29, 22],
    nearArm: [[33, 25], [34, 17]],
    farArm: [[27, 26], [31, 18]],
    nearLeg: [[34, 49], [37, 62]],
    farLeg: [[24, 49], [19, 62]],
  },
  /** Flying in behind the lead glove, body stretched out low over the front foot. */
  rushJab: {
    head: [37, 16],
    shoulder: [34, 23],
    hip: [28, 38],
    nearArm: [[44, 21], [54, 20]],
    farArm: [[31, 28], [27, 33]],
    nearLeg: [[38, 50], [45, 62]],
    farLeg: [[22, 48], [14, 56]],
  },
  /** Sunk down mid-stride, the fist dropped to the hip. */
  upperWind: {
    head: [35, 26],
    shoulder: [33, 34],
    hip: [29, 47],
    nearArm: [[36, 41], [33, 46]],
    farArm: [[31, 42], [35, 45]],
    nearLeg: [[39, 51], [42, 62]],
    farLeg: [[27, 53], [19, 62]],
  },
  /** Up through the middle, the whole body behind the fist. */
  dashUpper: {
    head: [35, 15],
    shoulder: [33, 23],
    hip: [29, 38],
    nearArm: [[40, 24], [43, 12]],
    farArm: [[30, 28], [34, 31]],
    nearLeg: [[37, 50], [42, 62]],
    farLeg: [[24, 50], [19, 62]],
  },
};
