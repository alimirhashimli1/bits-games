import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

/*
 * Kenji's poses as joint positions inside a 48×48 frame, facing right.
 * Feet on the ground rest on row 47, and the body's centre line is near x = 24,
 * so the sprite stays in place when it is flipped to face left.
 */

/** Upright "running stance": fast, but cannot attack or block. */
const STAND: HumanoidPose = {
  head: [26, 8],
  shoulder: [24, 15],
  hip: [23, 29],
  nearArm: [[25, 22], [26, 28]],
  farArm: [[22, 22], [21, 28]],
  nearLeg: [[25, 38], [26, 47]],
  farLeg: [[22, 38], [21, 47]],
};

/** Low, wide "fighting stance" with fists up. */
const FIGHT: HumanoidPose = {
  head: [26, 11],
  shoulder: [24, 17],
  hip: [22, 30],
  nearArm: [[29, 22], [32, 17]],
  farArm: [[26, 23], [29, 20]],
  nearLeg: [[28, 38], [31, 47]],
  farLeg: [[18, 38], [15, 47]],
};

/** Leaning back on the far leg with the near leg raised, before a kick. */
const KICK_CHAMBER: HumanoidPose = {
  head: [23, 11],
  shoulder: [22, 17],
  hip: [22, 30],
  nearArm: [[25, 22], [28, 19]],
  farArm: [[21, 23], [24, 21]],
  nearLeg: [[29, 31], [29, 40]],
  farLeg: [[20, 38], [19, 47]],
};

const KICK_HIGH: HumanoidPose = {
  head: [19, 13],
  shoulder: [20, 19],
  hip: [22, 30],
  nearArm: [[23, 23], [26, 20]],
  farArm: [[18, 24], [21, 22]],
  nearLeg: [[30, 24], [39, 17]],
  farLeg: [[21, 39], [20, 47]],
};

const PUNCH_HIGH: HumanoidPose = {
  ...FIGHT,
  head: [27, 11],
  shoulder: [25, 17],
  nearArm: [[31, 14], [38, 11]],
  farArm: [[22, 23], [25, 21]],
};

export const HERO_POSES = {
  stand: STAND,
  stanceShift: {
    head: [26, 9],
    shoulder: [24, 16],
    hip: [23, 29],
    nearArm: [[27, 22], [29, 19]],
    farArm: [[24, 22], [26, 21]],
    nearLeg: [[26, 38], [28, 47]],
    farLeg: [[20, 38], [18, 47]],
  },

  run1: {
    head: [28, 9],
    shoulder: [25, 15],
    hip: [23, 29],
    nearArm: [[21, 21], [18, 26]],
    farArm: [[29, 20], [32, 24]],
    nearLeg: [[29, 38], [33, 47]],
    farLeg: [[18, 37], [14, 44]],
  },
  run2: {
    head: [28, 8],
    shoulder: [25, 14],
    hip: [23, 28],
    nearArm: [[23, 21], [25, 27]],
    farArm: [[25, 21], [27, 26]],
    nearLeg: [[24, 38], [23, 47]],
    farLeg: [[27, 35], [22, 41]],
  },
  run3: {
    head: [28, 9],
    shoulder: [25, 15],
    hip: [23, 29],
    nearArm: [[29, 20], [32, 24]],
    farArm: [[21, 21], [18, 26]],
    nearLeg: [[18, 37], [14, 44]],
    farLeg: [[29, 38], [33, 47]],
  },
  run4: {
    head: [28, 8],
    shoulder: [25, 14],
    hip: [23, 28],
    nearArm: [[25, 21], [27, 26]],
    farArm: [[23, 21], [25, 27]],
    nearLeg: [[27, 35], [22, 41]],
    farLeg: [[24, 38], [23, 47]],
  },

  fight: FIGHT,
  fightBreath: {
    ...FIGHT,
    head: [26, 12],
    shoulder: [24, 18],
    nearArm: [[29, 23], [32, 18]],
    farArm: [[26, 24], [29, 21]],
  },
  walkClose: {
    ...FIGHT,
    head: [26, 10],
    shoulder: [24, 16],
    hip: [23, 29],
    nearArm: [[29, 21], [32, 16]],
    farArm: [[26, 22], [29, 19]],
    nearLeg: [[26, 38], [27, 47]],
    farLeg: [[21, 38], [20, 47]],
  },

  punchWindup: {
    ...FIGHT,
    shoulder: [23, 17],
    nearArm: [[19, 22], [23, 21]],
    farArm: [[27, 22], [30, 18]],
  },
  punchHigh: PUNCH_HIGH,
  punchMid: { ...PUNCH_HIGH, nearArm: [[32, 17], [39, 17]] },
  punchLow: { ...PUNCH_HIGH, head: [27, 12], shoulder: [25, 18], nearArm: [[31, 22], [37, 26]] },

  kickChamber: KICK_CHAMBER,
  kickHigh: KICK_HIGH,
  kickMid: {
    ...KICK_HIGH,
    head: [20, 12],
    shoulder: [21, 18],
    nearArm: [[24, 22], [27, 19]],
    farArm: [[19, 23], [22, 21]],
    nearLeg: [[31, 28], [41, 27]],
  },
  kickLow: {
    ...KICK_HIGH,
    head: [21, 12],
    shoulder: [22, 18],
    nearArm: [[25, 22], [28, 19]],
    farArm: [[20, 23], [23, 21]],
    nearLeg: [[31, 34], [40, 41]],
  },

  /** Forearm raised above the forehead. */
  blockHigh: { ...FIGHT, nearArm: [[30, 12], [25, 6]] },
  /** Forearm sweeping down in front of the knees. */
  blockLow: {
    ...FIGHT,
    head: [26, 13],
    shoulder: [25, 18],
    nearArm: [[29, 24], [33, 32]],
    farArm: [[26, 24], [29, 21]],
  },

  hit: {
    head: [21, 12],
    shoulder: [22, 18],
    hip: [22, 30],
    nearArm: [[18, 22], [15, 26]],
    farArm: [[19, 21], [16, 24]],
    nearLeg: [[27, 39], [29, 47]],
    farLeg: [[18, 39], [15, 47]],
  },
  fallBack: {
    head: [15, 25],
    shoulder: [18, 29],
    hip: [25, 37],
    nearArm: [[13, 27], [10, 23]],
    farArm: [[16, 33], [12, 36]],
    nearLeg: [[31, 40], [33, 47]],
    farLeg: [[29, 42], [31, 47]],
  },
  lying: {
    head: [7, 43],
    headTurns: 1,
    shoulder: [12, 44],
    hip: [26, 44],
    nearArm: [[17, 46], [21, 47]],
    farArm: [[8, 46], [4, 47]],
    nearLeg: [[33, 41], [40, 46]],
    farLeg: [[34, 45], [42, 47]],
  },
} as const satisfies Record<string, HumanoidPose>;

export type HeroPoseName = keyof typeof HERO_POSES;
