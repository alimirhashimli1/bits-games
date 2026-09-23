import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Nova's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * She is long in the leg: her hips sit three pixels higher than Brand's, so her kicks reach
 * further than anyone's. She stands upright in a kickboxer's guard, hands high and her weight
 * on the back foot, ready to lift the front one. Her jumps, falls and getting up are the same
 * body mechanics as Brand's, so those come from his set.
 */

/** Upright, hands high, the front heel light. */
const STANCE: HumanoidPose = {
  head: [34, 9],
  shoulder: [32, 17],
  hip: [30, 33],
  nearArm: [[37, 23], [41, 16]],
  farArm: [[31, 24], [36, 18]],
  nearLeg: [[36, 47], [40, 62]],
  farLeg: [[25, 47], [21, 62]],
};

const CROUCH: HumanoidPose = {
  head: [37, 31],
  shoulder: [34, 38],
  hip: [28, 49],
  nearArm: [[39, 44], [44, 38]],
  farArm: [[33, 45], [39, 40]],
  nearLeg: [[40, 50], [42, 62]],
  farLeg: [[30, 57], [20, 62]],
};

/** Leaning back over the standing leg, before and after her kicks. */
const KICK_LEAN = {
  head: [29, 10],
  shoulder: [29, 18],
  hip: [31, 33],
  nearArm: [[34, 23], [38, 17]],
  farArm: [[27, 24], [31, 19]],
  farLeg: [[30, 47], [29, 62]],
} as const;

export const NOVA_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** Bouncing on her toes. */
  idle2: { ...STANCE, head: [34, 10], shoulder: [32, 18], nearArm: [[37, 24], [41, 17]], farArm: [[31, 25], [36, 19]] },

  walk1: { ...STANCE, nearLeg: [[37, 47], [41, 62]], farLeg: [[26, 47], [22, 62]] },
  walk2: { ...STANCE, head: [34, 8], shoulder: [32, 16], nearLeg: [[34, 46], [34, 62]], farLeg: [[30, 45], [29, 57]] },
  walk3: { ...STANCE, nearLeg: [[27, 47], [24, 62]], farLeg: [[36, 47], [40, 62]] },
  walk4: { ...STANCE, head: [34, 8], shoulder: [32, 16], nearLeg: [[32, 45], [32, 57]], farLeg: [[31, 46], [31, 62]] },

  crouch: CROUCH,

  blockStand: { ...STANCE, head: [31, 10], shoulder: [29, 18], nearArm: [[35, 21], [35, 11]], farArm: [[33, 23], [38, 16]] },
  blockCrouch: { ...CROUCH, head: [35, 32], shoulder: [32, 39], nearArm: [[38, 42], [38, 32]], farArm: [[36, 44], [41, 37]] },

  hitStand: {
    ...STANCE,
    head: [27, 11],
    shoulder: [27, 18],
    hip: [31, 34],
    nearArm: [[31, 26], [34, 31]],
    farArm: [[24, 25], [21, 30]],
  },
  hitCrouch: { ...CROUCH, head: [32, 34], shoulder: [30, 41], hip: [28, 50], nearArm: [[34, 47], [37, 51]], farArm: [[27, 47], [24, 52]] },

  /** Both gloves thrown up... */
  win1: {
    head: [33, 9],
    shoulder: [31, 17],
    hip: [30, 33],
    nearArm: [[35, 10], [37, 2]],
    farArm: [[27, 10], [25, 2]],
    nearLeg: [[34, 47], [36, 62]],
    farLeg: [[27, 47], [25, 62]],
  },
  /** ...then one leg lifted straight up beside her, to show she can. */
  win2: {
    head: [28, 11],
    shoulder: [28, 18],
    hip: [32, 33],
    nearArm: [[33, 23], [37, 17]],
    farArm: [[25, 24], [22, 19]],
    nearLeg: [[39, 20], [43, 6]],
    farLeg: [[31, 47], [30, 62]],
  },

  /** A quick jab. */
  standLP: { ...STANCE, head: [35, 9], shoulder: [33, 17], nearArm: [[41, 17], [49, 16]] },
  /** Turning the hips for the cross... */
  standHPWindup: { ...STANCE, head: [32, 10], shoulder: [30, 18], farArm: [[25, 23], [28, 17]] },
  /** ...and the rear hand thrown straight. */
  standHP: {
    head: [36, 10],
    shoulder: [34, 18],
    hip: [30, 33],
    nearArm: [[36, 25], [39, 21]],
    farArm: [[43, 17], [52, 16]],
    nearLeg: [[37, 47], [41, 62]],
    farLeg: [[26, 47], [22, 62]],
  },
  /** A push kick, the leg straight out at the stomach. */
  standLK: { ...KICK_LEAN, hip: [33, 33], nearLeg: [[46, 32], [59, 32]] },
  /** The knee chambered high. */
  standHKWindup: { ...KICK_LEAN, nearLeg: [[40, 27], [40, 40]] },
  /** A long roundhouse at the jaw. */
  standHK: {
    head: [24, 13],
    shoulder: [26, 20],
    hip: [33, 33],
    nearArm: [[30, 26], [33, 21]],
    farArm: [[23, 26], [19, 30]],
    nearLeg: [[46, 26], [59, 21]],
    farLeg: [[31, 47], [30, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[44, 40], [51, 40]] },
  /** A rising uppercut against jump-ins. */
  crouchHP: { ...CROUCH, head: [37, 27], shoulder: [34, 34], hip: [29, 48], nearArm: [[39, 27], [41, 17]] },
  /** A long low kick at the shins. */
  crouchLK: { ...CROUCH, nearLeg: [[43, 56], [57, 62]] },
  /** A sweep with the whole leg along the floor. */
  crouchHK: {
    head: [30, 36],
    shoulder: [31, 42],
    hip: [31, 51],
    nearArm: [[35, 49], [36, 56]],
    farArm: [[28, 49], [25, 56]],
    nearLeg: [[45, 57], [59, 62]],
    farLeg: [[31, 60], [21, 62]],
  },

  /** A flying side kick, the leg driven down and out. */
  jumpHK: {
    head: [28, 12],
    shoulder: [29, 19],
    hip: [32, 33],
    nearArm: [[34, 23], [38, 19]],
    farArm: [[27, 25], [23, 28]],
    nearLeg: [[45, 39], [57, 45]],
    farLeg: [[31, 43], [25, 49]],
  },
};

