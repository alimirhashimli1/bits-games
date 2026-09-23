import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Cometa's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * A luchador: upright and open, hands spread and ready to grab, light enough on his feet to be
 * in the air a moment later. His falls and getting up are the same body mechanics as Brand's.
 */

/** Upright, arms open and low, ready to take hold of someone. */
const STANCE: HumanoidPose = {
  head: [34, 12],
  shoulder: [32, 20],
  hip: [30, 37],
  nearArm: [[38, 26], [44, 24]],
  farArm: [[28, 27], [23, 26]],
  nearLeg: [[36, 49], [40, 62]],
  farLeg: [[25, 49], [21, 62]],
};

const CROUCH: HumanoidPose = {
  head: [37, 32],
  shoulder: [34, 39],
  hip: [28, 50],
  nearArm: [[41, 45], [47, 43]],
  farArm: [[32, 46], [27, 45]],
  nearLeg: [[40, 51], [42, 62]],
  farLeg: [[30, 57], [21, 62]],
};

/** Weight back before a kick. */
const KICK_LEAN = {
  head: [30, 12],
  shoulder: [29, 20],
  hip: [31, 37],
  nearArm: [[34, 26], [39, 24]],
  farArm: [[26, 27], [21, 26]],
  farLeg: [[29, 49], [28, 62]],
} as const;

export const COMETA_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** Rolling his shoulders, waiting for a way in. */
  idle2: { ...STANCE, head: [34, 13], shoulder: [32, 21], nearArm: [[38, 27], [44, 25]], farArm: [[28, 28], [23, 27]] },

  walk1: { ...STANCE, nearLeg: [[37, 49], [41, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: { ...STANCE, head: [34, 11], shoulder: [32, 19], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 11], shoulder: [32, 19], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  crouch: CROUCH,

  blockStand: { ...STANCE, head: [32, 13], shoulder: [30, 21], nearArm: [[36, 24], [36, 14]], farArm: [[34, 26], [39, 19]] },
  blockCrouch: { ...CROUCH, head: [35, 33], shoulder: [33, 40], nearArm: [[39, 43], [39, 33]], farArm: [[37, 45], [42, 38]] },

  hitStand: {
    ...STANCE,
    head: [28, 13],
    shoulder: [28, 21],
    hip: [31, 37],
    nearArm: [[32, 29], [35, 34]],
    farArm: [[25, 28], [21, 33]],
  },
  hitCrouch: { ...CROUCH, head: [32, 34], shoulder: [31, 41], hip: [28, 51], nearArm: [[35, 47], [38, 51]], farArm: [[28, 47], [25, 52]] },

  /** Both arms thrown up to the crowd... */
  win1: {
    ...STANCE,
    head: [33, 12],
    nearArm: [[38, 16], [41, 7]],
    farArm: [[26, 16], [23, 7]],
  },
  /** ...then a pose, one fist up and one hand on the hip. */
  win2: {
    ...STANCE,
    head: [33, 11],
    nearArm: [[37, 14], [35, 5]],
    farArm: [[28, 28], [31, 33]],
  },

  /** A quick forearm. */
  standLP: { ...STANCE, head: [35, 12], shoulder: [33, 20], nearArm: [[41, 21], [49, 21]] },
  /** Winding up the lariat... */
  standHPWindup: { ...STANCE, head: [32, 12], shoulder: [30, 20], farArm: [[24, 22], [18, 18]] },
  /** ...which comes round at neck height with his whole weight behind it. */
  standHP: {
    ...STANCE,
    head: [36, 12],
    shoulder: [34, 20],
    nearArm: [[37, 28], [40, 25]],
    farArm: [[44, 18], [54, 19]],
  },
  /** A boot to the stomach. */
  standLK: { ...KICK_LEAN, nearLeg: [[41, 41], [51, 41]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[39, 34], [38, 45]] },
  /** A high boot. */
  standHK: {
    head: [27, 14],
    shoulder: [28, 22],
    hip: [31, 37],
    nearArm: [[32, 28], [36, 26]],
    farArm: [[24, 29], [19, 28]],
    nearLeg: [[42, 28], [53, 22]],
    farLeg: [[30, 49], [29, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[44, 42], [51, 42]] },
  /** A rising forearm against jump-ins. */
  crouchHP: { ...CROUCH, head: [37, 28], shoulder: [35, 35], hip: [29, 49], nearArm: [[40, 30], [42, 20]] },
  crouchLK: { ...CROUCH, nearLeg: [[42, 56], [52, 62]] },
  /** A sliding sweep. */
  crouchHK: {
    head: [31, 36],
    shoulder: [31, 42],
    hip: [30, 52],
    nearArm: [[35, 49], [36, 56]],
    farArm: [[28, 49], [25, 56]],
    nearLeg: [[43, 58], [55, 62]],
    farLeg: [[30, 60], [21, 62]],
  },

  /** A dropkick, both feet out. */
  jumpHK: {
    head: [28, 16],
    shoulder: [29, 23],
    hip: [32, 36],
    nearArm: [[26, 26], [21, 24]],
    farArm: [[25, 28], [19, 27]],
    nearLeg: [[42, 38], [53, 40]],
    farLeg: [[40, 42], [50, 45]],
  },
};

/** Poses for Star Clutch and Comet Press. */
export const COMETA_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Both arms out low, reaching for a hold. */
  clutchReach: {
    ...STANCE,
    head: [36, 13],
    shoulder: [34, 21],
    nearArm: [[41, 27], [48, 29]],
    farArm: [[36, 28], [43, 30]],
  },
  /** The hold taken: gripped around the middle, knees bent under the weight. */
  clutchHold: {
    head: [35, 18],
    shoulder: [33, 26],
    hip: [29, 41],
    nearArm: [[39, 30], [45, 28]],
    farArm: [[34, 31], [41, 29]],
    nearLeg: [[37, 51], [40, 62]],
    farLeg: [[24, 51], [20, 62]],
  },
  /** Arched right back, taking them over with him. */
  clutchArch: {
    head: [24, 20],
    shoulder: [27, 26],
    hip: [33, 40],
    nearArm: [[29, 20], [35, 15]],
    farArm: [[26, 22], [32, 17]],
    nearLeg: [[38, 50], [41, 62]],
    farLeg: [[27, 51], [23, 62]],
  },
  /** Springing up and forward, arms spread wide like a star. */
  cometLeap: {
    head: [33, 18],
    shoulder: [32, 25],
    hip: [31, 39],
    nearArm: [[39, 20], [46, 14]],
    farArm: [[25, 21], [18, 16]],
    nearLeg: [[37, 48], [41, 58]],
    farLeg: [[26, 48], [21, 58]],
  },
  /** Flat out, face down, coming down on top of them. */
  cometPress: {
    head: [46, 34],
    headTurns: 3,
    shoulder: [40, 36],
    hip: [24, 38],
    nearArm: [[44, 44], [50, 48]],
    farArm: [[40, 45], [46, 49]],
    nearLeg: [[16, 43], [8, 47]],
    farLeg: [[17, 34], [9, 31]],
  },
};
