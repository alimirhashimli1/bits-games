import { PixelGrid, rotateCounterClockwise, type Point } from './pixelGrid';
import type { PixelMap } from './pixelMap';

/**
 * A side-view body pose facing right, as joint positions inside the frame.
 * "Near" limbs are closer to the viewer and drawn in front of the body.
 */
export interface HumanoidPose {
  /** Centre of the head. */
  readonly head: Point;
  readonly shoulder: Point;
  readonly hip: Point;
  /** Elbow, then hand. */
  readonly nearArm: readonly [elbow: Point, hand: Point];
  readonly farArm: readonly [elbow: Point, hand: Point];
  /** Knee, then foot. */
  readonly nearLeg: readonly [knee: Point, foot: Point];
  readonly farLeg: readonly [knee: Point, foot: Point];
  /** Quarter turns counter-clockwise for the head, e.g. 1 when lying on the back. */
  readonly headTurns?: number;
}

/** How a humanoid looks: frame size, head sprite, limb thickness and palette symbols. */
export interface HumanoidBody {
  readonly frameWidth: number;
  readonly frameHeight: number;
  /** Head pixel map facing right, centred on `pose.head`. */
  readonly head: PixelMap;
  readonly thickness: {
    readonly torso: number;
    readonly upperArm: number;
    readonly forearm: number;
    readonly fist: number;
    readonly leg: number;
  };
  readonly symbols: {
    readonly cloth: string;
    readonly clothShade: string;
    readonly skin: string;
    readonly skinShade: string;
    readonly belt: string;
  };
  /** Optional cloak hanging from the shoulders, drawn behind the body. */
  readonly cape?: {
    readonly symbol: string;
    /** How far below the hip it falls. */
    readonly length: number;
    /** How wide it spreads at the bottom. */
    readonly spread: number;
  };
}

/** Belt width, in pixels along the torso. */
const BELT_SIZE = 2;
/** Feet are small blocks pointing forward (to the right). */
const FOOT_LENGTH = 4;
const FOOT_HEIGHT = 2;

/**
 * Draws a side-view fighter from a pose. Limbs and torso become thick pixel lines
 * and the head is stamped on top. Far-side limbs use shade colours and are drawn
 * behind the body.
 */
export function drawHumanoid(pose: HumanoidPose, body: HumanoidBody): PixelMap {
  const grid = new PixelGrid(body.frameWidth, body.frameHeight);
  const { symbols, thickness } = body;

  if (body.cape) drawCape(grid, body.cape, pose, thickness.torso);
  drawLeg(grid, body, pose.hip, pose.farLeg, symbols.clothShade, symbols.skinShade);
  drawArm(grid, body, pose.shoulder, pose.farArm, symbols.clothShade, symbols.skinShade);

  grid.line(pose.shoulder, pose.hip, thickness.torso, symbols.cloth);
  grid.line(pointTowards(pose.hip, pose.shoulder, BELT_SIZE - 1), pose.hip, thickness.torso, symbols.belt);

  drawLeg(grid, body, pose.hip, pose.nearLeg, symbols.cloth, symbols.skin);
  drawHead(grid, body.head, pose);
  drawArm(grid, body, pose.shoulder, pose.nearArm, symbols.cloth, symbols.skin);

  return grid.toPixelMap();
}

function drawArm(
  grid: PixelGrid,
  body: HumanoidBody,
  shoulder: Point,
  [elbow, hand]: HumanoidPose['nearArm'],
  sleeveSymbol: string,
  skinSymbol: string,
): void {
  grid.line(shoulder, elbow, body.thickness.upperArm, sleeveSymbol);
  grid.line(elbow, hand, body.thickness.forearm, skinSymbol);
  grid.square(hand, body.thickness.fist, skinSymbol);
}

function drawLeg(
  grid: PixelGrid,
  body: HumanoidBody,
  hip: Point,
  [knee, foot]: HumanoidPose['nearLeg'],
  clothSymbol: string,
  skinSymbol: string,
): void {
  grid.line(hip, knee, body.thickness.leg, clothSymbol);
  grid.line(knee, foot, body.thickness.leg, clothSymbol);

  const [footX, footY] = foot;
  grid.fillRect(footX - 1, footY - FOOT_HEIGHT + 1, FOOT_LENGTH, FOOT_HEIGHT, skinSymbol);
}

/**
 * A cloak hanging from the shoulders. It follows the torso down, keeps falling past the hip
 * and widens as it goes. It is drawn before everything else, so the fighter stands in front
 * of it and only its edges show.
 */
function drawCape(
  grid: PixelGrid,
  cape: NonNullable<HumanoidBody['cape']>,
  pose: HumanoidPose,
  torsoThickness: number,
): void {
  const [shoulderX, shoulderY] = pose.shoulder;
  const [hipX, hipY] = pose.hip;
  const bottomY = hipY + cape.length;
  const fall = Math.max(1, bottomY - shoulderY);
  const torsoSpan = Math.max(1, hipY - shoulderY);
  const halfTorso = Math.floor(torsoThickness / 2);

  for (let y = shoulderY; y <= bottomY; y++) {
    const alongTorso = Math.min(1, (y - shoulderY) / torsoSpan);
    const centerX = Math.round(shoulderX + (hipX - shoulderX) * alongTorso);
    const width = Math.max(1, Math.round(cape.spread * (0.45 + 0.55 * ((y - shoulderY) / fall))));
    // It hangs behind him: the near edge sits at his back and the cloth spreads away from there.
    grid.fillRect(centerX + halfTorso - width, y, width, 1, cape.symbol);
  }
}

function drawHead(grid: PixelGrid, headMap: PixelMap, pose: HumanoidPose): void {
  let map = headMap;
  for (let turn = 0; turn < (pose.headTurns ?? 0); turn++) map = rotateCounterClockwise(map);

  const width = map[0]?.length ?? 0;
  const [centerX, centerY] = pose.head;
  grid.stamp(map, centerX - Math.floor(width / 2), centerY - Math.floor(map.length / 2));
}

/** The point `distance` pixels from `from` in the direction of `to`, rounded to whole pixels. */
function pointTowards([fromX, fromY]: Point, [toX, toY]: Point, distance: number): Point {
  const length = Math.hypot(toX - fromX, toY - fromY) || 1;
  return [
    Math.round(fromX + ((toX - fromX) / length) * distance),
    Math.round(fromY + ((toY - fromY) / length) * distance),
  ];
}
