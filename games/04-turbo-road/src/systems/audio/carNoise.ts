import { CAR, SOUND } from '../../config';
import type { CarControls, CarState } from '../driving/carPhysics';

/**
 * How hard the engine is revving: 0 standing still, 1 at the top of the gear, and a little
 * more when changing down at speed has pushed it past the top.
 */
export function engineRevs({ speed, gear }: CarState): number {
  return Math.min(SOUND.engine.maxRevs, speed / CAR.gears[gear].topSpeed);
}

/** The engine note's pitch, in hertz. */
export function enginePitch(car: CarState): number {
  return SOUND.engine.idleHz + engineRevs(car) * SOUND.engine.revRangeHz;
}

/** The tyres squeal under hard braking, or when the car is steered into a sharp bend at speed. */
export function tyresSqueal(speed: number, controls: CarControls, curve: number): boolean {
  const { brakingSpeed, bendCurve, bendSpeed } = SOUND.squeal;
  if (controls.brake && speed > brakingSpeed) return true;
  const steeringIntoBend = controls.steer !== 0 && Math.sign(curve) === controls.steer;
  return steeringIntoBend && Math.abs(curve) >= bendCurve && speed > bendSpeed;
}
