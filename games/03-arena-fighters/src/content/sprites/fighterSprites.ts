import { drawHumanoid } from '@shared/pixel-art/humanoidRig';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteAssets } from '@shared/phaser/pixelSprites';

import type { FighterArt } from '../fighters/fighterArt';
import { POSE_NAMES, type PoseName } from '../fighters/poseNames';

interface AnimationShape {
  readonly frames: readonly PoseName[];
  readonly frameRate: number;
  /** -1 loops forever; left out, the animation plays once and holds its last frame. */
  readonly repeat?: number;
}

/**
 * The looping and multi-frame animations every fighter has, built from the shared pose names.
 * Single poses (crouch, the jump frames, blocks, hits and every attack) are shown as frames.
 */
const ANIMATIONS = {
  idle: { frames: ['idle1', 'idle2'], frameRate: 3, repeat: -1 },
  walkForward: { frames: ['walk1', 'walk2', 'walk3', 'walk4'], frameRate: 8, repeat: -1 },
  walkBack: { frames: ['walk4', 'walk3', 'walk2', 'walk1'], frameRate: 7, repeat: -1 },
  jump: { frames: ['jumpRise', 'jumpTuck', 'jumpFall'], frameRate: 3, repeat: -1 },
  knockdown: { frames: ['hitStand', 'fall', 'lying'], frameRate: 6 },
  getUp: { frames: ['lying', 'getUp', 'idle1'], frameRate: 5 },
  win: { frames: ['win1', 'win2'], frameRate: 3, repeat: -1 },
} as const satisfies Readonly<Record<string, AnimationShape>>;

export type FighterAnimationName = keyof typeof ANIMATIONS;

/** Animation keys are shared by the whole game, so each is prefixed with the fighter's sheet. */
export function fighterAnimationKey(sheetKey: string, name: FighterAnimationName): string {
  return `${sheetKey}-${name}`;
}

/**
 * Which of a fighter's two sheets to draw them from. Every fighter has a second one in alternate
 * colours (`altPalette`), which player 2 wears when both players have picked the same fighter.
 */
export function fighterSheetKey(id: string, alternate: boolean): string {
  return alternate ? `${id}-alt` : id;
}

/** Draws every pose of one fighter, special-move poses included, into a sprite sheet and builds their animations. */
export function createFighterSprites(sheetKey: string, art: FighterArt): SpriteAssets {
  const poses = [...POSE_NAMES.map((name) => [name, art.poses[name]] as const), ...Object.entries(art.specialPoses)];
  const frames: Record<string, PixelMap> = Object.fromEntries(
    poses.flatMap(([name, pose]) => (pose ? [[name, drawHumanoid(pose, art.body)]] : [])),
  );
  const animations: PixelAnimationDefinition[] = Object.entries(ANIMATIONS).map(([name, shape]) => ({
    ...shape,
    key: fighterAnimationKey(sheetKey, name as FighterAnimationName),
  }));
  return { sheet: { key: sheetKey, palette: art.palette, frames }, animations };
}
