import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Kestrel's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He crouches forward like a bird about to take off, light on the balls of his feet, arms held
 * out and back like folded wings. His plain jumps and falls are the same body mechanics as
 * Brand's, so those come from Brand's set; his jumping attacks are his own.
 */

/** Low and forward, arms out behind him. */
const STANCE: HumanoidPose = {
  head: [36, 14],
  shoulder: [33, 22],
  hip: [30, 38],
  nearArm: [[37, 28], [42, 25]],
  farArm: [[28, 27], [23, 24]],
  nearLeg: [[37, 50], [42, 62]],
  farLeg: [[24, 50], [19, 62]],
};

const CROUCH: HumanoidPose = {
  head: [38, 33],
  shoulder: [35, 40],
  hip: [28, 51],
  nearArm: [[40, 46], [45, 43]],
  farArm: [[31, 45], [26, 42]],
  nearLeg: [[40, 52], [42, 62]],
  farLeg: [[30, 58], [20, 62]],
};

/** Knees up at the top of a jump, arms swept back. His jumping attacks start from here. */
const AIR_TUCK: HumanoidPose = {
  head: [35, 14],
  shoulder: [32, 21],
  hip: [30, 37],
  nearArm: [[30, 26], [25, 23]],
  farArm: [[28, 25], [22, 21]],
  nearLeg: [[39, 38], [37, 48]],
  farLeg: [[35, 42], [29, 49]],
};

/** Rocking back on the rear leg, before and after his kicks. */
const KICK_LEAN = {
  head: [30, 14],
  shoulder: [30, 22],
  hip: [31, 38],
  nearArm: [[35, 27], [39, 24]],
  farArm: [[26, 27], [21, 24]],
  farLeg: [[29, 50], [28, 62]],
} as const;

