import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Grom's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands hunched and wide like a wrestler waiting to lock up, his big hands low and open in
 * front of him. Jumps, falls and getting up are the same body mechanics for everyone, so those
 * come from Brand's set; his thicker build fills them out.
 */

/** Hunched forward, feet wide, both hands out low and ready to grab. */
const STANCE: HumanoidPose = {
  head: [38, 11],
  shoulder: [33, 20],
  hip: [30, 39],
  nearArm: [[40, 30], [47, 30]],
  farArm: [[36, 29], [43, 26]],
  nearLeg: [[38, 51], [41, 62]],
  farLeg: [[23, 51], [20, 62]],
};

/** A deep squat, hands still out in front. */
const CROUCH: HumanoidPose = {
  head: [39, 30],
  shoulder: [35, 38],
  hip: [28, 51],
  nearArm: [[42, 45], [48, 43]],
  farArm: [[38, 45], [44, 41]],
  nearLeg: [[40, 52], [42, 62]],
  farLeg: [[28, 58], [19, 62]],
};

/** Leaning back on the far leg, before and after his kicks. */
const KICK_LEAN = {
  head: [33, 12],
  shoulder: [30, 20],
  hip: [30, 39],
  nearArm: [[36, 29], [42, 28]],
  farArm: [[30, 30], [36, 27]],
  farLeg: [[27, 51], [26, 62]],
} as const;

/** Tucked at the top of a jump. His jumping attacks start from here. */
const JUMP_TUCK: HumanoidPose = {
  head: [37, 13],
  shoulder: [33, 22],
  hip: [30, 39],
  nearArm: [[40, 29], [45, 25]],
  farArm: [[35, 30], [40, 26]],
  nearLeg: [[39, 41], [37, 51]],
  farLeg: [[34, 45], [27, 51]],
};

export const GROM_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** Breathing out, shoulders sinking. */
  idle2: {
    ...STANCE,
    head: [38, 12],
    shoulder: [33, 21],
    nearArm: [[40, 31], [47, 32]],
    farArm: [[36, 30], [43, 28]],
  },

  // A heavy, stomping walk.
  walk1: { ...STANCE, nearLeg: [[39, 51], [43, 62]], farLeg: [[24, 51], [19, 62]] },
  walk2: { ...STANCE, head: [38, 10], shoulder: [33, 19], nearLeg: [[36, 49], [36, 62]], farLeg: [[31, 48], [30, 58]] },
  walk3: { ...STANCE, nearLeg: [[28, 51], [24, 62]], farLeg: [[36, 51], [40, 62]] },
  walk4: { ...STANCE, head: [38, 10], shoulder: [33, 19], nearLeg: [[34, 48], [34, 58]], farLeg: [[31, 50], [31, 62]] },

  crouch: CROUCH,
  jumpTuck: JUMP_TUCK,

  /** Forearms crossed up in front of his face. */
  blockStand: {
    ...STANCE,
    head: [35, 12],
    shoulder: [31, 20],
    nearArm: [[39, 24], [39, 12]],
    farArm: [[37, 26], [42, 17]],
  },
  blockCrouch: {
    ...CROUCH,
    head: [36, 31],
    shoulder: [33, 39],
    nearArm: [[40, 42], [40, 31]],
    farArm: [[38, 44], [43, 36]],
  },

  hitStand: {
    ...STANCE,
    head: [30, 12],
    shoulder: [29, 21],
    hip: [31, 39],
    nearArm: [[34, 30], [38, 35]],
    farArm: [[26, 29], [22, 34]],
    farLeg: [[25, 51], [21, 62]],
  },
  hitCrouch: {
    ...CROUCH,
    head: [33, 32],
    shoulder: [31, 40],
    hip: [28, 52],
    nearArm: [[36, 47], [40, 51]],
    farArm: [[29, 47], [26, 52]],
  },

  /** Both fists raised over his head. */
  win1: {
    head: [34, 13],
    shoulder: [32, 22],
    hip: [31, 40],
    nearArm: [[40, 16], [42, 6]],
    farArm: [[25, 16], [23, 6]],
    nearLeg: [[38, 51], [41, 62]],
    farLeg: [[24, 51], [21, 62]],
  },
  /** Flexing: arms bent, fists by his ears. */
  win2: {
    head: [34, 13],
    shoulder: [32, 22],
    hip: [31, 40],
    nearArm: [[42, 22], [41, 12]],
    farArm: [[23, 22], [24, 12]],
    nearLeg: [[38, 51], [41, 62]],
    farLeg: [[24, 51], [21, 62]],
  },

  /** A short, heavy jab. */
  standLP: { ...STANCE, head: [39, 11], shoulder: [34, 20], nearArm: [[43, 23], [51, 22]] },
  /** Both hands clasped and raised high behind his head... */
  standHPWindup: {
    ...STANCE,
    head: [35, 12],
    shoulder: [31, 20],
    nearArm: [[31, 11], [26, 5]],
    farArm: [[29, 12], [24, 6]],
  },
  /** ...and brought down in front of him like a hammer. */
  standHP: {
    ...STANCE,
    head: [41, 14],
    shoulder: [36, 22],
    hip: [31, 39],
    nearArm: [[45, 21], [53, 27]],
    farArm: [[43, 22], [51, 28]],
  },
  /** A stamping kick at the shins. */
  standLK: { ...KICK_LEAN, nearLeg: [[41, 46], [51, 52]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[41, 39], [40, 50]] },
  /** The big boot: a flat-footed kick straight into the chest. */
  standHK: {
    head: [29, 13],
    shoulder: [28, 21],
    hip: [31, 39],
    nearArm: [[33, 29], [38, 28]],
    farArm: [[26, 30], [22, 34]],
    nearLeg: [[43, 34], [54, 32]],
    farLeg: [[29, 51], [28, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[45, 42], [52, 42]] },
  /** A rising forearm, to meet jump-ins. */
  crouchHP: { ...CROUCH, head: [38, 26], shoulder: [35, 34], hip: [29, 50], nearArm: [[42, 28], [43, 17]] },
  crouchLK: { ...CROUCH, nearLeg: [[43, 56], [53, 62]] },
  /** A low, sliding kick along the floor. */
  crouchHK: {
    head: [30, 34],
    shoulder: [30, 41],
    hip: [31, 52],
    nearArm: [[35, 49], [37, 56]],
    farArm: [[27, 49], [24, 56]],
    nearLeg: [[44, 58], [56, 62]],
    farLeg: [[30, 60], [21, 62]],
  },

  /** An elbow driven down. */
  jumpLP: { ...JUMP_TUCK, nearArm: [[43, 33], [38, 30]] },
  /** Both fists clubbing down together. */
  jumpHP: { ...JUMP_TUCK, head: [39, 15], nearArm: [[43, 29], [50, 36]], farArm: [[41, 30], [48, 37]] },
  jumpLK: { ...JUMP_TUCK, nearLeg: [[41, 40], [46, 48]] },
  /** Both feet driven down in a stomp. */
  jumpHK: {
    head: [33, 13],
    shoulder: [31, 21],
    hip: [31, 38],
    nearArm: [[37, 27], [41, 23]],
    farArm: [[28, 28], [24, 24]],
    nearLeg: [[40, 46], [47, 56]],
    farLeg: [[36, 48], [42, 58]],
  },
};

