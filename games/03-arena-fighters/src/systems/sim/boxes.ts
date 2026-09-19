import type { HumanoidPose } from '@shared/pixel-art/humanoidRig';
import type { Point } from '@shared/pixel-art/pixelGrid';

import { FIGHTER_FRAME, poseFor, type FighterArt } from '../../content/fighters/fighterArt';
import { fighterData } from '../../content/fighters/fighterData';
import { segmentAt, type Limb } from '../../content/fighters/moves';
import type { AnyPoseName } from '../../content/fighters/poseNames';
import type { FighterId } from '../../content/roster';
import { isInvulnerable, moveOf } from './attacks';
import { toSubpixels, type FighterState } from './fightState';
import { poseOf } from './pose';

/** A box in the arena, in sub-pixels: `left` and `bottom` are its lower-left corner, and y grows upwards. */
export interface Box {
  readonly left: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Where a pose can be hit and what it strikes with, in pixels relative to the fighter's feet
 * when facing right: x from the body's centre line, y upwards from the floor.
 */
interface PoseGeometry {
  readonly hurtboxes: readonly Box[];
  readonly limbEnds: Readonly<Record<Limb, Point>>;
}

const geometryCache = new Map<string, PoseGeometry>();

/**
 * The places a fighter can be hit this step. They are worked out from the pose itself (head,
 * torso and each limb), so an outstretched fist or foot can be hit, and every fighter gets
 * boxes that fit their own build without drawing any by hand.
 */
export function hurtboxes(fighter: FighterState): readonly Box[] {
  // Nobody can be hit while knocked down, in the middle of being thrown, or at the start of a rising special.
  if (fighter.status.kind === 'knockdown' || fighter.status.kind === 'thrown' || isInvulnerable(fighter)) return [];
  return geometry(fighter.character, poseOf(fighter)).hurtboxes.map((box) => toArena(fighter, box));
}

/** The box a move strikes with on this step, if the move is in its active frames. */
export function hitbox(fighter: FighterState): Box | null {
  const move = moveOf(fighter);
  if (!move || !fighter.attack) return null;
  const segment = segmentAt(move, fighter.attack.step);
  if (!segment?.strike) return null;

  const { limb, width, height } = segment.strike;
  const [x, y] = geometry(fighter.character, segment.pose).limbEnds[limb];
  const local = { left: x - Math.floor(width / 2), bottom: y - Math.floor(height / 2), width, height };
  return toArena(fighter, local);
}

/** Where the end of one of the fighter's limbs is this step, in the arena, in sub-pixels. */
export function limbPosition(fighter: FighterState, limb: Limb): { readonly x: number; readonly y: number } {
  const [x, y] = geometry(fighter.character, poseOf(fighter)).limbEnds[limb];
  return { x: fighter.x + fighter.facing * toSubpixels(x), y: fighter.y + toSubpixels(y) };
}

export function overlaps(a: Box, b: Box): boolean {
  return a.left < b.left + b.width && b.left < a.left + a.width && a.bottom < b.bottom + b.height && b.bottom < a.bottom + a.height;
}

/** Turns a box in pixels around the fighter into sub-pixels in the arena, mirrored when facing left. */
function toArena(fighter: FighterState, box: Box): Box {
  const width = toSubpixels(box.width);
  const offset = toSubpixels(box.left);
  return {
    left: fighter.facing === 1 ? fighter.x + offset : fighter.x - offset - width,
    bottom: fighter.y + toSubpixels(box.bottom),
    width,
    height: toSubpixels(box.height),
  };
}

function geometry(character: FighterId, pose: AnyPoseName): PoseGeometry {
  const key = `${character}:${pose}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;

  const art = fighterData(character).art;
  const computed = measurePose(poseFor(art, pose), art);
  geometryCache.set(key, computed);
  return computed;
}

function measurePose(pose: HumanoidPose, { body }: FighterArt): PoseGeometry {
  const { thickness } = body;
  const armPad = Math.floor(Math.max(thickness.upperArm, thickness.fist) / 2);
  const legPad = Math.floor(thickness.leg / 2);
  return {
    hurtboxes: [
      headBox(pose, body.head),
      around([pose.shoulder, pose.hip], Math.floor(thickness.torso / 2)),
      around([pose.shoulder, ...pose.nearArm], armPad),
      around([pose.shoulder, ...pose.farArm], armPad),
      around([pose.hip, ...pose.nearLeg], legPad),
      around([pose.hip, ...pose.farLeg], legPad),
    ],
    limbEnds: {
      nearHand: local(pose.nearArm[1]),
      farHand: local(pose.farArm[1]),
      nearFoot: local(pose.nearLeg[1]),
      farFoot: local(pose.farLeg[1]),
      head: local(pose.head),
    },
  };
}

/** A frame pixel as a point around the feet: x from the centre line, y upwards. */
function local([x, y]: Point): Point {
  return [x - FIGHTER_FRAME.centerX, FIGHTER_FRAME.floorRow - y];
}

/** The smallest box holding every point, grown by `pad` pixels on each side. */
function around(points: readonly Point[], pad: number): Box {
  const xs = points.map((point) => local(point)[0]);
  const ys = points.map((point) => local(point)[1]);
  const left = Math.min(...xs) - pad;
  const bottom = Math.min(...ys) - pad;
  return { left, bottom, width: Math.max(...xs) + pad + 1 - left, height: Math.max(...ys) + pad + 1 - bottom };
}

/** The head's own size, turned on its side when the pose turns it. */
function headBox(pose: HumanoidPose, head: readonly string[]): Box {
  const sideways = (pose.headTurns ?? 0) % 2 === 1;
  const mapWidth = head[0]?.length ?? 0;
  const [width, height] = sideways ? [head.length, mapWidth] : [mapWidth, head.length];
  const [x, y] = local(pose.head);
  // Pixel rows count downwards in the frame; the head's lowest row is its bottom edge.
  const top = y + Math.floor(height / 2);
  return { left: x - Math.floor(width / 2), bottom: top - height + 1, width, height };
}
