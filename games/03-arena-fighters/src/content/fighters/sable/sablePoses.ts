import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Sable's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * She stands very still, side on and narrow, with one hand low and open in front of her and the
 * hood pulled forward: nothing about her says what is coming next. Her jumps and falls are the
 * same body mechanics as Brand's.
 */

/** Narrow and still, the lead hand open and low. */
const STANCE: HumanoidPose = {
  head: [34, 12],
  shoulder: [32, 20],
  hip: [31, 37],
  nearArm: [[36, 27], [42, 29]],
  farArm: [[30, 28], [27, 33]],
  nearLeg: [[35, 49], [38, 62]],
  farLeg: [[27, 49], [24, 62]],
};

const CROUCH: HumanoidPose = {
  head: [37, 33],
  shoulder: [35, 40],
  hip: [29, 51],
  nearArm: [[40, 46], [46, 47]],
  farArm: [[33, 46], [30, 50]],
  nearLeg: [[40, 52], [42, 62]],
  farLeg: [[31, 58], [22, 62]],
};

/** Weight back before a kick. */
const KICK_LEAN = {
  head: [30, 12],
  shoulder: [29, 20],
  hip: [31, 37],
  nearArm: [[33, 27], [39, 29]],
  farArm: [[27, 28], [24, 33]],
  farLeg: [[29, 49], [28, 62]],
} as const;

export const SABLE_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** The cloak settling: barely a movement at all. */
  idle2: { ...STANCE, head: [34, 13], shoulder: [32, 21], nearArm: [[36, 28], [42, 30]], farArm: [[30, 29], [27, 34]] },

  walk1: { ...STANCE, nearLeg: [[36, 49], [39, 62]], farLeg: [[27, 49], [23, 62]] },
  walk2: { ...STANCE, head: [34, 11], shoulder: [32, 19], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[28, 49], [25, 62]], farLeg: [[35, 49], [39, 62]] },
  walk4: { ...STANCE, head: [34, 11], shoulder: [32, 19], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  crouch: CROUCH,

  blockStand: { ...STANCE, head: [32, 13], shoulder: [30, 21], nearArm: [[36, 24], [36, 14]], farArm: [[33, 26], [38, 20]] },
  blockCrouch: { ...CROUCH, head: [35, 34], shoulder: [33, 41], nearArm: [[39, 44], [39, 34]], farArm: [[37, 46], [42, 39]] },

  hitStand: {
    ...STANCE,
    head: [28, 13],
    shoulder: [28, 21],
    hip: [32, 37],
    nearArm: [[32, 29], [35, 34]],
    farArm: [[25, 28], [21, 33]],
  },
  hitCrouch: { ...CROUCH, head: [32, 35], shoulder: [31, 42], hip: [29, 52], nearArm: [[35, 48], [38, 52]], farArm: [[28, 48], [25, 53]] },

  /** A slow bow of the head... */
  win1: { ...STANCE, head: [35, 15], shoulder: [32, 22], nearArm: [[34, 29], [31, 34]], farArm: [[30, 29], [27, 34]] },
  /** ...and the cloak drawn across her, half gone already. */
  win2: { ...STANCE, head: [33, 13], nearArm: [[34, 26], [28, 24]], farArm: [[30, 27], [25, 25]] },

  /** A straight palm out of the cloak. */
  standLP: { ...STANCE, head: [35, 12], shoulder: [33, 20], nearArm: [[41, 22], [49, 22]] },
  /** Drawing back into the cloak... */
  standHPWindup: { ...STANCE, head: [32, 12], shoulder: [30, 20], nearArm: [[31, 26], [26, 29]], farArm: [[28, 27], [24, 31]] },
  /** ...and a double palm driven out at chest height. */
  standHP: {
    ...STANCE,
    head: [36, 12],
    shoulder: [34, 20],
    nearArm: [[42, 22], [51, 22]],
    farArm: [[41, 25], [50, 26]],
  },
  /** A low, quiet kick at the shin. */
  standLK: { ...KICK_LEAN, nearLeg: [[40, 46], [49, 50]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[38, 40], [38, 50]] },
  /** A turning kick at the ribs. */
  standHK: {
    head: [28, 14],
    shoulder: [28, 22],
    hip: [31, 37],
    nearArm: [[32, 28], [37, 30]],
    farArm: [[25, 29], [21, 33]],
    nearLeg: [[42, 33], [54, 30]],
    farLeg: [[30, 49], [29, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[44, 44], [51, 44]] },
  /** A rising palm against jump-ins. */
  crouchHP: { ...CROUCH, head: [37, 29], shoulder: [35, 36], hip: [30, 50], nearArm: [[40, 30], [42, 20]] },
  crouchLK: { ...CROUCH, nearLeg: [[42, 57], [51, 62]] },
  /** A long low sweep, the cloak trailing it. */
  crouchHK: {
    head: [31, 36],
    shoulder: [31, 42],
    hip: [31, 52],
    nearArm: [[35, 50], [36, 57]],
    farArm: [[28, 50], [25, 57]],
    nearLeg: [[44, 58], [56, 62]],
    farLeg: [[31, 60], [22, 62]],
  },
};

/** Poses for Shade Orb and Veil Step. */
export const SABLE_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Both hands cupped low, something dark gathering between them. */
  orbGather: {
    head: [33, 14],
    shoulder: [31, 22],
    hip: [30, 38],
    nearArm: [[34, 30], [39, 33]],
    farArm: [[30, 31], [35, 34]],
    nearLeg: [[36, 50], [40, 62]],
    farLeg: [[25, 50], [21, 62]],
  },
  /** One hand sweeping out to send it on its way. */
  orbRelease: {
    head: [36, 13],
    shoulder: [34, 21],
    hip: [30, 37],
    nearArm: [[43, 24], [52, 22]],
    farArm: [[31, 28], [28, 33]],
    nearLeg: [[38, 49], [42, 62]],
    farLeg: [[24, 49], [20, 62]],
  },
  /** Folding into the cloak, head down, already half gone. */
  veilVanish: {
    head: [32, 20],
    shoulder: [31, 27],
    hip: [30, 42],
    nearArm: [[34, 33], [29, 31]],
    farArm: [[29, 34], [34, 32]],
    nearLeg: [[34, 52], [36, 62]],
    farLeg: [[28, 52], [26, 62]],
  },
  /** Rising out of the dark behind them, the cloak sweeping open. */
  veilAppear: {
    head: [33, 16],
    shoulder: [32, 23],
    hip: [31, 39],
    nearArm: [[38, 26], [44, 21]],
    farArm: [[26, 27], [20, 23]],
    nearLeg: [[35, 51], [38, 62]],
    farLeg: [[27, 51], [24, 62]],
  },
};