/** Poses for Boulder Toss and Ram. */
export const GROM_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Lunging in with both arms wide to wrap the opponent up. */
  boulderReach: {
    head: [41, 14],
    shoulder: [36, 22],
    hip: [30, 40],
    nearArm: [[44, 23], [52, 21]],
    farArm: [[42, 19], [50, 15]],
    nearLeg: [[40, 51], [44, 62]],
    farLeg: [[23, 52], [18, 62]],
  },
  /** Squatting under the weight, arms locked out overhead. */
  boulderLift: {
    head: [34, 18],
    shoulder: [32, 26],
    hip: [30, 43],
    nearArm: [[38, 16], [37, 5]],
    farArm: [[29, 16], [29, 5]],
    nearLeg: [[40, 51], [42, 62]],
    farLeg: [[21, 52], [19, 62]],
  },
  /** Stepping through and heaving it all forward. */
  boulderHeave: {
    head: [41, 13],
    shoulder: [37, 21],
    hip: [31, 39],
    nearArm: [[45, 14], [52, 9]],
    farArm: [[43, 15], [50, 11]],
    nearLeg: [[41, 51], [45, 62]],
    farLeg: [[24, 52], [18, 62]],
  },
  /** Head down, shoulders forward, digging in. */
  ramWindup: {
    head: [42, 24],
    shoulder: [35, 27],
    hip: [28, 42],
    nearArm: [[39, 36], [44, 38]],
    farArm: [[34, 36], [39, 39]],
    nearLeg: [[37, 52], [41, 62]],
    farLeg: [[21, 53], [16, 62]],
  },
  /** Charging bent double, head first. */
  ramCharge: {
    head: [47, 27],
    shoulder: [40, 29],
    hip: [27, 38],
    nearArm: [[40, 39], [35, 44]],
    farArm: [[37, 38], [31, 42]],
    nearLeg: [[35, 51], [42, 62]],
    farLeg: [[19, 49], [12, 60]],
  },
};
