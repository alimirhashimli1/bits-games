import { playSound } from '@shared/audio/audioEngine';
import { playMusic, stopMusic } from '@shared/audio/music';

import { RIVAL_DRIVERS } from '../content/rivals';
import { CHECKPOINT, COUNTDOWN_BEEP, CRASH, GEAR_DOWN, GEAR_UP, GOAL, RIVAL_PASSED, TIME_UP } from '../content/sounds';
import { CHECKPOINT_GATE } from '../content/sprites/gates';
import { GOALS, STAGES } from '../content/stages/route';
import type { Goal, Stage } from '../content/stages/stage';
import { BANNER, CAR, COLORS, FORK, RACE, RIVALS, ROAD } from '../config';
import { Car } from '../entities/Car';
import { Rivals } from '../entities/Rivals';
import { Traffic } from '../entities/Traffic';
import { tyresSqueal } from '../systems/audio/carNoise';
import { RaceAudio } from '../systems/audio/RaceAudio';
import type { CarControls } from '../systems/driving/carPhysics';
import { RaceClock } from '../systems/race/RaceClock';
import { continueRun, forkSideOf, type RaceRun } from '../systems/race/RaceRun';
import { distancePoints } from '../systems/race/scoring';
import { ParallaxBackground } from '../systems/road/ParallaxBackground';
import { drawRoad } from '../systems/road/roadRenderer';
import { drawRoadSprites, type RoadImages } from '../systems/road/roadSprites';
import { cometObstacle } from '../systems/road/roadUsers';
import type { Segment, Track } from '../systems/road/Track';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { createGateImage } from '../systems/sprites/gateImage';
import { createSceneryImages } from '../systems/sprites/sceneryImages';
import { Banner } from '../systems/ui/Banner';
import { drawRaceHud } from '../systems/ui/RaceHud';
import { GameOverScene } from './GameOverScene';
import { GoalScene } from './GoalScene';
import { PauseMenu } from './PauseMenu';
import { RouteMapScene } from './RouteMapScene';

/** Just below the clock. */
const BANNER_Y = 44;

/** Once time is up, or over a finish line, the driver's hands are off the wheel and the Comet brakes to a stop. */
const STOPPING_CONTROLS: CarControls = { steer: 0, accelerate: false, brake: true, changeGear: false };

/**
 * One stage of the race: the Comet drives from the start to the end line in traffic, chasing
 * three rivals, against the clock. At the end it takes a fork to the next stage, by way of the
 * route map, or crosses a finish line. Esc or Start pauses.
 */
export class RaceScene implements Scene {
  private readonly stage: Stage;
  private readonly track: Track;
  private readonly background: ParallaxBackground;
  private readonly images: RoadImages;
  private readonly car: Car;
  private readonly traffic: Traffic;
  private readonly rivals: Rivals;
  private readonly clock: RaceClock;
  private readonly banner = new Banner(BANNER_Y, COLORS.title, BANNER.showSteps);
  private readonly audio = new RaceAudio(Math.random);
  /** How far the camera has come since the start of the stage. `distance` is the same, wrapped. */
  private travelled = 0;
  private distance = 0;
  private score: number;
  /** The goal whose finish line the Comet has crossed, once it has. */
  private finishedAt: Goal | null = null;
  /** Steps spent standing still since time ran out or the finish line. */
  private stoppedSteps = 0;
  private pauseMenu: PauseMenu | null = null;

