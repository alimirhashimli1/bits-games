import { VEHICLE_MODELS } from '../content/traffic';
import { TRAFFIC } from '../config';
import type { Random } from '../systems/random';
import type { Obstacle } from '../systems/road/roadUsers';
import type { RoadVehicleSprite } from '../systems/road/roadSprites';
import type { Track } from '../systems/road/Track';
import { renderPixelSprite } from '../systems/sprites/pixelSprites';
import { findContact, spawnVehicles, stepVehicle, type Vehicle, vehicleObstacle } from '../systems/traffic/trafficRules';

/** Every other vehicle on the road. */
export class Traffic {
  private vehicles: Vehicle[];
  private readonly images: readonly HTMLCanvasElement[];

  constructor(
    private readonly track: Track,
    private readonly random: Random,
  ) {
    const count = Math.floor((track.length - TRAFFIC.clearStart) / TRAFFIC.spacing);
    this.vehicles = spawnVehicles(count, track.length, random);
    this.images = VEHICLE_MODELS.map((model) => renderPixelSprite(model.map, model.palette, model.name));
  }

  /**
   * Moves every vehicle on by one step, keeping clear of `roadUsers` (the Comet and the rivals).
   * They all react to where the others were at the start of it.
   */
  update(roadUsers: readonly Obstacle[]): void {
    const seen = this.obstacles();
    this.vehicles = this.vehicles.map((vehicle, index) => {
      const around = [...seen.slice(0, index), ...seen.slice(index + 1), ...roadUsers];
      return stepVehicle(vehicle, around, this.track, this.random);
    });
  }

  /** The traffic where it really is on the road, as other drivers see it. */
  obstacles(): Obstacle[] {
    return this.vehicles.map((vehicle) => vehicleObstacle(vehicle, this.track));
  }

  /** The vehicle the Comet's nose is touching, if any. */
  contact(comet: Obstacle): Obstacle | null {
    return findContact(this.obstacles(), comet, this.track.length);
  }

  sprites(): RoadVehicleSprite[] {
    return this.vehicles.flatMap((vehicle) => {
      const image = this.images[vehicle.model];
      return image ? [{ z: vehicle.z, x: vehicleObstacle(vehicle, this.track).x, image }] : [];
    });
  }
}
