import type { HumanoidBody, HumanoidPose } from '@shared/pixel-art/humanoidRig';
import type { Palette } from '@shared/pixel-art/pixelMap';

import { POSE_NAMES, type AnyPoseName, type FighterPoses, type PoseName, type SpecialPoseName } from './poseNames';

/**
 * How a fighter looks: their build and head, their poses, and their colours.
 * Frames are 64×64 pixels, facing right, with the feet on the bottom row and the body's
 * centre line on x = 32, so the sprite stays in place when it is flipped to face left.
 */
export interface FighterArt {
  readonly body: HumanoidBody;
  readonly poses: FighterPoses;
  /** Poses for this fighter's special moves only. */
  readonly specialPoses: Readonly<Partial<Record<SpecialPoseName, HumanoidPose>>>;
  readonly palette: Palette;
}

/** Looks up any pose a fighter can be in, special-move poses included. */
export function poseFor(art: FighterArt, name: AnyPoseName): HumanoidPose {
  const pose = isBasePose(name) ? art.poses[name] : art.specialPoses[name];
  if (!pose) throw new Error(`This fighter has no "${name}" pose.`);
  return pose;
}

function isBasePose(name: AnyPoseName): name is PoseName {
  return POSE_NAMES.some((base) => base === name);
}

export const FIGHTER_FRAME = {
  width: 64,
  height: 64,
  /** The column the body is centred on: the fighter's position in the fight. */
  centerX: 32,
  /** The row the feet stand on. The outline takes the row below it. */
  floorRow: 62,
} as const;