  constructor(
    private readonly game: GameContext,
    private readonly run: RaceRun,
  ) {
    this.stage = STAGES[run.stage];
    this.track = this.stage.buildTrack();
    const { exit } = this.stage;
    this.images = {
      scenery: createSceneryImages(),
      checkpointGate: createGateImage(CHECKPOINT_GATE),
      finishGate: exit.kind === 'goal' ? createGateImage(GOALS[exit.goal].gate) : null,
    };
    this.background = new ParallaxBackground(this.stage.theme.background, this.stage.theme.palette.sky);
    this.car = new Car(run.car);
    this.traffic = new Traffic(this.track, Math.random);
    const firstStage = run.route.length === 0;
    this.rivals = new Rivals(this.track, Math.random, CAR.distanceAhead, !firstStage);
    this.clock = new RaceClock(run.clockSteps);
    this.score = run.score;
    this.banner.show(firstStage ? `RADIO: ${run.song.title}` : this.stage.name);
    // Already playing from the radio, or from the stage before: then it carries on without a break.
    playMusic(run.song.music);
  }

  /** The engine stops with the scene; the radio plays on to the route map. */
  leave(): void {
    this.audio.stop();
  }

  /** How far the Comet itself has come: it is `CAR.distanceAhead` in front of the camera. */
  private get progress(): number {
    return this.travelled + CAR.distanceAhead;
  }

  update(): void {
    if (this.pauseMenu) {
      this.audio.hush();
      this.pauseMenu.update();
      return;
    }
    if (this.game.input.justPressed('pause')) {
      // The menu starts reading input next step, so the same press cannot also close it.
      this.pauseMenu = new PauseMenu(this.game, () => (this.pauseMenu = null));
      return;
    }

    const racing = !this.clock.isUp && !this.finishedAt;
    // Bends and scenery are taken from the road under the car, not under the camera behind it.
    const carZ = this.distance + CAR.distanceAhead;
    const { curve } = this.track.segmentAt(carZ);
    const branchOffset = this.track.branchOffsetAt(carZ);
    const controls = racing ? this.readControls() : STOPPING_CONTROLS;
    const gearBefore = this.car.gear;
    this.car.update(controls, { curve, branchOffset });
    if (this.car.gear !== gearBefore) playSound(this.car.gear === 'high' ? GEAR_UP : GEAR_DOWN);
    this.background.scroll(curve, this.car.speed / this.track.segmentLength);

    const passed = this.track.segmentsEntered(carZ, carZ + this.car.speed);
    this.travelled += this.car.speed;
    this.distance = this.track.wrap(this.travelled);
    const hit = this.car.hitTest(passed);
    if (hit === 'crash') playSound(CRASH);
    if (hit === 'bump') this.audio.bump();
    this.updateCarNoise(controls, curve);
    if (racing) {
      this.score += distancePoints(this.car.speed, this.car.speed);
      this.passCheckpoints(passed);
      this.announceFork();
    }

    this.updateOtherDrivers(racing);
    this.banner.update();
    this.updateClock();
    if (racing && this.progress >= this.track.ends.endZ) this.finishStage();
  }

  draw(context: CanvasRenderingContext2D): void {
    this.background.draw(context);
    const view = { x: this.car.x * ROAD.halfWidth, z: this.distance };
    const projected = drawRoad(context, this.track, view, this.stage.theme.palette);
    const vehicles = [...this.traffic.sprites(), ...this.rivals.sprites()];
    drawRoadSprites(context, projected, this.track, this.images, vehicles);
    this.car.draw(context);

    drawRaceHud(context, {
      score: this.score,
      rivalsBehind: this.rivals.behind(this.progress),
      rivalCount: RIVAL_DRIVERS.length,
      seconds: this.clock.seconds,
      timeIsLow: this.clock.isLow,
      stageName: this.stage.name,
      progress: this.progress / this.track.ends.endZ,
      kmh: this.car.speed * CAR.kmhPerSpeed,
      gear: this.car.gear,
    });
    this.banner.draw(context);

    this.pauseMenu?.draw(context);
  }

  private passCheckpoints(passed: readonly Segment[]): void {
    for (const { checkpoint } of passed) {
      if (checkpoint === null) continue;
      this.clock.extend(checkpoint);
      this.banner.show('EXTENDED PLAY!');
      playSound(CHECKPOINT);
    }
  }

