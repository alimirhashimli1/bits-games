import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Old Wen's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands a little stooped, feet close together, with his lead palm open in front of him and
 * the other hand resting at his belt, as if he had all day. His jumps and falls are the same
 * body mechanics as Brand's, so those come from Brand's set.
 */

/** Stooped and easy, lead palm open, rear hand at the belt. */
const STANCE: HumanoidPose = {
  head: [37, 15],
  shoulder: [33, 23],
  hip: [30, 38],
  nearArm: [[38, 28], [44, 26]],
  farArm: [[30, 30], [35, 33]],
  nearLeg: [[35, 50], [38, 62]],
  farLeg: [[26, 50], [23, 62]],
};

const CROUCH: HumanoidPose = {
  head: [39, 33],
  shoulder: [35, 40],
  hip: [28, 51],
  nearArm: [[41, 45], [46, 42]],
  farArm: [[33, 46], [37, 48]],
  nearLeg: [[40, 52], [41, 62]],
  farLeg: [[30, 58], [21, 62]],
};

/** Weight back on the rear leg, before and after his kicks. */
const KICK_LEAN = {
  head: [33, 15],
  shoulder: [30, 23],
  hip: [30, 38],
  nearArm: [[36, 27], [41, 25]],
  farArm: [[28, 30], [32, 33]],
  farLeg: [[28, 50], [27, 62]],
} as const;

export const WEN_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** Breathing out, the palm drifting a little lower. */
  idle2: { ...STANCE, head: [37, 16], shoulder: [33, 24], nearArm: [[38, 29], [44, 28]] },

  // Short, shuffling steps.
  walk1: { ...STANCE, nearLeg: [[36, 50], [39, 62]], farLeg: [[27, 50], [24, 62]] },
  walk2: { ...STANCE, head: [37, 14], shoulder: [33, 22], nearLeg: [[33, 49], [33, 62]], farLeg: [[30, 49], [29, 60]] },
  walk3: { ...STANCE, nearLeg: [[29, 50], [27, 62]], farLeg: [[34, 50], [37, 62]] },
  walk4: { ...STANCE, head: [37, 14], shoulder: [33, 22], nearLeg: [[32, 49], [32, 60]], farLeg: [[31, 50], [31, 62]] },

  crouch: CROUCH,

  /** The sleeve raised across the face. */
  blockStand: { ...STANCE, head: [34, 16], shoulder: [31, 24], nearArm: [[37, 25], [37, 15]], farArm: [[34, 28], [39, 22]] },
  blockCrouch: { ...CROUCH, head: [36, 34], shoulder: [33, 41], nearArm: [[39, 43], [39, 33]], farArm: [[37, 45], [42, 38]] },

  hitStand: {
    ...STANCE,
    head: [30, 16],
    shoulder: [29, 24],
    hip: [31, 38],
    nearArm: [[33, 31], [37, 35]],
    farArm: [[26, 30], [22, 34]],
  },
  hitCrouch: { ...CROUCH, head: [33, 35], shoulder: [31, 42], hip: [28, 52], nearArm: [[35, 48], [38, 52]], farArm: [[28, 48], [25, 53]] },

  /** A small bow, palm pressed to fist... */
  win1: {
    head: [38, 18],
    shoulder: [34, 25],
    hip: [30, 39],
    nearArm: [[38, 30], [41, 25]],
    farArm: [[36, 31], [41, 26]],
    nearLeg: [[33, 50], [34, 62]],
    farLeg: [[28, 50], [27, 62]],
  },
  /** ...then upright, hands folded behind his back. */
  win2: {
    head: [34, 13],
    shoulder: [32, 21],
    hip: [31, 37],
    nearArm: [[30, 28], [27, 34]],
    farArm: [[29, 29], [26, 34]],
    nearLeg: [[33, 50], [34, 62]],
    farLeg: [[28, 50], [27, 62]],
  },

  /** A short palm strike at the chest. */
  standLP: { ...STANCE, head: [38, 15], shoulder: [34, 23], nearArm: [[42, 24], [50, 23]] },
  /** Both palms drawn back to the hip... */
  standHPWindup: { ...STANCE, head: [35, 16], shoulder: [31, 24], nearArm: [[31, 31], [28, 35]], farArm: [[30, 32], [26, 35]] },
  /** ...and driven out together. */
  standHP: {
    ...STANCE,
    head: [39, 15],
    shoulder: [36, 23],
    nearArm: [[44, 24], [52, 24]],
    farArm: [[43, 26], [51, 27]],
    nearLeg: [[38, 50], [42, 62]],
  },
  /** A low front kick at the knee. */
  standLK: { ...KICK_LEAN, hip: [31, 38], nearLeg: [[43, 44], [54, 48]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[38, 40], [38, 50]] },
  /** A push kick at the stomach, the leg straight out. */
  standHK: {
    head: [30, 16],
    shoulder: [29, 24],
    hip: [31, 38],
    nearArm: [[34, 29], [39, 27]],
    farArm: [[27, 30], [31, 33]],
    nearLeg: [[44, 38], [57, 37]],
    farLeg: [[29, 50], [28, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[45, 43], [52, 44]] },
  /** A palm thrust straight up, against jump-ins. */
  crouchHP: { ...CROUCH, head: [38, 29], shoulder: [35, 36], hip: [29, 50], nearArm: [[40, 28], [41, 18]] },
  crouchLK: { ...CROUCH, nearLeg: [[43, 56], [54, 62]] },
  /** A low sweep, leaning over the far knee. */
  crouchHK: {
    head: [31, 36],
    shoulder: [31, 42],
    hip: [30, 52],
    nearArm: [[35, 49], [36, 56]],
    farArm: [[28, 49], [25, 56]],
    nearLeg: [[44, 58], [57, 62]],
    farLeg: [[30, 60], [21, 62]],
  },
};

/** Poses for Spirit Palm and Crane Stance. */
export const WEN_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Sunk low, both palms drawn back to the hip, gathering himself. */
  spiritGather: {
    head: [34, 17],
    shoulder: [31, 25],
    hip: [30, 39],
    nearArm: [[30, 32], [27, 36]],
    farArm: [[29, 33], [25, 36]],
    nearLeg: [[38, 50], [42, 62]],
    farLeg: [[23, 50], [18, 62]],
  },
  /** Both palms thrust out at once, the whole body behind them. */
  spiritPalm: {
    head: [38, 16],
    shoulder: [35, 24],
    hip: [30, 38],
    nearArm: [[43, 25], [51, 26]],
    farArm: [[42, 27], [50, 29]],
    nearLeg: [[39, 50], [44, 62]],
    farLeg: [[23, 50], [18, 62]],
  },
  /** On one leg, the other knee raised, arms spread like wings with the hands hooked: waiting. */
  craneStance: {
    head: [33, 12],
    shoulder: [31, 20],
    hip: [30, 36],
    nearArm: [[39, 17], [46, 20]],
    farArm: [[23, 18], [17, 22]],
    nearLeg: [[38, 34], [35, 44]],
    farLeg: [[30, 49], [30, 62]],
  },
  /** The answer: stepping down into a beak-hand strike, fingertips first. */
  craneAnswer: {
    head: [38, 14],
    shoulder: [35, 21],
    hip: [30, 37],
    nearArm: [[43, 20], [52, 19]],
    farArm: [[25, 19], [19, 16]],
    nearLeg: [[39, 50], [44, 62]],
    farLeg: [[24, 50], [19, 62]],
  },
};
