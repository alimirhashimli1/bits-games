import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import { BRAND_POSES } from '../brand/brandPoses';
import type { FighterPoses, SpecialPoseName } from '../poseNames';

/*
 * Osal's poses, in the same 64×64 frame as everyone's (feet on row 62, centre near x = 32).
 * He stands in a soldier's guard, low and square, and fights with what he carries. His strikes,
 * jumps and falls share Brand's body mechanics, so those come from Brand's set.
 */

/** Low and square, both hands up in front of him. */
const STANCE: HumanoidPose = {
  head: [36, 13],
  shoulder: [33, 21],
  hip: [30, 38],
  nearArm: [[38, 28], [43, 23]],
  farArm: [[33, 29], [38, 25]],
  nearLeg: [[37, 50], [41, 62]],
  farLeg: [[24, 50], [20, 62]],
};

export const OSAL_POSES: FighterPoses = {
  ...BRAND_POSES,

  idle1: STANCE,
  idle2: { ...STANCE, head: [36, 14], shoulder: [33, 22], nearArm: [[38, 29], [43, 24]], farArm: [[33, 30], [38, 26]] },

  walk1: { ...STANCE, nearLeg: [[38, 50], [42, 62]], farLeg: [[25, 50], [20, 62]] },
  walk2: { ...STANCE, head: [36, 12], shoulder: [33, 20], nearLeg: [[35, 49], [35, 62]], farLeg: [[30, 48], [29, 58]] },
  walk3: { ...STANCE, nearLeg: [[27, 50], [24, 62]], farLeg: [[36, 50], [40, 62]] },
  walk4: { ...STANCE, head: [36, 12], shoulder: [33, 20], nearLeg: [[33, 48], [33, 58]], farLeg: [[31, 49], [31, 62]] },

  /** A salute... */
  win1: { ...STANCE, head: [34, 11], shoulder: [32, 19], hip: [30, 36], nearArm: [[39, 17], [37, 10]], farArm: [[29, 27], [30, 34]] },
  /** ...then standing at ease. */
  win2: { ...STANCE, head: [34, 11], shoulder: [32, 19], hip: [30, 36], nearArm: [[34, 27], [31, 34]], farArm: [[28, 27], [29, 34]] },
};

/**
 * His service rifle, facing right: a wooden stock at the butt, the receiver and magazine in the
 * middle, and the barrel running out in front. Its symbols come from Osal's own palette, and the
 * figure's outline wraps it like the rest of him.
 */
const RIFLE: PixelMap = [
  '........gg..............',
  'nnnnnngggggggggggggggg..',
  'nnnnnnggggggggggggggggg.',
  '.nnnnn..ggg.............',
  '.........gg.............',
];

/** The same rifle the moment it goes off, with the muzzle flash on the end of the barrel. */
const RIFLE_FIRING: PixelMap = [
  '........gg.............y....',
  'nnnnnngggggggggggggggggyYy..',
  'nnnnnngggggggggggggggggYYYy.',
  '.nnnnn..ggg............yYy..',
  '.........gg.............y...',
];

/** The grenade in his fist, before he lets go of it. */
const HELD_GRENADE: PixelMap = ['.vv.', 'vvvv', 'vvvv', '.vv.'];

/** Poses for Rifle Shot and Grenade. */
export const OSAL_SPECIAL_POSES: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>> = {
  /** The rifle up at his shoulder, cheek down on the stock, front hand under the barrel. */
  rifleAim: {
    head: [34, 13],
    shoulder: [32, 21],
    hip: [30, 38],
    nearArm: [[38, 28], [44, 27]],
    farArm: [[32, 29], [36, 27]],
    nearLeg: [[36, 50], [40, 62]],
    farLeg: [[24, 50], [20, 62]],
    prop: { map: RIFLE, at: [24, 23] },
  },
  /** The shot: the whole rifle driven back into his shoulder, flame off the muzzle. */
  rifleFire: {
    head: [33, 13],
    shoulder: [31, 21],
    hip: [30, 38],
    nearArm: [[37, 28], [43, 27]],
    farArm: [[31, 29], [35, 27]],
    nearLeg: [[36, 50], [40, 62]],
    farLeg: [[24, 50], [20, 62]],
    prop: { map: RIFLE_FIRING, at: [23, 23] },
  },
  /** Pin out, the grenade cocked back beside his ear. */
  grenadePull: {
    head: [34, 13],
    shoulder: [32, 21],
    hip: [30, 38],
    nearArm: [[34, 24], [30, 18]],
    farArm: [[31, 28], [35, 26]],
    nearLeg: [[35, 50], [39, 62]],
    farLeg: [[25, 50], [21, 62]],
    prop: { map: HELD_GRENADE, at: [28, 16] },
  },
  /** The throw: a long overarm lob, the other arm swung back behind him. */
  grenadeThrow: {
    head: [36, 13],
    shoulder: [33, 21],
    hip: [30, 38],
    nearArm: [[40, 18], [47, 20]],
    farArm: [[31, 28], [28, 32]],
    nearLeg: [[38, 50], [43, 62]],
    farLeg: [[24, 50], [20, 62]],
  },
};
