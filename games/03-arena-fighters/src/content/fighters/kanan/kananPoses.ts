import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Kanan's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands tall and square with both fists up, a brawler rather than a grappler. His kicks,
 * jumps and falls are the same body mechanics as Brand's, so those come from Brand's set; his
 * thick build fills them out.
 */

/** Tall and square, fists high. */
const STANCE: HumanoidPose = {
  head: [36, 11],
  shoulder: [32, 20],
  hip: [30, 38],
  nearArm: [[38, 26], [43, 19]],
  farArm: [[32, 28], [38, 22]],
  nearLeg: [[37, 50], [41, 62]],
  farLeg: [[24, 50], [20, 62]],
};

const CROUCH: HumanoidPose = {
  head: [38, 30],
  shoulder: [35, 38],
  hip: [28, 50],
  nearArm: [[41, 44], [46, 38]],
  farArm: [[35, 45], [41, 40]],
  nearLeg: [[40, 51], [41, 62]],
  farLeg: [[30, 57], [21, 62]],
};

export const KANAN_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  idle2: { ...STANCE, head: [36, 12], shoulder: [32, 21], nearArm: [[38, 27], [43, 20]], farArm: [[32, 29], [38, 23]] },

  walk1: { ...STANCE, nearLeg: [[38, 50], [42, 62]], farLeg: [[25, 50], [20, 62]] },
  walk2: { ...STANCE, head: [36, 10], shoulder: [32, 19], nearLeg: [[35, 49], [35, 62]], farLeg: [[30, 48], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 50], [24, 62]], farLeg: [[36, 50], [40, 62]] },
  walk4: { ...STANCE, head: [36, 10], shoulder: [32, 19], nearLeg: [[33, 48], [33, 58]], farLeg: [[31, 49], [31, 62]] },

  crouch: CROUCH,

  blockStand: { ...STANCE, head: [33, 12], shoulder: [30, 20], nearArm: [[37, 24], [37, 13]], farArm: [[35, 26], [40, 18]] },
  blockCrouch: { ...CROUCH, head: [35, 31], shoulder: [33, 39], nearArm: [[39, 42], [39, 31]], farArm: [[37, 44], [42, 36]] },

  hitStand: {
    ...STANCE,
    head: [29, 12],
    shoulder: [28, 21],
    hip: [31, 38],
    nearArm: [[33, 29], [37, 34]],
    farArm: [[25, 28], [21, 33]],
  },
  hitCrouch: { ...CROUCH, head: [32, 33], shoulder: [31, 41], hip: [28, 51], nearArm: [[36, 47], [39, 51]], farArm: [[28, 47], [25, 52]] },

  /** Beating his chest... */
  win1: { ...STANCE, head: [34, 11], nearArm: [[38, 28], [36, 24]], farArm: [[30, 29], [33, 24]] },
  /** ...then a roar with both fists thrown up. */
  win2: { ...STANCE, head: [34, 10], nearArm: [[39, 14], [42, 5]], farArm: [[27, 14], [24, 5]] },

  /** A heavy jab. */
  standLP: { ...STANCE, head: [37, 11], shoulder: [33, 20], nearArm: [[43, 20], [51, 19]] },
  /** The rear fist drawn back high... */
  standHPWindup: { ...STANCE, head: [34, 12], shoulder: [30, 20], farArm: [[26, 18], [24, 10]] },
  /** ...and brought over the top in a smash. */
  standHP: {
    ...STANCE,
    head: [39, 13],
    shoulder: [35, 21],
    nearArm: [[38, 30], [41, 26]],
    farArm: [[44, 18], [53, 22]],
  },

  crouchLP: { ...CROUCH, nearArm: [[45, 42], [52, 42]] },
  /** A rising uppercut from the crouch. */
  crouchHP: { ...CROUCH, head: [38, 26], shoulder: [35, 34], hip: [29, 49], nearArm: [[41, 29], [43, 18]] },
};

/** Poses for Quake Stomp and Titan Rush. */
export const KANAN_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Knee raised high, both fists up, about to bring it all down. */
  stompRaise: {
    head: [34, 12],
    shoulder: [31, 21],
    hip: [30, 38],
    nearArm: [[36, 13], [38, 6]],
    farArm: [[27, 14], [26, 7]],
    nearLeg: [[39, 32], [40, 43]],
    farLeg: [[28, 50], [27, 62]],
  },
  /** The foot slammed down and the whole body sunk behind it. */
  stompDown: {
    head: [37, 24],
    shoulder: [34, 31],
    hip: [29, 45],
    nearArm: [[40, 37], [45, 42]],
    farArm: [[31, 38], [35, 44]],
    nearLeg: [[41, 51], [44, 62]],
    farLeg: [[25, 55], [18, 62]],
  },
  /** Shoulder turned in, low, arms tucked. */
  rushWindup: {
    head: [38, 20],
    shoulder: [34, 26],
    hip: [29, 41],
    nearArm: [[37, 34], [42, 31]],
    farArm: [[30, 34], [34, 30]],
    nearLeg: [[38, 51], [42, 62]],
    farLeg: [[22, 52], [17, 62]],
  },
  /** Charging shoulder first, leaning hard into it. */
  rushCharge: {
    head: [45, 22],
    shoulder: [40, 26],
    hip: [28, 39],
    nearArm: [[44, 33], [40, 37]],
    farArm: [[36, 33], [33, 38]],
    nearLeg: [[36, 51], [43, 62]],
    farLeg: [[20, 50], [13, 60]],
  },
};
