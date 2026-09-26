import { CAR } from '../../config';
import { nearestBranchCentre } from '../road/fork';

export type Gear = keyof typeof CAR.gears;

/** Everything that changes as the Comet drives. */
export interface CarState {
  /** World units per step. */
  readonly speed: number;
  /** Sideways, in road half-widths: 0 is the centre line, ±1 the edges of the tarmac. */
  readonly x: number;
  readonly gear: Gear;
}

/** What the driver is doing this step. */
export interface CarControls {
  /** -1 left, 0 straight, 1 right. */
  readonly steer: -1 | 0 | 1;
  readonly accelerate: boolean;
  readonly brake: boolean;
  /** True on the step the gear button is pressed. */
  readonly changeGear: boolean;
}

/** The road under the car this step. */
export interface RoadUnder {
  /** How much it bends: positive to the right. */
  readonly curve: number;
  /** How far each branch is from the old centre line, if the road has forked; otherwise 0. */
  readonly branchOffset: number;
}

export const STARTING_CAR: CarState = { speed: 0, x: 0, gear: 'low' };

/** The fastest speed of all, used to scale steering and the pull of bends. */
const TOP_SPEED = Math.max(CAR.gears.low.topSpeed, CAR.gears.high.topSpeed);

/** Advances the car by one step, given the driver's controls and the road under it. */
export function stepCar(car: CarState, controls: CarControls, { curve, branchOffset }: RoadUnder): CarState {
  const gear = controls.changeGear ? otherGear(car.gear) : car.gear;
  const speed = nextSpeed(car.speed, gear, controls, isOffRoad(car.x, branchOffset));

  // Steering and the pull of a bend both grow with speed, so a parked car stays put.
  const speedShare = speed / TOP_SPEED;
  const steered = car.x + controls.steer * CAR.steering * speedShare;
  // A bend to the right pushes the car to the left, and the other way round.
  const pushed = steered - curve * CAR.bendPush * speedShare * speedShare;
  const reach = branchOffset + CAR.maxSideways;
  const x = Math.max(-reach, Math.min(reach, pushed));

  return { speed, x, gear };
}

/** True once the car is past the tarmac and the rumble strip of the road, or of the nearest branch. */
export function isOffRoad(x: number, branchOffset: number): boolean {
  return Math.abs(x - nearestBranchCentre(x, branchOffset)) > CAR.offRoad.edge;
}

function otherGear(gear: Gear): Gear {
  return gear === 'low' ? 'high' : 'low';
}

function nextSpeed(speed: number, gear: Gear, controls: CarControls, offRoad: boolean): number {
  const { topSpeed } = CAR.gears[gear];
  let next = speed;

  if (controls.brake) next -= CAR.braking;
  else if (controls.accelerate && speed < topSpeed) next = Math.min(topSpeed, speed + engineForce(speed, gear));
  else next -= CAR.coastDrag;

  // Over the gear's top speed, after changing down, the engine holds the car back.
  if (next > topSpeed) next = Math.max(topSpeed, next - CAR.engineBraking);
  if (offRoad && next > CAR.offRoad.topSpeed) next = Math.max(CAR.offRoad.topSpeed, next - CAR.offRoad.drag);

  return Math.max(0, next);
}

/**
 * How much the engine speeds the car up in one step. It fades as the car nears the gear's top
 * speed. High gear is also weak at low speed, and only reaches full pull at `fullPullFrom`.
 */
function engineForce(speed: number, gear: Gear): number {
  const { topSpeed, acceleration, minimumPull, fullPullFrom } = CAR.gears[gear];
  const pull = Math.min(1, minimumPull + ((1 - minimumPull) * speed) / fullPullFrom);
  const fade = 1 - (speed / topSpeed) ** 2;
  return acceleration * pull * fade;
}
