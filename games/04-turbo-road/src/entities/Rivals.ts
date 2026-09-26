import { RIVAL_DRIVERS, type RivalDriver } from '../content/rivals';
import { COUPE, COUPE_TYRE_ROW } from '../content/sprites/rivals';
import { CAR } from '../config';
import { laneCentre } from '../systems/road/lanes';
import { isTouching, type Obstacle } from '../systems/road/roadUsers';
import type { RoadVehicleSprite } from '../systems/road/roadSprites';
import type { Track } from '../systems/road/Track';
import {
  newlyOvertaken,
  type Rival,
  rivalObstacle,
  rivalsBehind,
  spawnRivals,
  stepRival,
} from '../systems/rivals/rivalRules';
import type { Random } from '../systems/random';
import { leanPixelMap, padPixelMap, renderPixelSprite } from '../systems/sprites/pixelSprites';

interface CoupeFrames {
  readonly straight: HTMLCanvasElement;
  readonly left: HTMLCanvasElement;
  readonly right: HTMLCanvasElement;
}

/** The three rival drivers on this stage, and which of them the Comet has passed. */
export class Rivals {
  private rivals: Rival[];
  private readonly overtaken = new Set<number>();
  private readonly frames: readonly CoupeFrames[] = RIVAL_DRIVERS.map(drawFrames);

  constructor(
    private readonly track: Track,
    private readonly random: Random,
    cometProgress: number,
    flyingStart: boolean,
  ) {
    this.rivals = spawnRivals(cometProgress, flyingStart);
  }

  /**
   * Moves every rival on by one step, dodging `obstacles` (traffic and the Comet) and each other.
   * Returns the drivers the Comet has just passed for the first time, each worth a bonus.
   */
  update(obstacles: readonly Obstacle[], cometProgress: number): RivalDriver[] {
    const before = this.rivals;
    this.rivals = before.map((rival) => {
      const others = before.filter((other) => other !== rival).map((other) => rivalObstacle(other, this.track));
      return stepRival(rival, [...obstacles, ...others], this.track, this.random);
    });

    const passed = newlyOvertaken(this.rivals, this.overtaken, cometProgress);
    for (const rival of passed) this.overtaken.add(rival.driver);
    return passed.flatMap((rival) => RIVAL_DRIVERS[rival.driver] ?? []);
  }

  behind(cometProgress: number): number {
    return rivalsBehind(this.rivals, cometProgress);
  }

  /** The rivals, as traffic sees them. */
  obstacles(): Obstacle[] {
    return this.rivals.map((rival) => rivalObstacle(rival, this.track));
  }

  /** The rival the Comet's nose is touching, if any. */
  contact(comet: Obstacle): Obstacle | null {
    return this.obstacles().find((rival) => isTouching(comet, rival, this.track.length)) ?? null;
  }

  /** Each coupé leans towards the lane it is moving into. */
  sprites(): RoadVehicleSprite[] {
    return this.rivals.flatMap((rival) => {
      const frames = this.frames[rival.driver];
      if (!frames) return [];
      const heading = laneCentre(rival.lane) - rival.x;
      const image = heading < 0 ? frames.left : heading > 0 ? frames.right : frames.straight;
      const { z, x } = rivalObstacle(rival, this.track);
      return [{ z, x, image }];
    });
  }
}

function drawFrames(driver: RivalDriver): CoupeFrames {
  const lean = (direction: -1 | 1): HTMLCanvasElement =>
    renderPixelSprite(leanPixelMap(COUPE, direction, COUPE_TYRE_ROW, CAR.leanPixels), driver.palette, driver.name);
  return {
    straight: renderPixelSprite(padPixelMap(COUPE, CAR.leanPixels), driver.palette, driver.name),
    left: lean(-1),
    right: lean(1),
  };
}
