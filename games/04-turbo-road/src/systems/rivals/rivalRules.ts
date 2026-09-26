import { RIVAL_DRIVERS } from '../../content/rivals';
import { COUPE } from '../../content/sprites/rivals';
import { RIVALS, TRAFFIC } from '../../config';
import { approach } from '../approach';
import type { Random } from '../random';
import { branchSide } from '../road/fork';
import { laneCentre, neighbouringLanes } from '../road/lanes';
import { distanceAhead, wrapDistance } from '../road/loopDistance';
import {
  brakingDistance,
  isInPath,
  isTouching,
  type Obstacle,
  type RoadMap,
  spriteHalfWidth,
} from '../road/roadUsers';

/**
 * One rival in the race. Unlike traffic, a rival's place is its whole distance raced, not its
 * place on the lap, so it is always clear who is ahead of whom.
 */
export interface Rival {
  /** Index into `RIVAL_DRIVERS`. */
  readonly driver: number;
  /** Distance raced since the start, measured at the car, like the Comet's. */
  readonly progress: number;
  /** Sideways, in road half-widths, as if the road never forked, like traffic. */
  readonly x: number;
  /** The lane it is in, or moving into. */
  readonly lane: number;
  readonly speed: number;
}

export const RIVAL_HALF_WIDTH = spriteHalfWidth(COUPE[0]?.length ?? 0);

/**
 * Every rival ahead of the Comet at the start of a stage. `cometProgress` is where the Comet's
 * car is. On the first stage they wait on the grid; on later ones they are already racing.
 */
export function spawnRivals(cometProgress: number, flyingStart: boolean): Rival[] {
  return RIVAL_DRIVERS.map((driver, index) => ({
    driver: index,
    progress: cometProgress + driver.startAhead,
    x: laneCentre(driver.startLane),
    lane: driver.startLane,
    speed: flyingStart ? driver.cruise : 0,
  }));
}

/** A rival, as other drivers see it: where it really is, on its branch if the road has forked. */
export function rivalObstacle(rival: Rival, road: RoadMap): Obstacle {
  const z = wrapDistance(rival.progress, road.length);
  const shift = branchSide(rival.x) * road.branchOffsetAt(z);
  return {
    z,
    x: rival.x + shift,
    speed: rival.speed,
    halfWidth: RIVAL_HALF_WIDTH,
    headingX: laneCentre(rival.lane) + shift,
  };
}

/**
 * Moves one rival on by a step. A rival drives flat out, and when something is in its lane
 * ahead it moves to a clear lane beside it. With no clear lane, it slows behind whatever is
 * in the way. On an open road it still weaves from lane to lane now and then. If whatever is
 * in front brakes too hard to stop behind, the rival bumps it, and loses speed like the Comet.
 * Once the road forks, a rival stays on its branch.
 */
export function stepRival(rival: Rival, obstacles: readonly Obstacle[], road: RoadMap, random: Random): Rival {
  const trackLength = road.length;
  const self = rivalObstacle(rival, road);
  const cruise = RIVAL_DRIVERS[rival.driver]?.cruise ?? 0;

  const forked = self.x !== rival.x;
  const lane = forked ? rival.lane : nextLane(rival, self.z, obstacles, trackLength, random);
  const heading = laneCentre(lane) + (self.x - rival.x);
  let target = cruise;
  let bumpedTo = Infinity;
  for (const other of obstacles) {
    target = Math.min(target, speedBehind(self, heading, other, trackLength));
    if (isTouching(self, other, trackLength)) bumpedTo = Math.min(bumpedTo, other.speed * TRAFFIC.bumpSpeedShare);
  }
  const driven =
    target > rival.speed
      ? Math.min(target, rival.speed + RIVALS.acceleration)
      : Math.max(target, rival.speed - RIVALS.braking);
  const speed = Math.min(driven, bumpedTo);

  return {
    ...rival,
    speed,
    lane,
    x: approach(rival.x, laneCentre(lane), RIVALS.laneChangeSpeed),
    progress: rival.progress + speed,
  };
}

/** Rivals the Comet has just got past for the first time. `overtaken` lists the drivers passed before. */
export function newlyOvertaken(rivals: readonly Rival[], overtaken: ReadonlySet<number>, cometProgress: number): Rival[] {
  return rivals.filter((rival) => !overtaken.has(rival.driver) && rival.progress < cometProgress);
}

/** How many rivals are behind the Comet right now. */
export function rivalsBehind(rivals: readonly Rival[], cometProgress: number): number {
  return rivals.filter((rival) => rival.progress < cometProgress).length;
}

/** The lane a rival steers for. Only a rival settled in its lane starts a change. */
function nextLane(
  rival: Rival,
  z: number,
  obstacles: readonly Obstacle[],
  trackLength: number,
  random: Random,
): number {
  const settled = Math.abs(rival.x - laneCentre(rival.lane)) < RIVALS.laneChangeSpeed;
  if (!settled) return rival.lane;

  const blocked = obstacles.some((other) => isAhead(z, rival.x, other, RIVALS.lookAhead, trackLength));
  if (!blocked && random() >= RIVALS.weaveChance) return rival.lane;

  const clear = neighbouringLanes(rival.lane).filter((lane) => isLaneClear(z, lane, obstacles, trackLength));
  // Pick either clear lane at random, so rivals do not all swerve the same way.
  return clear[Math.floor(random() * clear.length)] ?? rival.lane;
}

/**
 * The fastest a rival (`self`, heading sideways for `headingX`) should go because of `other`.
 * A rival brakes once `other` is in its way and braking any later would be too late, unless
 * it will have moved out of the way in time. Closer than `RIVALS.followGap`, it drops back a little.
 */
function speedBehind(self: Obstacle, headingX: number, other: Obstacle, trackLength: number): number {
  const closing = self.speed - other.speed;
  const gap = distanceAhead(self.z, other.z, trackLength);
  const range = brakingDistance(closing, RIVALS.braking) + RIVALS.followGap;
  if (!isAhead(self.z, self.x, other, range, trackLength)) return Infinity;
  if (gap < RIVALS.followGap) return Math.max(0, other.speed - RIVALS.braking);

  const escaping = !isInPath(other, headingX, RIVAL_HALF_WIDTH);
  if (!escaping || closing <= 0) return other.speed;
  const reach = RIVAL_HALF_WIDTH + other.halfWidth;
  const stepsToClear = (reach - Math.abs(self.x - other.x)) / RIVALS.laneChangeSpeed;
  return stepsToClear * closing > gap - RIVALS.followGap ? other.speed : Infinity;
}

/** True if `other` is less than `range` ahead and in the path of a rival at `x`. */
function isAhead(z: number, x: number, other: Obstacle, range: number, trackLength: number): boolean {
  const gap = distanceAhead(z, other.z, trackLength);
  return gap > 0 && gap < range && isInPath(other, x, RIVAL_HALF_WIDTH);
}

/** True if nothing is in, or moving into, `lane` from a little behind a rival to well ahead of it. */
function isLaneClear(z: number, lane: number, obstacles: readonly Obstacle[], trackLength: number): boolean {
  const centre = laneCentre(lane);
  return !obstacles.some((other) => {
    const gap = distanceAhead(z, other.z, trackLength);
    const near = gap < RIVALS.lookAhead || gap > trackLength - RIVALS.lookBehind;
    return near && isInPath(other, centre, RIVAL_HALF_WIDTH);
  });
}
