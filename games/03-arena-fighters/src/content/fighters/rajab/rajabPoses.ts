import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Rajab's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands easy, hands low, as if he had all the time in the world. His strikes, jumps and
 * falls share Brand's body mechanics, so those come from Brand's set.
 */

/** Relaxed and upright, hands low. */
const STANCE: HumanoidPose = {
  head: [34, 11],
  shoulder: [32, 19],
  hip: [30, 36],
  nearArm: [[36, 26], [41, 23]],
  farArm: [[30, 27], [34, 25]],
  nearLeg: [[35, 49], [38, 62]],
  farLeg: [[25, 49], [22, 62]],
};

export const RAJAB_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** A little shrug, as if bored. */
  idle2: { ...STANCE, head: [34, 12], shoulder: [32, 18], nearArm: [[36, 25], [41, 22]], farArm: [[30, 26], [34, 24]] },

  walk1: { ...STANCE, nearLeg: [[36, 49], [40, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: { ...STANCE, head: [34, 10], shoulder: [32, 18], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 10], shoulder: [32, 18], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  /** Straightening his waistcoat... */
  win1: { ...STANCE, nearArm: [[36, 28], [36, 32]], farArm: [[30, 28], [33, 32]] },
  /** ...and a bow. */
  win2: { ...STANCE, head: [38, 16], shoulder: [35, 23], nearArm: [[38, 30], [34, 32]], farArm: [[30, 30], [27, 34]] },
};

/** Poses for Card Toss and Bluff. */
export const RAJAB_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** The throwing hand drawn back across his chest, cards held flat. */
  cardWindup: {
    ...STANCE,
    head: [33, 11],
    shoulder: [31, 19],
    nearArm: [[33, 22], [28, 19]],
  },
  /** The wrist flicked out flat at chest height, letting the cards fly. */
  cardRelease: {
    ...STANCE,
    head: [36, 11],
    shoulder: [33, 19],
    nearArm: [[41, 19], [49, 20]],
  },
  /** Arms spread, palms open, leaning back: go on, then. */
  bluffStance: {
    ...STANCE,
    head: [32, 11],
    shoulder: [31, 19],
    hip: [31, 36],
    nearArm: [[37, 22], [41, 16]],
    farArm: [[26, 22], [23, 16]],
  },
  /** A sudden step in and a backhand across the face. */
  bluffAnswer: {
    head: [37, 12],
    shoulder: [34, 20],
    hip: [30, 36],
    nearArm: [[42, 22], [51, 24]],
    farArm: [[29, 27], [26, 31]],
    nearLeg: [[38, 49], [43, 62]],
    farLeg: [[25, 49], [21, 62]],
  },
};
