import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Magnus Vane's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He is the tallest figure in the game: his head sits two pixels higher than Brand's and his head
 * sprite is taller again with the crown on it, so he stands a good head over the roster.
 *
 * He does not take a fighting stance. He stands straight, shoulders over hips, hands open and low,
 * as a host receiving a guest — which is also why he is easy to hit for anyone who gets past what
 * he throws. His jumps, falls and getting up reuse Brand's poses, as every fighter's do.
 */

/** Upright and unguarded, weight even, hands open at his sides. */
const STANCE: HumanoidPose = {
  head: [34, 9],
  shoulder: [32, 18],
  hip: [31, 36],
  nearArm: [[37, 27], [41, 33]],
  farArm: [[28, 27], [25, 33]],
  nearLeg: [[36, 49], [39, 62]],
  farLeg: [[26, 49], [23, 62]],
};

/** Even crouching he keeps his back straight. */
const CROUCH: HumanoidPose = {
  head: [37, 30],
  shoulder: [35, 38],
  hip: [29, 50],
  nearArm: [[40, 45], [45, 48]],
  farArm: [[34, 46], [30, 49]],
  nearLeg: [[40, 51], [40, 62]],
  farLeg: [[31, 57], [22, 62]],
};

/** Weight settled onto the back leg, before and after his kicks. */
const KICK_LEAN = {
  head: [30, 9],
  shoulder: [29, 18],
  hip: [32, 36],
  nearArm: [[33, 27], [37, 33]],
  farArm: [[26, 27], [22, 32]],
  farLeg: [[29, 49], [28, 62]],
} as const;

export const VANE_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** The mantle settling on his shoulders. */
  idle2: { ...STANCE, head: [34, 10], shoulder: [32, 19], nearArm: [[37, 28], [41, 34]], farArm: [[28, 28], [25, 34]] },

  walk1: { ...STANCE, nearLeg: [[37, 49], [41, 62]], farLeg: [[26, 49], [22, 62]] },
  walk2: { ...STANCE, head: [34, 8], shoulder: [32, 17], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[28, 49], [25, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 8], shoulder: [32, 17], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  crouch: CROUCH,

  /** A forearm raised across himself, barely troubled. */
  blockStand: { ...STANCE, head: [33, 10], shoulder: [31, 19], nearArm: [[36, 25], [36, 14]], farArm: [[32, 26], [37, 20]] },
  blockCrouch: { ...CROUCH, head: [35, 31], shoulder: [33, 39], nearArm: [[39, 43], [39, 33]], farArm: [[36, 45], [41, 39]] },

  /** Rocked back on his heels: the rare moment someone has reached him. */
  hitStand: {
    ...STANCE,
    head: [28, 11],
    shoulder: [28, 20],
    hip: [32, 36],
    nearArm: [[32, 29], [35, 35]],
    farArm: [[24, 28], [20, 33]],
  },
  hitCrouch: { ...CROUCH, head: [32, 33], shoulder: [31, 40], hip: [29, 51], nearArm: [[35, 47], [38, 52]], farArm: [[28, 47], [24, 52]] },

  /** A hand laid on the crown to settle it back into place... */
  win1: { ...STANCE, head: [34, 10], nearArm: [[38, 22], [36, 12]], farArm: [[28, 28], [25, 34]] },
  /** ...and an arm swept out over the tower, and the city under it. */
  win2: { ...STANCE, head: [35, 9], nearArm: [[40, 23], [50, 18]], farArm: [[28, 27], [25, 33]] },

  /** A long straight arm: the reach that keeps everyone at the distance he chooses. */
  standLP: { ...STANCE, head: [35, 9], shoulder: [33, 18], nearArm: [[41, 21], [50, 21]] },
  /** The fist drawn back over the shoulder... */
  standHPWindup: { ...STANCE, head: [31, 9], shoulder: [30, 18], nearArm: [[31, 24], [27, 18]], farArm: [[28, 27], [25, 33]] },
  /** ...and an overhand smash brought down with the whole body behind it. */
  standHP: {
    ...STANCE,
    head: [35, 11],
    shoulder: [33, 19],
    hip: [30, 37],
    nearArm: [[42, 20], [50, 27]],
    farArm: [[29, 28], [26, 34]],
  },
  /** A straight push kick at the stomach. */
  standLK: { ...KICK_LEAN, nearLeg: [[41, 44], [50, 46]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[38, 40], [38, 50]] },
  /** A long kick swung up at the jaw. */
  standHK: {
    head: [28, 12],
    shoulder: [28, 20],
    hip: [31, 36],
    nearArm: [[32, 28], [36, 33]],
    farArm: [[24, 29], [20, 34]],
    nearLeg: [[42, 32], [55, 29]],
    farLeg: [[29, 49], [28, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[44, 43], [52, 43]] },
  /** A rising backhand that takes a jump-in out of the air. */
  crouchHP: { ...CROUCH, head: [37, 27], shoulder: [35, 35], hip: [30, 49], nearArm: [[41, 29], [43, 17]] },
  crouchLK: { ...CROUCH, nearLeg: [[42, 57], [51, 62]] },
  /** A long sweep along the floor, the mantle dragging after it. */
  crouchHK: {
    head: [31, 34],
    shoulder: [31, 41],
    hip: [31, 51],
    nearArm: [[35, 49], [36, 56]],
    farArm: [[28, 49], [24, 56]],
    nearLeg: [[45, 58], [57, 62]],
    farLeg: [[31, 60], [22, 62]],
  },
};

/** Poses for Iron Verdict and Crown Breaker. */
export const VANE_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** The crown lifted off his head and held up, so everyone can see what is about to be thrown. */
  verdictRaise: {
    head: [33, 10],
    shoulder: [31, 19],
    hip: [31, 37],
    nearArm: [[37, 20], [38, 10]],
    farArm: [[27, 27], [24, 33]],
    nearLeg: [[35, 50], [38, 62]],
    farLeg: [[26, 50], [23, 62]],
  },
  /** Sent on its way with a flat sweep of the arm, without hurrying. */
  verdictThrow: {
    head: [35, 10],
    shoulder: [33, 19],
    hip: [30, 37],
    nearArm: [[42, 22], [51, 24]],
    farArm: [[29, 28], [26, 34]],
    nearLeg: [[38, 50], [42, 62]],
    farLeg: [[25, 50], [21, 62]],
  },
  /** Sinking, the fist dropped low, the mantle gathering. */
  crownCrouch: {
    head: [34, 26],
    shoulder: [33, 34],
    hip: [30, 48],
    nearArm: [[36, 43], [34, 50]],
    farArm: [[29, 43], [26, 49]],
    nearLeg: [[38, 52], [40, 62]],
    farLeg: [[27, 52], [24, 62]],
  },
  /** Driven straight up behind the fist, the body stretched out under it. */
  crownRise: {
    head: [33, 14],
    shoulder: [32, 22],
    hip: [31, 38],
    nearArm: [[35, 15], [34, 4]],
    farArm: [[28, 30], [25, 36]],
    nearLeg: [[33, 50], [35, 61]],
    farLeg: [[28, 50], [26, 62]],
  },
};
