import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES, REACHING_KICKS } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Mahmood's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He fights side-on on light feet, his handless front arm forward and his hand held in to guard
 * his body. His legs do most of the work: his kicks (Brand's long-reaching ones), jumps and
 * falls share Brand's body mechanics, so those come from Brand's set.
 */

/** Side-on and light on his feet: the short arm forward, the hand tucked in across his ribs. */
const STANCE: HumanoidPose = {
  head: [35, 11],
  shoulder: [32, 19],
  hip: [30, 36],
  nearArm: [[37, 25], [43, 21]],
  farArm: [[31, 27], [35, 27]],
  nearLeg: [[36, 49], [40, 62]],
  farLeg: [[24, 49], [21, 62]],
};

const JUMP_TUCK: HumanoidPose = {
  head: [34, 14],
  shoulder: [32, 21],
  hip: [30, 37],
  nearArm: [[37, 26], [41, 22]],
  farArm: [[30, 28], [33, 29]],
  nearLeg: [[39, 38], [37, 48]],
  farLeg: [[35, 42], [29, 49]],
};

export const MAHMOOD_POSES: FighterPoses = {
  ...BRAND_POSES,
  ...REACHING_KICKS,

  idle1: STANCE,
  idle2: { ...STANCE, head: [35, 12], shoulder: [32, 20], nearArm: [[37, 26], [43, 22]], farArm: [[31, 28], [35, 28]] },

  walk1: { ...STANCE, nearLeg: [[37, 49], [41, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: { ...STANCE, head: [35, 10], shoulder: [32, 18], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [35, 10], shoulder: [32, 18], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  jumpTuck: JUMP_TUCK,

  /** A quick jab of the front arm to the face. */
  standLP: { ...STANCE, head: [36, 11], shoulder: [33, 19], nearArm: [[42, 19], [50, 18]] },
  /** The front arm drawn back to the hip... */
  standHPWindup: { ...STANCE, head: [33, 12], shoulder: [30, 20], nearArm: [[31, 28], [27, 31]] },
  /** ...and driven out in a heavy forearm strike, the whole body behind it. */
  standHP: {
    ...STANCE,
    head: [38, 12],
    shoulder: [35, 20],
    hip: [31, 36],
    nearArm: [[44, 20], [53, 20]],
    farArm: [[33, 28], [36, 29]],
    nearLeg: [[38, 49], [42, 62]],
  },

  jumpLP: { ...JUMP_TUCK, nearArm: [[40, 25], [47, 29]] },
  /** The front arm driven down on whoever is below. */
  jumpHP: { ...JUMP_TUCK, nearArm: [[41, 28], [48, 34]] },
};

/** Poses for Lion Palm and Rising Heel. */
export const MAHMOOD_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** A long, low lunge behind his outstretched front arm. */
  palmLunge: {
    head: [40, 15],
    shoulder: [37, 22],
    hip: [30, 37],
    nearArm: [[46, 21], [55, 21]],
    farArm: [[34, 29], [37, 31]],
    nearLeg: [[41, 50], [46, 62]],
    farLeg: [[22, 51], [15, 62]],
  },
  /** Sunk down on both legs, ready to spring. */
  heelCrouch: {
    head: [36, 30],
    shoulder: [33, 37],
    hip: [28, 50],
    nearArm: [[38, 43], [42, 40]],
    farArm: [[31, 44], [34, 45]],
    nearLeg: [[39, 51], [40, 62]],
    farLeg: [[30, 57], [21, 62]],
  },
  /** Flying flat and low, leaning back with the kicking heel driven straight out in front at hip height. */
  heelRise: {
    head: [26, 18],
    shoulder: [28, 25],
    hip: [32, 38],
    nearArm: [[24, 31], [21, 36]],
    farArm: [[30, 32], [33, 34]],
    nearLeg: [[44, 37], [57, 36]],
    farLeg: [[28, 50], [34, 57]],
  },
};
