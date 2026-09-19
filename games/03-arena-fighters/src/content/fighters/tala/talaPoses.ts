import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Tala's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * She fights low and loose, rocking from foot to foot with her lead hand out, and almost all
 * her strength is in her legs. Getting hit, blocking, falling and jumping are the same body
 * mechanics for every fighter of her build, so those come from Brand's set.
 */

/** A low, wide dancer's stance: lead hand out in front, the other trailing behind. */
const STANCE: HumanoidPose = {
  head: [34, 13],
  shoulder: [32, 21],
  hip: [30, 37],
  nearArm: [[35, 28], [39, 24]],
  farArm: [[28, 28], [24, 32]],
  nearLeg: [[37, 49], [41, 62]],
  farLeg: [[24, 50], [20, 62]],
};

const CROUCH: HumanoidPose = {
  head: [36, 33],
  shoulder: [34, 40],
  hip: [28, 51],
  nearArm: [[38, 46], [42, 42]],
  farArm: [[31, 47], [27, 51]],
  nearLeg: [[39, 52], [41, 62]],
  farLeg: [[30, 58], [20, 62]],
};

/** Leaning away on the back leg, before and after her kicks. */
const KICK_LEAN = {
  head: [29, 13],
  shoulder: [29, 21],
  hip: [31, 37],
  nearArm: [[33, 27], [36, 23]],
  farArm: [[26, 28], [22, 31]],
  farLeg: [[29, 50], [28, 62]],
} as const;

export const TALA_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** The other half of her sway, weight shifted back. */
  idle2: {
    ...STANCE,
    head: [32, 14],
    shoulder: [30, 22],
    hip: [29, 37],
    nearArm: [[33, 29], [37, 25]],
    farArm: [[26, 29], [22, 33]],
  },

  walk1: { ...STANCE, nearLeg: [[38, 49], [42, 62]], farLeg: [[25, 50], [21, 62]] },
  walk2: { ...STANCE, head: [34, 12], shoulder: [32, 20], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 12], shoulder: [32, 20], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  crouch: CROUCH,

  win1: {
    head: [33, 12],
    shoulder: [32, 20],
    hip: [31, 36],
    nearArm: [[37, 13], [41, 6]],
    farArm: [[27, 13], [23, 6]],
    nearLeg: [[36, 45], [33, 52]],
    farLeg: [[30, 49], [30, 62]],
  },
  win2: {
    head: [32, 12],
    shoulder: [31, 20],
    hip: [31, 36],
    nearArm: [[38, 20], [45, 17]],
    farArm: [[26, 20], [19, 17]],
    nearLeg: [[35, 49], [38, 62]],
    farLeg: [[27, 49], [24, 62]],
  },

  /** A quick palm strike. */
  standLP: { ...STANCE, head: [35, 13], shoulder: [33, 21], nearArm: [[41, 20], [48, 19]] },
  /** Winding round for a hammer fist. */
  standHPWindup: { ...STANCE, head: [31, 13], shoulder: [30, 21], nearArm: [[27, 26], [24, 22]], farArm: [[34, 27], [37, 24]] },
  standHP: { ...STANCE, head: [36, 13], shoulder: [34, 21], nearArm: [[36, 28], [38, 32]], farArm: [[42, 17], [51, 20]] },
  /** A shin kick at the stomach. */
  standLK: { ...KICK_LEAN, nearLeg: [[42, 42], [52, 44]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[39, 35], [38, 45]] },
  /** A high hook kick with a long reach. */
  standHK: {
    head: [25, 16],
    shoulder: [26, 23],
    hip: [31, 37],
    nearArm: [[30, 29], [33, 25]],
    farArm: [[23, 30], [19, 34]],
    nearLeg: [[42, 26], [55, 18]],
    farLeg: [[30, 50], [29, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[44, 43], [51, 43]] },
  /** A rising palm, to meet jump-ins. */
  crouchHP: { ...CROUCH, head: [36, 29], shoulder: [34, 36], hip: [29, 50], nearArm: [[38, 28], [40, 19]] },
  crouchLK: { ...CROUCH, nearLeg: [[42, 56], [53, 62]] },
  /** A spinning sweep that reaches a long way. */
  crouchHK: {
    head: [29, 37],
    shoulder: [30, 43],
    hip: [31, 52],
    nearArm: [[34, 50], [35, 57]],
    farArm: [[27, 50], [24, 57]],
    nearLeg: [[44, 58], [58, 62]],
    farLeg: [[30, 60], [21, 62]],
  },

  /** A flying split kick. */
  jumpHK: {
    head: [30, 16],
    shoulder: [31, 23],
    hip: [32, 37],
    nearArm: [[35, 28], [38, 24]],
    farArm: [[28, 29], [25, 33]],
    nearLeg: [[42, 40], [53, 44]],
    farLeg: [[24, 40], [13, 44]],
  },
};

/** Poses for Whirl Kick and Cartwheel. */
export const TALA_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Half a turn of the spinning kick: the lead leg sweeping round in front... */
  whirlKick1: {
    head: [32, 14],
    shoulder: [32, 21],
    hip: [32, 36],
    nearArm: [[37, 20], [42, 17]],
    farArm: [[27, 22], [22, 20]],
    nearLeg: [[43, 36], [54, 34]],
    farLeg: [[30, 48], [28, 58]],
  },
  /** ...and the other leg coming round behind. */
  whirlKick2: {
    head: [32, 14],
    shoulder: [32, 21],
    hip: [32, 36],
    nearArm: [[27, 20], [22, 17]],
    farArm: [[37, 22], [42, 20]],
    nearLeg: [[34, 48], [36, 58]],
    farLeg: [[21, 36], [10, 34]],
  },
  /** Upside down on her hands, legs thrown up in a V. */
  cartwheel1: {
    head: [34, 52],
    headTurns: 2,
    shoulder: [33, 46],
    hip: [31, 30],
    nearArm: [[36, 54], [38, 61]],
    farArm: [[29, 54], [27, 61]],
    nearLeg: [[38, 20], [44, 10]],
    farLeg: [[25, 20], [19, 10]],
  },
  /** The legs wide as she turns over. */
  cartwheel2: {
    head: [34, 53],
    headTurns: 2,
    shoulder: [33, 46],
    hip: [32, 32],
    nearArm: [[36, 54], [38, 61]],
    farArm: [[29, 54], [27, 61]],
    nearLeg: [[42, 24], [52, 16]],
    farLeg: [[22, 24], [12, 16]],
  },
};