export const KESTREL_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  /** Bobbing, the arms lifting a little like wings. */
  idle2: { ...STANCE, head: [36, 15], shoulder: [33, 23], nearArm: [[37, 28], [42, 24]], farArm: [[28, 26], [23, 22]] },

  walk1: { ...STANCE, nearLeg: [[38, 50], [43, 62]], farLeg: [[25, 50], [20, 62]] },
  walk2: { ...STANCE, head: [36, 13], shoulder: [33, 21], nearLeg: [[34, 49], [34, 62]], farLeg: [[30, 48], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 50], [24, 62]], farLeg: [[36, 50], [40, 62]] },
  walk4: { ...STANCE, head: [36, 13], shoulder: [33, 21], nearLeg: [[32, 48], [32, 58]], farLeg: [[31, 49], [31, 62]] },

  crouch: CROUCH,
  jumpTuck: AIR_TUCK,

  blockStand: { ...STANCE, head: [33, 15], shoulder: [31, 23], nearArm: [[37, 26], [37, 16]], farArm: [[35, 28], [40, 21]] },
  blockCrouch: { ...CROUCH, head: [35, 34], shoulder: [33, 41], nearArm: [[39, 43], [39, 33]], farArm: [[37, 45], [42, 38]] },

  hitStand: {
    ...STANCE,
    head: [29, 15],
    shoulder: [29, 23],
    hip: [31, 38],
    nearArm: [[33, 30], [36, 35]],
    farArm: [[25, 29], [21, 34]],
  },
  hitCrouch: { ...CROUCH, head: [32, 35], shoulder: [31, 42], hip: [28, 52], nearArm: [[35, 48], [38, 52]], farArm: [[28, 48], [25, 53]] },

  /** Arms spread wide like wings... */
  win1: {
    head: [33, 12],
    shoulder: [32, 20],
    hip: [31, 36],
    nearArm: [[40, 16], [48, 12]],
    farArm: [[24, 16], [16, 12]],
    nearLeg: [[34, 49], [36, 62]],
    farLeg: [[28, 49], [26, 62]],
  },
  /** ...then up on one foot, wings raised. */
  win2: {
    head: [33, 11],
    shoulder: [32, 19],
    hip: [31, 35],
    nearArm: [[39, 11], [45, 4]],
    farArm: [[25, 11], [19, 4]],
    nearLeg: [[37, 43], [33, 50]],
    farLeg: [[31, 49], [31, 62]],
  },

  /** A quick claw at the face. */
  standLP: { ...STANCE, head: [37, 14], shoulder: [34, 22], nearArm: [[42, 21], [49, 19]] },
  /** Winding the rear arm right back... */
  standHPWindup: { ...STANCE, head: [33, 14], shoulder: [31, 22], farArm: [[24, 20], [19, 15]] },
  /** ...and raking it over and down. */
  standHP: {
    ...STANCE,
    head: [38, 15],
    shoulder: [35, 23],
    nearArm: [[36, 30], [33, 33]],
    farArm: [[43, 20], [51, 23]],
  },
  /** A snap kick at the stomach. */
  standLK: { ...KICK_LEAN, nearLeg: [[42, 42], [52, 43]] },
  standHKWindup: { ...KICK_LEAN, nearLeg: [[39, 35], [38, 46]] },
  /** A high crescent kick. */
  standHK: {
    head: [26, 17],
    shoulder: [27, 24],
    hip: [31, 38],
    nearArm: [[31, 29], [35, 27]],
    farArm: [[23, 30], [18, 28]],
    nearLeg: [[42, 29], [53, 22]],
    farLeg: [[30, 50], [29, 62]],
  },

  crouchLP: { ...CROUCH, nearArm: [[45, 43], [52, 43]] },
  /** Springing up out of the crouch with a rising claw, against jump-ins. */
  crouchHP: { ...CROUCH, head: [38, 29], shoulder: [35, 36], hip: [29, 50], nearArm: [[40, 29], [42, 19]] },
  crouchLK: { ...CROUCH, nearLeg: [[42, 56], [53, 62]] },
  /** A low sweep. */
  crouchHK: {
    head: [30, 37],
    shoulder: [31, 43],
    hip: [31, 52],
    nearArm: [[35, 50], [36, 57]],
    farArm: [[27, 50], [24, 57]],
    nearLeg: [[44, 58], [56, 62]],
    farLeg: [[30, 60], [21, 62]],
  },

  jumpLP: { ...AIR_TUCK, nearArm: [[40, 25], [47, 29]] },
  /** Both arms raked down in front, like talons. */
  jumpHP: { ...AIR_TUCK, nearArm: [[40, 27], [47, 34]], farArm: [[38, 28], [44, 36]] },
  /** A knee driven forward. */
  jumpLK: { ...AIR_TUCK, nearLeg: [[41, 37], [46, 45]] },
  /** Both feet thrust down and forward. */
  jumpHK: {
    head: [29, 15],
    shoulder: [30, 22],
    hip: [33, 36],
    nearArm: [[28, 27], [23, 24]],
    farArm: [[27, 26], [21, 22]],
    nearLeg: [[41, 43], [50, 51]],
    farLeg: [[39, 45], [47, 53]],
  },
};

/** Poses for Talon Dive and Wall Leap. */
export const KESTREL_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** Diving steeply, one foot driven down in front like a talon, the arms swept back. */
  talonDive: {
    head: [28, 16],
    shoulder: [30, 23],
    hip: [35, 36],
    nearArm: [[27, 28], [22, 25]],
    farArm: [[26, 26], [20, 22]],
    nearLeg: [[42, 46], [48, 57]],
    farLeg: [[32, 45], [27, 52]],
  },
  /** Tumbling backwards through the air in a tight ball. */
  wallFlip: {
    head: [27, 27],
    shoulder: [30, 31],
    hip: [36, 38],
    nearArm: [[34, 36], [39, 41]],
    farArm: [[31, 37], [35, 42]],
    nearLeg: [[42, 32], [44, 40]],
    farLeg: [[40, 35], [41, 43]],
  },
  /** Flying flat off the wall, both feet out in front. */
  wallPounce: {
    head: [22, 28],
    shoulder: [27, 31],
    hip: [37, 36],
    nearArm: [[25, 25], [20, 21]],
    farArm: [[24, 27], [18, 24]],
    nearLeg: [[46, 37], [56, 39]],
    farLeg: [[45, 40], [55, 43]],
  },
};
