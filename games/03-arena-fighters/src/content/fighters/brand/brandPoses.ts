import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Brand's poses as joint positions inside a 64×64 frame, facing right. Feet on the ground
 * rest on row 62, leaving row 63 for the outline, and the body's centre is near x = 32.
 * "Near" limbs are the ones closer to the viewer: his lead hand and front leg.
 */

/** Side-on fighting stance, fists up. Most standing poses start from here. */
const STANCE: HumanoidPose = {
  head: [35, 11],
  shoulder: [32, 19],
  hip: [30, 36],
  nearArm: [[37, 26], [42, 20]],
  farArm: [[31, 27], [37, 22]],
  nearLeg: [[36, 49], [39, 62]],
  farLeg: [[25, 49], [22, 62]],
};

/** Low crouch, still guarding. */
const CROUCH: HumanoidPose = {
  head: [38, 32],
  shoulder: [35, 39],
  hip: [28, 50],
  nearArm: [[40, 46], [45, 40]],
  farArm: [[34, 47], [40, 42]],
  nearLeg: [[40, 51], [40, 62]],
  farLeg: [[31, 57], [22, 62]],
};

/** Knees pulled up at the top of a jump. Jumping attacks start from here. */
const JUMP_TUCK: HumanoidPose = {
  head: [34, 14],
  shoulder: [32, 21],
  hip: [30, 37],
  nearArm: [[37, 26], [41, 21]],
  farArm: [[29, 28], [34, 24]],
  nearLeg: [[39, 38], [37, 48]],
  farLeg: [[35, 42], [29, 49]],
};

/** Leaning back on the far leg, before and after his kicks. */
const KICK_LEAN = {
  head: [30, 11],
  shoulder: [29, 19],
  hip: [31, 36],
  nearArm: [[34, 26], [38, 21]],
  farArm: [[28, 27], [33, 23]],
  farLeg: [[29, 49], [28, 62]],
} as const;

