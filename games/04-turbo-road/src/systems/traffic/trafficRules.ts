import { VEHICLE_MODELS } from '../../content/traffic';
import { ROAD, TRAFFIC } from '../../config';
import { approach } from '../approach';
import type { Random } from '../random';
import { branchSide } from '../road/fork';
import { LANE_WIDTH, laneCentre } from '../road/lanes';
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
 * One vehicle in the traffic. Sideways positions are in road half-widths, measured as if the
 * road never forked: past a fork, a vehicle follows the branch on its side of the centre line.
 */
export interface Vehicle {
  /** Index into `VEHICLE_MODELS`. */
  readonly model: number;
  /** Distance along the track, always within one lap. */
  readonly z: number;
  readonly x: number;
  /** The lane it is in, or moving into. */
  readonly lane: number;
  readonly speed: number;
  /** The speed this driver likes to go at when nothing is in the way. */
  readonly cruise: number;
}

/** How long moving over one lane takes. */
const LANE_CHANGE_STEPS = LANE_WIDTH / TRAFFIC.laneChangeSpeed;

/** A vehicle, as other drivers see it: where it really is, on its branch if the road has forked. */
export function vehicleObstacle(vehicle: Vehicle, road: RoadMap): Obstacle {
  const width = VEHICLE_MODELS[vehicle.model]?.map[0]?.length ?? 0;
  const shift = branchSide(vehicle.x) * road.branchOffsetAt(vehicle.z);
  return {
    z: vehicle.z,
    x: vehicle.x + shift,
    speed: vehicle.speed,
    halfWidth: spriteHalfWidth(width),
    headingX: laneCentre(vehicle.lane) + shift,
  };
}

/** Spreads `count` vehicles along the track, in random lanes and at their own cruising speeds. */
export function spawnVehicles(count: number, trackLength: number, random: Random): Vehicle[] {
  const spacing = (trackLength - TRAFFIC.clearStart) / count;
  return Array.from({ length: count }, (_, index) => {
    const model = Math.floor(random() * VEHICLE_MODELS.length);
    const { cruise } = VEHICLE_MODELS[model] ?? { cruise: { min: 0, max: 0 } };
    const lane = Math.floor(random() * ROAD.lanes);
    const speed = cruise.min + random() * (cruise.max - cruise.min);
    return { model, z: TRAFFIC.clearStart + (index + random() / 2) * spacing, x: laneCentre(lane), lane, speed, cruise: speed };
  });
}

/**
 * Moves one vehicle on by a step. It cruises at its own speed, brakes in time to match anything
 * ahead in its lane (the Comet and the rivals included), and now and then drifts into the next
 * lane. If whatever is in front slows too suddenly, it bumps it and loses speed, so nothing ever
 * drives through anything else. Once the road forks, it stays on its branch.
 *
 * `around` is everyone else on the road: the other vehicles, the Comet and the rivals.
 */
export function stepVehicle(vehicle: Vehicle, around: readonly Obstacle[], road: RoadMap, random: Random): Vehicle {
  const trackLength = road.length;
  const self = vehicleObstacle(vehicle, road);
  let target = vehicle.cruise;
  let bumpedTo = Infinity;
  for (const other of around) {
    if (isClosingOn(self, other, trackLength)) target = Math.min(target, other.speed);
    if (isTouching(self, other, trackLength)) bumpedTo = Math.min(bumpedTo, other.speed * TRAFFIC.bumpSpeedShare);
  }

  const driven =
    target > vehicle.speed
      ? Math.min(target, vehicle.speed + TRAFFIC.acceleration)
      : Math.max(target, vehicle.speed - TRAFFIC.braking);
  const speed = Math.min(driven, bumpedTo);
  const forked = road.branchOffsetAt(vehicle.z) > 0;
  const lane = forked ? vehicle.lane : nextLane(self, vehicle.lane, around, trackLength, random);

  return {
    ...vehicle,
    speed,
    lane,
    x: approach(vehicle.x, laneCentre(lane), TRAFFIC.laneChangeSpeed),
    z: wrapDistance(vehicle.z + speed, trackLength),
  };
}

/** The vehicle the Comet's nose is touching, if any, where it really is on the road. */
export function findContact(vehicles: readonly Obstacle[], comet: Obstacle, trackLength: number): Obstacle | null {
  return vehicles.find((vehicle) => isTouching(comet, vehicle, trackLength)) ?? null;
}

/** True if `ahead` is in the path of `self`, and close enough that it must start braking for it. */
function isClosingOn(self: Obstacle, ahead: Obstacle, trackLength: number): boolean {
  const gap = distanceAhead(self.z, ahead.z, trackLength);
  const range = brakingDistance(self.speed - ahead.speed, TRAFFIC.braking) + TRAFFIC.followGap;
  return gap > 0 && gap < range && isInPath(ahead, self.x, self.halfWidth);
}

/**
 * Only a vehicle settled in its lane starts a change, and only into a lane that exists and is
 * safe to move into.
 */
function nextLane(self: Obstacle, lane: number, around: readonly Obstacle[], trackLength: number, random: Random): number {
  const settled = Math.abs(self.x - laneCentre(lane)) < TRAFFIC.laneChangeSpeed;
  if (!settled || random() >= TRAFFIC.laneChangeChance) return lane;

  const direction = random() < 0.5 ? -1 : 1;
  const wanted = lane + direction;
  // From an outside lane, the only way to go is back towards the middle.
  const next = wanted < 0 || wanted >= ROAD.lanes ? lane - direction : wanted;
  return isSafeToMoveInto(self, next, around, trackLength) ? next : lane;
}

/**
 * True if nothing in, or moving into, `lane` is just ahead, or coming up from behind fast enough to reach the
 * vehicle before it has finished moving over. Traffic never cuts in front of a fast car.
 */
function isSafeToMoveInto(self: Obstacle, lane: number, around: readonly Obstacle[], trackLength: number): boolean {
  const centre = laneCentre(lane);
  return !around.some((other) => {
    if (!isInPath(other, centre, self.halfWidth)) return false;
    const ahead = distanceAhead(self.z, other.z, trackLength);
    const catchingUp = Math.max(0, other.speed - self.speed) * LANE_CHANGE_STEPS;
    return ahead < TRAFFIC.followGap || trackLength - ahead < TRAFFIC.length + catchingUp;
  });
}
