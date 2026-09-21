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

/** Poses for Card Toss and Loaded Dice. */
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
  /** Down into a crouch with the dice drawn back behind his heel, like a bowler. */
  diceWindup: {
    head: [33, 14],
    shoulder: [31, 22],
    hip: [29, 38],
    nearArm: [[31, 30], [27, 36]],
    farArm: [[29, 29], [32, 33]],
    nearLeg: [[35, 50], [38, 62]],
    farLeg: [[25, 50], [22, 62]],
  },
  /** The roll: a long step in and a sweep of the arm that sends them skipping along the floor. */
  diceRoll: {
    head: [36, 16],
    shoulder: [33, 23],
    hip: [29, 38],
    nearArm: [[40, 32], [47, 42]],
    farArm: [[30, 30], [27, 35]],
    nearLeg: [[37, 50], [42, 62]],
    farLeg: [[24, 50], [20, 62]],
  },
};