export const BRAND_POSES: FighterPoses = {
  idle1: STANCE,
  idle2: {
    ...STANCE,
    head: [35, 12],
    shoulder: [32, 20],
    nearArm: [[37, 27], [42, 21]],
    farArm: [[31, 28], [37, 23]],
  },

  walk1: { ...STANCE, nearLeg: [[37, 49], [41, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: {
    ...STANCE,
    head: [35, 10],
    shoulder: [32, 18],
    nearLeg: [[34, 48], [34, 62]],
    farLeg: [[30, 47], [29, 58]],
  },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: {
    ...STANCE,
    head: [35, 10],
    shoulder: [32, 18],
    nearLeg: [[32, 47], [32, 58]],
    farLeg: [[31, 48], [31, 62]],
  },

  crouch: CROUCH,

  jumpRise: {
    head: [34, 10],
    shoulder: [32, 18],
    hip: [31, 35],
    nearArm: [[37, 23], [41, 17]],
    farArm: [[29, 25], [34, 21]],
    nearLeg: [[37, 45], [35, 55]],
    farLeg: [[28, 46], [26, 57]],
  },
  jumpTuck: JUMP_TUCK,
  jumpFall: {
    head: [34, 11],
    shoulder: [32, 19],
    hip: [31, 36],
    nearArm: [[37, 24], [41, 18]],
    farArm: [[29, 26], [34, 22]],
    nearLeg: [[35, 48], [37, 59]],
    farLeg: [[28, 48], [26, 60]],
  },

  blockStand: {
    ...STANCE,
    head: [32, 12],
    shoulder: [30, 20],
    nearArm: [[36, 24], [36, 14]],
    farArm: [[34, 26], [39, 19]],
    nearLeg: [[35, 49], [38, 62]],
  },
  blockCrouch: {
    ...CROUCH,
    head: [35, 33],
    shoulder: [33, 40],
    nearArm: [[39, 43], [39, 33]],
    farArm: [[37, 45], [42, 38]],
  },

  hitStand: {
    ...STANCE,
    head: [28, 12],
    shoulder: [28, 20],
    hip: [31, 36],
    nearArm: [[32, 28], [35, 33]],
    farArm: [[25, 27], [22, 32]],
    farLeg: [[26, 49], [22, 62]],
  },
  hitCrouch: {
    ...CROUCH,
    head: [32, 34],
    shoulder: [31, 41],
    hip: [28, 51],
    nearArm: [[35, 47], [38, 51]],
    farArm: [[28, 47], [25, 52]],
  },
  fall: {
    head: [21, 24],
    shoulder: [26, 28],
    hip: [36, 37],
    nearArm: [[22, 33], [16, 35]],
    farArm: [[25, 23], [20, 19]],
    nearLeg: [[44, 44], [49, 52]],
    farLeg: [[41, 47], [44, 56]],
  },
  lying: {
    head: [12, 56],
    headTurns: 1,
    shoulder: [19, 58],
    hip: [35, 58],
    nearArm: [[24, 60], [30, 61]],
    farArm: [[18, 61], [11, 62]],
    nearLeg: [[44, 56], [52, 61]],
    farLeg: [[45, 59], [54, 62]],
  },
  getUp: {
    head: [35, 27],
    shoulder: [32, 34],
    hip: [29, 47],
    nearArm: [[35, 41], [38, 47]],
    farArm: [[29, 40], [27, 46]],
    nearLeg: [[39, 49], [40, 62]],
    farLeg: [[31, 61], [22, 62]],
  },

  win1: {
    head: [33, 11],
    shoulder: [31, 19],
    hip: [30, 36],
    nearArm: [[35, 12], [36, 4]],
    farArm: [[27, 27], [29, 33]],
    nearLeg: [[34, 49], [36, 62]],
    farLeg: [[27, 49], [25, 62]],
  },
  win2: {
    head: [33, 12],
    shoulder: [31, 20],
    hip: [30, 36],
    nearArm: [[37, 14], [39, 7]],
    farArm: [[27, 28], [29, 34]],
    nearLeg: [[34, 49], [36, 62]],
    farLeg: [[27, 49], [25, 62]],
  },

  /** Lead-hand jab at head height. */
  standLP: { ...STANCE, head: [36, 11], shoulder: [33, 19], nearArm: [[42, 19], [50, 18]], farArm: [[32, 27], [38, 22]] },
  /** Twisting back before the rear-hand straight. */
  standHPWindup: { ...STANCE, head: [33, 11], shoulder: [30, 19], nearArm: [[35, 26], [40, 21]], farArm: [[25, 25], [28, 19]] },
  standHP: {
    head: [37, 12],
    shoulder: [35, 20],
    hip: [31, 36],
    nearArm: [[37, 28], [40, 24]],
    farArm: [[44, 19], [53, 18]],
    nearLeg: [[37, 49], [40, 62]],
    farLeg: [[27, 49], [24, 62]],
  },
  /** Front snap kick at the stomach. */
  standLK: { ...KICK_LEAN, nearLeg: [[41, 40], [51, 39]] },
  /** Knee drawn up before the roundhouse. */
  standHKWindup: { ...KICK_LEAN, nearLeg: [[39, 33], [38, 44]] },
  standHK: {
    head: [26, 13],
    shoulder: [27, 21],
    hip: [31, 36],
    nearArm: [[31, 27], [34, 23]],
    farArm: [[24, 28], [20, 31]],
    nearLeg: [[42, 27], [53, 20]],
    farLeg: [[30, 49], [29, 62]],
  },

  /** Low jab from the crouch. */
  crouchLP: { ...CROUCH, nearArm: [[45, 40], [52, 40]] },
  /** Rising uppercut out of the crouch, to meet jump-ins. */
  crouchHP: { ...CROUCH, head: [37, 28], shoulder: [35, 35], hip: [29, 49], nearArm: [[40, 31], [42, 21]] },
  /** Short poke at the shins, foot along the floor. */
  crouchLK: { ...CROUCH, nearLeg: [[41, 55], [52, 62]] },
  /** Low sweep, leaning over the far knee. */
  crouchHK: {
    head: [31, 35],
    shoulder: [31, 41],
    hip: [30, 51],
    nearArm: [[35, 48], [36, 55]],
    farArm: [[29, 48], [26, 55]],
    nearLeg: [[42, 58], [56, 62]],
    farLeg: [[31, 60], [22, 62]],
  },

  jumpLP: { ...JUMP_TUCK, nearArm: [[40, 24], [47, 28]] },
  jumpHP: { ...JUMP_TUCK, nearArm: [[35, 28], [37, 24]], farArm: [[40, 26], [50, 31]] },
  /** Knee driven forward. */
  jumpLK: { ...JUMP_TUCK, nearLeg: [[40, 37], [45, 45]] },
  /** Flying kick, the leg aimed down and forward. */
  jumpHK: {
    head: [29, 14],
    shoulder: [30, 21],
    hip: [32, 36],
    nearArm: [[34, 26], [38, 22]],
    farArm: [[28, 28], [24, 31]],
    nearLeg: [[41, 43], [51, 51]],
    farLeg: [[33, 44], [27, 49]],
  },
};

/**
 * Kicks thrown with the leg nearly straight and the hips turned into them, reaching well past a
 * jab, so they are worth throwing from outside punching range. Brand kicks this way, and so do
 * Rajab and Mahmood; the others who share his body keep the shorter kicks above.
 */
export const REACHING_KICKS: Pick<FighterPoses, 'standLK' | 'standHK' | 'crouchLK' | 'crouchHK'> = {
  /** Front snap kick at the stomach, the leg straight out. */
  standLK: { ...KICK_LEAN, hip: [32, 36], nearLeg: [[45, 37], [58, 38]] },
  standHK: {
    head: [26, 13],
    shoulder: [27, 21],
    hip: [33, 37],
    nearArm: [[31, 27], [34, 23]],
    farArm: [[24, 28], [20, 31]],
    nearLeg: [[46, 31], [59, 26]],
    farLeg: [[30, 49], [29, 62]],
  },
  /** Poke at the shins, the leg stretched along the floor. */
  crouchLK: { ...CROUCH, nearLeg: [[41, 57], [54, 62]] },
  /** Low sweep, the hips pushed forward into it. */
  crouchHK: {
    head: [33, 35],
    shoulder: [33, 41],
    hip: [32, 51],
    nearArm: [[37, 48], [38, 55]],
    farArm: [[31, 48], [28, 55]],
    nearLeg: [[45, 57], [59, 62]],
    farLeg: [[33, 60], [24, 62]],
  },
};

/** Poses for Ember Shot and Flare Rise. */
export const BRAND_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Both hands drawn back to the hip, gathering the fire. */
  emberWindup: {
    head: [33, 12],
    shoulder: [31, 20],
    hip: [30, 36],
    nearArm: [[28, 28], [25, 32]],
    farArm: [[27, 29], [24, 33]],
    nearLeg: [[37, 49], [41, 62]],
    farLeg: [[24, 49], [20, 62]],
  },
  /** Both palms thrust forward at chest height. */
  emberRelease: {
    head: [36, 12],
    shoulder: [34, 20],
    hip: [30, 36],
    nearArm: [[42, 22], [50, 22]],
    farArm: [[41, 24], [49, 25]],
    nearLeg: [[38, 49], [42, 62]],
    farLeg: [[24, 49], [20, 62]],
  },
  /** Sunk low with the fist cocked by the knee, a moment before the leap. */
  flareCrouch: {
    head: [37, 31],
    shoulder: [34, 38],
    hip: [28, 50],
    nearArm: [[37, 46], [40, 52]],
    farArm: [[31, 45], [35, 42]],
    nearLeg: [[40, 51], [40, 62]],
    farLeg: [[31, 57], [22, 62]],
  },
  /** Leaping flat and low, the fist driven straight out in front at shoulder height, the back leg trailing. */
  flareRise: {
    head: [38, 15],
    shoulder: [36, 22],
    hip: [29, 36],
    nearArm: [[46, 21], [57, 21]],
    farArm: [[30, 28], [27, 32]],
    nearLeg: [[39, 43], [37, 55]],
    farLeg: [[22, 46], [12, 52]],
  },
};
