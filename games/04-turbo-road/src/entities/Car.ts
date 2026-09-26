import { COMET_PALETTE, COMET_STRAIGHT, COMET_TYRE_ROW } from '../content/sprites/comet';
import { CAR, CRASH, SCREEN } from '../config';
import {
  type CarControls,
  type CarState,
  isOffRoad,
  type RoadUnder,
  STARTING_CAR,
  stepCar,
} from '../systems/driving/carPhysics';
import { bumpOff, bumpOffVehicle, findCollision } from '../systems/driving/collisions';
import { type Crash, isCrashOver, startCrash, stepCrash, tumblePose } from '../systems/driving/crash';
import type { Segment } from '../systems/road/Track';
import { leanPixelMap, padPixelMap, renderPixelSprite } from '../systems/sprites/pixelSprites';

interface CarFrames {
  readonly straight: HTMLCanvasElement;
  readonly left: HTMLCanvasElement;
  readonly right: HTMLCanvasElement;
}

/** The player's Comet GT: its driving state, and the sprite drawn at the bottom of the screen. */
export class Car {
  private crash: Crash | null = null;
  /** The road under the car on the last step, for the off-road judder. */
  private road: RoadUnder = { curve: 0, branchOffset: 0 };
  private steer: CarControls['steer'] = 0;
  private steps = 0;
  private readonly frames: CarFrames = drawFrames();

  /** A new stage starts with the car as it left the last one. */
  constructor(private state: CarState = STARTING_CAR) {}

  get speed(): number {
    return this.state.speed;
  }

  get x(): number {
    return this.state.x;
  }

  get gear(): CarState['gear'] {
    return this.state.gear;
  }

  /** Everything about the car that carries on into the next stage. */
  get carState(): CarState {
    return this.state;
  }

  /** Drives the car for one step. While it is crashing, the controls do nothing. */
  update(controls: CarControls, road: RoadUnder): void {
    this.steps++;
    this.road = road;
    if (this.crash) {
      this.updateCrash(this.crash);
      return;
    }
    this.state = stepCar(this.state, controls, road);
    this.steer = controls.steer;
  }

  get isCrashing(): boolean {
    return this.crash !== null;
  }

  /**
   * Checks the scenery in the segments the car has just driven into: a fast hit is a crash,
   * a slow one a bump. Says which, if either.
   */
  hitTest(segments: readonly Segment[]): 'crash' | 'bump' | null {
    if (this.crash) return null;
    let hit = null;
    for (const segment of segments) hit ??= findCollision(this.state.x, segment.scenery, segment.branchNear);
    if (!hit) return null;

    if (this.state.speed > CRASH.minSpeed) {
      this.crash = startCrash(this.state);
      this.steer = 0;
      return 'crash';
    }
    this.state = bumpOff(this.state, hit);
    return 'bump';
  }

  /** Touching another vehicle. A tumbling car is past caring. */
  bumpVehicle(vehicleX: number, vehicleSpeed: number): void {
    if (!this.crash) this.state = bumpOffVehicle(this.state, vehicleX, vehicleSpeed);
  }

  /** The camera follows the car, so it is always drawn in the middle of the screen. */
  draw(context: CanvasRenderingContext2D): void {
    if (this.crash) {
      this.drawTumble(context, this.crash);
      return;
    }
    const frame = this.steer < 0 ? this.frames.left : this.steer > 0 ? this.frames.right : this.frames.straight;
    const judder = this.isJuddering() && Math.floor(this.steps / CAR.offRoad.judderSteps) % 2 === 0 ? 1 : 0;
    const left = Math.round((SCREEN.width - frame.width) / 2);
    const top = SCREEN.height - CAR.screenBottomGap - frame.height - judder;
    context.drawImage(frame, left, top);
  }

  private updateCrash(crash: Crash): void {
    const next = stepCrash(crash, this.state, this.road.branchOffset);
    this.state = next.car;
    this.crash = isCrashOver(next.crash) ? null : next.crash;
  }

  /** End over end: the sprite is squashed through edge-on to upside down and back, in an arc. */
  private drawTumble(context: CanvasRenderingContext2D, crash: Crash): void {
    const frame = this.frames.straight;
    const { lift, flip } = tumblePose(crash);
    const centreY = SCREEN.height - CAR.screenBottomGap - frame.height / 2 - lift;
    context.save();
    context.translate(Math.round(SCREEN.width / 2), Math.round(centreY));
    context.scale(1, flip);
    context.drawImage(frame, -Math.round(frame.width / 2), -Math.round(frame.height / 2));
    context.restore();
  }

  private isJuddering(): boolean {
    return this.state.speed > 0 && isOffRoad(this.state.x, this.road.branchOffset);
  }
}

function drawFrames(): CarFrames {
  const lean = (direction: -1 | 1): HTMLCanvasElement =>
    renderPixelSprite(
      leanPixelMap(COMET_STRAIGHT, direction, COMET_TYRE_ROW, CAR.leanPixels),
      COMET_PALETTE,
      'Comet leaning',
    );
  return {
    straight: renderPixelSprite(padPixelMap(COMET_STRAIGHT, CAR.leanPixels), COMET_PALETTE, 'Comet'),
    left: lean(-1),
    right: lean(1),
  };
}