/** Poses for Static Wave and Thunder Heel. */
export const NOVA_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** The knee drawn up and both hands pulled down to the hip, gathering the charge. */
  waveChamber: {
    ...KICK_LEAN,
    nearArm: [[33, 25], [30, 30]],
    farArm: [[27, 25], [26, 31]],
    nearLeg: [[41, 29], [40, 41]],
  },
  /** A side kick at chest height that sends the charge off her foot. */
  waveKick: {
    head: [26, 12],
    shoulder: [27, 19],
    hip: [33, 33],
    nearArm: [[31, 25], [34, 21]],
    farArm: [[24, 26], [20, 29]],
    nearLeg: [[46, 30], [59, 28]],
    farLeg: [[31, 47], [30, 62]],
  },
  /** The front leg swung straight up, heel high above her head. */
  heelRaise: {
    head: [29, 11],
    shoulder: [29, 18],
    hip: [32, 33],
    nearArm: [[34, 24], [37, 19]],
    farArm: [[26, 25], [23, 29]],
    nearLeg: [[40, 21], [45, 7]],
    farLeg: [[31, 47], [30, 62]],
  },
  /** The heel brought down like an axe, the body following it forward. */
  heelDrop: {
    head: [36, 12],
    shoulder: [34, 19],
    hip: [31, 33],
    nearArm: [[37, 25], [40, 20]],
    farArm: [[29, 25], [26, 30]],
    nearLeg: [[45, 31], [56, 40]],
    farLeg: [[28, 47], [25, 62]],
  },
};
