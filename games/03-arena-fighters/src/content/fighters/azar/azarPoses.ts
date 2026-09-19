import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Azar's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands upright and precise, like a fencer, with his lead hand out. His strikes, jumps and
 * falls share Brand's body mechanics, so those come from Brand's set.
 */

/** Upright and side-on, lead hand forward, the other held back. */
const STANCE: HumanoidPose = {
  head: [34, 11],
  shoulder: [32, 19],
  hip: [30, 36],
  nearArm: [[37, 24], [42, 21]],
  farArm: [[28, 26], [26, 22]],
  nearLeg: [[36, 49], [40, 62]],
  farLeg: [[24, 49], [21, 62]],
};

export const AZAR_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  idle2: { ...STANCE, head: [34, 12], shoulder: [32, 20], nearArm: [[37, 25], [42, 22]] },

  walk1: { ...STANCE, nearLeg: [[37, 49], [41, 62]], farLeg: [[25, 49], [21, 62]] },
  walk2: { ...STANCE, head: [34, 10], shoulder: [32, 18], nearLeg: [[34, 48], [34, 62]], farLeg: [[30, 47], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 49], [24, 62]], farLeg: [[36, 49], [40, 62]] },
  walk4: { ...STANCE, head: [34, 10], shoulder: [32, 18], nearLeg: [[32, 47], [32, 58]], farLeg: [[31, 48], [31, 62]] },

  /** Pushing his glasses up his nose... */
  win1: { ...STANCE, nearArm: [[37, 20], [36, 12]] },
  /** ...and a small, satisfied nod. */
  win2: { ...STANCE, head: [35, 13], nearArm: [[36, 26], [37, 32]], farArm: [[28, 27], [27, 33]] },
};

/** Poses for Syringe Dart and Needle Sting. */
export const AZAR_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** The syringe drawn back beside his ear. */
  dartWindup: { ...STANCE, head: [33, 11], shoulder: [31, 19], nearArm: [[30, 17], [27, 11]] },
  /** Thrown overhand, arm following through. */
  dartThrow: { ...STANCE, head: [36, 12], shoulder: [34, 20], nearArm: [[41, 18], [50, 21]] },
  /** A fencer's lunge, arm straight, the back hand raised behind him. */
  stingLunge: {
    head: [39, 14],
    shoulder: [36, 21],
    hip: [30, 37],
    nearArm: [[45, 21], [54, 22]],
    farArm: [[27, 24], [23, 20]],
    nearLeg: [[41, 50], [46, 62]],
    farLeg: [[21, 51], [14, 62]],
  },
};
