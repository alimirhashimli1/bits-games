import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';

/**
 * Every pose each fighter must provide. Because all fighters share these names, they share
 * the animations built from them, and later the moves that show them.
 */
export const POSE_NAMES = [
  // Moving
  'idle1',
  'idle2',
  'walk1',
  'walk2',
  'walk3',
  'walk4',
  'crouch',
  'jumpRise',
  'jumpTuck',
  'jumpFall',
  // Defending and being hit
  'blockStand',
  'blockCrouch',
  'hitStand',
  'hitCrouch',
  'fall',
  'lying',
  'getUp',
  // Winning
  'win1',
  'win2',
  // Normal attacks. A windup pose leads into the heavier ones.
  'standLP',
  'standHPWindup',
  'standHP',
  'standLK',
  'standHKWindup',
  'standHK',
  'crouchLP',
  'crouchHP',
  'crouchLK',
  'crouchHK',
  'jumpLP',
  'jumpHP',
  'jumpLK',
  'jumpHK',
] as const;

export type PoseName = (typeof POSE_NAMES)[number];

/** Poses only special moves use. Each fighter draws the ones their own specials need. */
export const SPECIAL_POSE_NAMES = [
  'emberWindup',
  'emberRelease',
  'flareCrouch',
  'flareRise',
  'whirlKick1',
  'whirlKick2',
  'cartwheel1',
  'cartwheel2',
  'boulderReach',
  'boulderLift',
  'boulderHeave',
  'ramWindup',
  'ramCharge',
  'stompRaise',
  'stompDown',
  'rushWindup',
  'rushCharge',
  'palmLunge',
  'heelCrouch',
  'heelRise',
  'cardWindup',
  'cardRelease',
  'bluffStance',
  'bluffAnswer',
  'dartWindup',
  'dartThrow',
  'stingLunge',
  'tackleDive',
  'tackleDrive',
  'tacklePin',
  'adrenalineInject',
  'adrenalineFlex',
] as const;

export type SpecialPoseName = (typeof SPECIAL_POSE_NAMES)[number];

/** Any pose a move can show. */
export type AnyPoseName = PoseName | SpecialPoseName;

/** A fighter's full set of poses: leaving one out is a type error. */
export type FighterPoses = Readonly<Record<PoseName, HumanoidPose>>;