  /**
   * Coming up to the fork, a banner names where each branch goes. Other messages, such as a
   * rival being passed, can still show, and the fork's comes back after them.
   */
  private announceFork(): void {
    const { exit } = this.stage;
    const { forkZ } = this.track.ends;
    if (exit.kind !== 'fork' || forkZ === null || this.banner.isShowing) return;
    if (this.progress < forkZ - FORK.warningDistance) return;
    this.banner.show(`${STAGES[exit.left].name} <  > ${STAGES[exit.right].name}`);
  }

  /**
   * Over the end line: on to the next stage by the branch the Comet took, or through the
   * finish, where the clock stops and the Comet brakes to a stop before the ending.
   */
  private finishStage(): void {
    const { exit } = this.stage;
    if (exit.kind === 'goal') {
      this.finishedAt = GOALS[exit.goal];
      this.banner.show('GOAL!', Infinity);
      stopMusic();
      playSound(GOAL);
      return;
    }
    const next = exit[forkSideOf(this.car.x)];
    const run = continueRun(this.run, next, {
      clockSteps: this.clock.steps,
      score: this.score,
      car: this.car.carState,
      branchOffset: this.track.branchOffsetAt(this.progress),
    });
    this.game.scenes.go(new RouteMapScene(this.game, run));
  }

  /** Rivals and traffic keep driving after time is up, but passing a rival only pays in the race. */
  private updateOtherDrivers(racing: boolean): void {
    const comet = cometObstacle({ z: this.track.wrap(this.progress), x: this.car.x, speed: this.car.speed });
    for (const driver of this.rivals.update([...this.traffic.obstacles(), comet], this.progress)) {
      if (!racing) continue;
      this.score += RIVALS.overtakeBonus;
      this.banner.show(`PASSED ${driver.name}!`);
      playSound(RIVAL_PASSED);
    }
    this.traffic.update([comet, ...this.rivals.obstacles()]);

    const touching = this.traffic.contact(comet) ?? this.rivals.contact(comet);
    if (!touching || this.car.isCrashing) return;
    this.car.bumpVehicle(touching.x, touching.speed);
    this.audio.bump();
  }

  /** A tumbling car's wheels are off the road, and its driver's foot off the throttle. */
  private updateCarNoise(controls: CarControls, curve: number): void {
    const crashing = this.car.isCrashing;
    this.audio.update({
      car: this.car.carState,
      throttle: controls.accelerate && !crashing,
      squealing: !crashing && tyresSqueal(this.car.speed, controls, curve),
    });
  }

  /**
   * The clock runs down until the finish line. Once it is out, or the Comet is over the finish,
   * and the Comet has stopped, the race is over: Game Over, or the goal's ending.
   */
  private updateClock(): void {
    if (!this.clock.isUp && !this.finishedAt) {
      const secondsBefore = this.clock.seconds;
      this.clock.tick();
      if (this.clock.isUp) {
        this.banner.show('TIME UP', Infinity);
        stopMusic();
        playSound(TIME_UP);
      } else if (this.clock.isLow && this.clock.seconds < secondsBefore) {
        playSound(COUNTDOWN_BEEP);
      }
      return;
    }
    this.stoppedSteps = this.car.speed === 0 ? this.stoppedSteps + 1 : 0;
    if (this.stoppedSteps !== RACE.stoppedDelaySteps) return;
    const score = Math.floor(this.score);
    this.game.scenes.go(
      this.finishedAt
        ? new GoalScene(this.game, this.finishedAt, { score, secondsLeft: this.clock.seconds })
        : new GameOverScene(this.game, score, this.stage.id),
    );
  }

  private readControls(): CarControls {
    const { input } = this.game;
    const left = input.isDown('left');
    const right = input.isDown('right');
    return {
      // Both at once cancel out.
      steer: left === right ? 0 : left ? -1 : 1,
      accelerate: input.isDown('accelerate'),
      brake: input.isDown('brake'),
      changeGear: input.justPressed('gear'),
    };
  }
}
