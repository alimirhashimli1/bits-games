import * as Phaser from 'phaser';

import type { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, addPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import {
  COLORS,
  LEVEL,
  LEVEL_DEV_CONTROLS,
  LEVEL_END,
  PIPES,
  PLAYER_CONTROLS,
  POWER,
  RUSTY,
  SCORING,
  SCREEN,
  type PlayerAction,
} from '../config';
import { levelMaps } from '../content/levels/levels';
import { floatLabel } from '../entities/effects/floatingLabel';
import { Enemies, type BeatKind } from '../entities/enemies/Enemies';
import { LevelEnd } from '../entities/LevelEnd';
import { Items } from '../entities/Items';
import { LooseCoins } from '../entities/LooseCoins';
import { Rusty } from '../entities/Rusty';
import { SteamPuffs } from '../entities/SteamPuffs';
import { BlockHits } from '../systems/blockHits';
import type { EnemyForm } from '../systems/enemyRules';
import { ForwardCamera } from '../systems/forwardCamera';
import { loadLevel, type Cell, type LoadedLevel } from '../systems/levelLoader';
import { LevelTimer } from '../systems/levelTimer';
import { PlayerMovement } from '../systems/playerMovement';
import {
  blockPowerUp,
  collectPowerUp,
  nextPowerState,
  powerAfterHit,
  type ItemKind,
} from '../systems/powerState';
import { advanceLevel, gainLife, levelId, loseLife, type RunState } from '../systems/runState';
import { collectCoin, DefeatChain, wheelBonus } from '../systems/score';
import { createScreenInput } from '../systems/screenInput';
import { LevelHud, type HudValues } from './hud/LevelHud';
import { SCENES } from './sceneKeys';

const LABEL_MARGIN = 4;
const LABEL_LINE_HEIGHT = 8;
/** Where "TIME UP" appears when the clock runs out. */
const TIME_UP_Y = 80;

/** What the drop-enemy development key puts down, in turn, and how far in front of Rusty. */
const DEV_ENEMY_FORMS: readonly EnemyForm[] = ['gloop', 'shellbug', 'flutterbug'];
const DEV_ENEMY_TILES_AHEAD = 3;

/** Pipes are two tiles wide. */
const PIPE_TILES = 2;
/** Drawn behind the tiles, so Rusty disappears into a pipe rather than in front of it. */
const BEHIND_TILES_DEPTH = -1;

/** Everything the level scene needs: the run, and where in it Rusty is. */
export interface LevelSceneData extends RunState {
  /** True while he is in the room under the level, reached by going down a pipe. */
  readonly inRoom?: boolean;
  /** Where he comes back out in the level: the cell above the pipe he rises from. */
  readonly returnTo?: Cell;
  /** What is left on the clock, so it keeps running while he is down there. */
  readonly timeLeft?: number;
}

/** One level: Rusty runs and jumps through a tilemap, and the camera carries him forwards. */
export class LevelScene extends Phaser.Scene {
  private controls!: ActionInput<PlayerAction>;
  private devControls!: ActionInput<keyof typeof LEVEL_DEV_CONTROLS>;
  private run!: RunState;
  private level!: LoadedLevel;
  private rusty!: Rusty;
  private movement!: PlayerMovement;
  private collisionView!: Phaser.GameObjects.Graphics;
  private camera!: ForwardCamera;
  private blockHits!: BlockHits;
  private items!: Items;
  private steamPuffs!: SteamPuffs;
  private enemies!: Enemies;
  private tileCollider!: Phaser.Physics.Arcade.Collider;
  /** The top of Rusty's body on the previous frame, for noticing when his head crosses into a hidden block. */
  private previousHeadTop = 0;
  private coins = 0;
  private score = 0;
  private hud!: LevelHud;
  private timer!: LevelTimer;
  private levelEnd: LevelEnd | undefined;
  /** True while Rusty is in the room under the level, and where he comes back out above. */
  private inRoom = false;
  private returnTo: Cell | undefined;
  /** Set while he is sinking into a pipe or rising out of one: nothing else happens meanwhile. */
  private throughPipe = false;
  /** How far through finishing the level Rusty is, once he has the valve wheel. */
  private ending: 'playing' | 'wheel' | 'walking' | 'counting' = 'playing';
  /** Game time at which the walk off the end of the level stops. */
  private walkOffUntil = 0;
  /** Enemies beaten one after another are worth more each time. */
  private readonly chain = new DefeatChain();
  /** Which enemy the drop-enemy development key puts down next. */
  private nextDevEnemy = 0;
  /** Set once Rusty falls into a pit or is defeated, so input is ignored until the life is lost. */
  private lifeLost = false;

  constructor() {
    super({
      key: SCENES.level,
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: RUSTY.gravity }, debug: import.meta.env.DEV } },
    });
  }

  create({ inRoom = false, returnTo, timeLeft, ...run }: LevelSceneData): void {
    this.run = run;
    this.inRoom = inRoom;
    this.returnTo = returnTo;
    this.throughPipe = false;
    fadeIn(this);
    // A level left while Rusty was growing would otherwise start with physics still frozen.
    this.physics.world.resume();
    this.cameras.main.setBackgroundColor(inRoom ? COLORS.underground : COLORS.background);

    const maps = levelMaps(levelId(run));
    this.level = loadLevel(this, inRoom ? maps.room : maps.map);
    const { widthInPixels, heightInPixels } = this.level;
    // Walls at both ends of the level, but open above and below: pits are for falling into.
    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels, true, true, false, false);

    this.coins = run.coins;
    this.score = run.score;
    this.timer = new LevelTimer(timeLeft);
    const looseCoins = new LooseCoins(this, this.level.coins);
    this.items = new Items(this, this.level.layer, heightInPixels);
    this.steamPuffs = new SteamPuffs(this, this.level.layer);
    this.blockHits = new BlockHits(this, this.level, {
      coin: () => this.addCoin(),
      // What a power-up block holds depends on Rusty's size at the moment he hits it.
      item: (item, tile) => this.items.emerge(item === 'powerUp' ? blockPowerUp(this.rusty.power) : item, tile),
      brokeBrick: () => {
        this.score += SCORING.brokenBrick;
      },
    });

    // Before Rusty, so he is drawn holding the wheel rather than behind it. Rooms have no pole.
    const endCell = this.level.levelEnd;
    if (!endCell && !inRoom) throw new Error('A level needs a pole to finish on.');
    this.levelEnd = endCell && new LevelEnd(this, endCell, this.groundBelow(endCell));

    this.rusty = new Rusty(this, this.level.spawn.x, this.level.spawn.y);
    this.rusty.setPower(run.power);
    this.rusty.setCollideWorldBounds(true);
    this.previousHeadTop = this.rusty.body.top;
    this.tileCollider = this.physics.add.collider(this.rusty, this.level.layer, (_rusty, tile) => {
      if (tile instanceof Phaser.Tilemaps.Tile) {
        this.blockHits.recordCollision(this.rusty.body, this.rusty.body.blocked.up, tile);
      }
    });
    looseCoins.collectWith(this, this.rusty, () => this.addCoin());
    this.items.collectWith(this.rusty, (kind) => this.collectItem(kind));
    this.enemies = new Enemies(this, {
      level: this.level,
      rusty: this.rusty,
      onHurtRusty: () => this.hurtRusty(),
      onBeaten: (x, topY, how) => this.scoreBeatenEnemy(x, topY, how),
    });
    this.enemies.defeatWithPuffs(this.steamPuffs);
    this.movement = new PlayerMovement();

    // The bottom of the level fills the screen; anything above it stays out of view.
    const camera = this.cameras.main;
    camera.setBounds(0, heightInPixels - SCREEN.height, widthInPixels, SCREEN.height);
    this.camera = new ForwardCamera(camera, widthInPixels);
    this.ending = 'playing';
    this.lifeLost = false;
    // Back from the room: he comes up out of the pipe he was sent to.
    if (!inRoom && returnTo) this.riseFromPipe(returnTo);
    // Scene events outlive a visit to the scene, so the listener is removed when the scene shuts down.
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.followRusty, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.POST_UPDATE, this.followRusty, this);
    });

    this.createCollisionView();
    this.hud = new LevelHud(this, levelId(this.run), this.hudValues());
    this.addDevLabels();
    this.controls = createScreenInput(this, PLAYER_CONTROLS);
    this.devControls = createScreenInput(this, LEVEL_DEV_CONTROLS);
  }

  override update(_time: number, deltaMs: number): void {
    this.controls.update();
    this.devControls.update();
    if (this.lifeLost || this.throughPipe) return;
    this.handleDevControls();
    // Growing, shrinking and changing colour freeze the game until they finish.
    if (this.rusty.isTransforming) return;

    // Once he has the wheel the level finishes itself, and the clock stops.
    if (this.ending !== 'playing') {
      this.finishLevel();
      return;
    }

    this.timer.update(deltaMs);
    this.hud.show(this.hudValues());
    if (this.timer.isOut) {
      this.timeUp();
      return;
    }

    const body = this.rusty.body;
    this.blockHits.update(body, this.previousHeadTop, this.rusty.isBig, (distance) => {
      this.rusty.y += distance;
      body.updateFromGameObject();
    });
    this.previousHeadTop = body.top;

    const result = this.movement.update(
      this.rusty.body,
      {
        left: this.controls.isDown('left'),
        right: this.controls.isDown('right'),
        down: this.controls.isDown('down'),
        run: this.controls.isDown('run'),
        jumpPressed: this.controls.justPressed('jump'),
        jumpHeld: this.controls.isDown('jump'),
      },
      this.rusty.isBig,
      deltaMs,
    );
    this.rusty.showPose(result);
    if (this.controls.isDown('down') && this.standingOnPipeEntry()) {
      this.sinkIntoPipe();
      return;
    }
    if (this.levelEnd?.caughtBy(body)) {
      this.catchWheel(this.levelEnd);
      return;
    }
    if (this.rusty.power === 'steam' && result.pose !== 'duck' && this.controls.justPressed('run')) {
      this.steamPuffs.fire(this.rusty.x, this.rusty.y, result.facing);
    }
    this.items.update();
    this.steamPuffs.update(this.cameras.main);
    this.enemies.update(this.cameras.main, deltaMs);

    // Rusty's origin is at his feet, so this is the top of the sprite: he has to be completely out of sight.
    if (this.rusty.y - this.rusty.displayHeight >= this.level.heightInPixels) this.fallIntoPit();
  }

  /**
   * Runs after the physics world has moved Rusty's sprite to his body. Placing the camera in
   * `update()` instead follows where he was one physics step ago, and on a fast screen, where
   * some frames have a physics step and some do not, he shakes back and forth by pixels.
   */
  private followRusty(): void {
    this.camera.follow(this.rusty.x);
    // The left edge of the screen is a wall: the camera never goes back, so neither can Rusty.
    const bounds = this.physics.world.bounds;
    bounds.width = bounds.right - this.camera.leftEdge;
    bounds.x = this.camera.leftEdge;
  }

  /** Rusty has dropped out of the bottom of the level. The level stays up for a moment, then the life is lost. */
  private fallIntoPit(): void {
    this.lifeLost = true;
    this.rusty.body.setEnable(false);
    this.enemies.freeze();
    this.time.delayedCall(LEVEL.pitLifeLostDelayMs, () => this.loseLife());
  }

  /** Solid tiles and, in development, physics bodies. Both hidden until H is pressed. */
  private createCollisionView(): void {
    this.collisionView = this.add.graphics().setAlpha(LEVEL.debugSolidAlpha).setVisible(false);
    this.level.layer.renderDebug(this.collisionView, {
      tileColor: null,
      collidingTileColor: Phaser.Display.Color.IntegerToColor(LEVEL.debugSolidColor),
      faceColor: null,
    });
    this.physics.world.debugGraphic?.setVisible(false);
  }

  private handleDevControls(): void {
    if (this.devControls.justPressed('clearLevel')) this.clearLevel();
    else if (this.devControls.justPressed('loseLife')) this.loseLife();
    if (this.devControls.justPressed('cyclePower') && !this.rusty.isTransforming) {
      this.rusty.setPower(nextPowerState(this.rusty.power));
    }
    if (this.devControls.justPressed('hurt')) this.hurtRusty();
    if (this.devControls.justPressed('dropEnemy')) this.dropEnemy();
    if (this.devControls.justPressed('debugCollision')) {
      const visible = !this.collisionView.visible;
      this.collisionView.setVisible(visible);
      this.physics.world.debugGraphic?.setVisible(visible);
    }
  }

  /** Development key: drops the next enemy in front of Rusty, so each one is easy to try out. */
  private dropEnemy(): void {
    const form = DEV_ENEMY_FORMS[this.nextDevEnemy % DEV_ENEMY_FORMS.length] ?? 'gloop';
    this.nextDevEnemy += 1;
    const column = Math.floor(this.rusty.x / LEVEL.tileSize) + DEV_ENEMY_TILES_AHEAD;
    const row = Math.floor((this.rusty.y - 1) / LEVEL.tileSize);
    this.enemies.drop(form, column, row);
  }

  /** The dev keys, along the bottom of the screen so they stay clear of the HUD. */
  private addDevLabels(): void {
    const lines = ['G: POWER  K: HURT  J: ENEMY', 'H: HITBOXES  ENTER: CLEAR  L: LOSE LIFE'];
    lines.forEach((line, index) => {
      const y = SCREEN.height - LABEL_MARGIN - (lines.length - index) * LABEL_LINE_HEIGHT;
      addPixelText(this, LABEL_MARGIN, y, line, { color: COLORS.text }).setScrollFactor(0);
    });
  }

  private hudValues(): HudValues {
    return { score: this.score, coins: this.coins, time: this.timer.left, lives: this.run.lives };
  }

  /** Coins are worth points, and every hundredth one is an extra life. */
  private addCoin(): void {
    const { coins, life } = collectCoin(this.coins);
    this.coins = coins;
    this.score += SCORING.coin;
    if (life) this.addLife();
  }

  /** Enemies beaten one after another are worth more each time, and in the end a life. */
  private scoreBeatenEnemy(x: number, topY: number, how: BeatKind): void {
    if (how === 'kicked') {
      this.score += SCORING.kick;
      floatLabel(this, x, topY, String(SCORING.kick), COLORS.text);
      return;
    }
    const reward = this.chain.next(this.time.now);
    if (reward.life) this.addLife(x, topY);
    else floatLabel(this, x, topY, String(reward.points), COLORS.text);
    this.score += reward.points;
  }

  /** An extra life, with a green label above Rusty unless it was earned somewhere else. */
  private addLife(x = this.rusty.x, y = this.rusty.y - this.rusty.displayHeight): void {
    this.run = gainLife(this.run);
    floatLabel(this, x, y, '1UP', COLORS.success);
  }

  private collectItem(kind: ItemKind): void {
    const headX = this.rusty.x;
    const headY = this.rusty.y - this.rusty.displayHeight;
    switch (kind) {
      case 'gear':
      case 'steamValve':
        this.rusty.transformTo(collectPowerUp(this.rusty.power, kind));
        break;
      case 'goldenGasket':
        this.rusty.startGasket();
        break;
      case 'wrench':
        this.addLife(headX, headY);
        return;
    }
    this.score += SCORING.item;
    floatLabel(this, headX, headY, String(SCORING.item), COLORS.text);
  }

  /** What an enemy will do: takes Rusty down one power state, or loses a life when he is small. */
  private hurtRusty(): void {
    if (this.rusty.isInvincible || this.rusty.isTransforming) return;
    const power = powerAfterHit(this.rusty.power);
    if (!power) {
      this.defeat();
      return;
    }
    this.rusty.startHurtInvincibility();
    this.rusty.transformTo(power);
  }

  /** Small Rusty is hit: everything freezes, then he hops up and falls out of the level, through the ground. */
  private defeat(): void {
    this.lifeLost = true;
    this.enemies.freeze();
    this.tileCollider.destroy();
    this.rusty.setCollideWorldBounds(false);
    this.rusty.body.setVelocity(0, 0);
    this.rusty.showDefeat();
    this.physics.world.pause();
    this.time.delayedCall(POWER.defeatPauseMs, () => {
      this.physics.world.resume();
      this.rusty.body.setVelocityY(-POWER.defeatJumpSpeed);
    });
    this.time.delayedCall(POWER.defeatLifeLostDelayMs, () => this.loseLife());
  }

  /** True when Rusty is stood on top of the pipe he can go down, within its two tiles. */
  private standingOnPipeEntry(): boolean {
    const entry = this.level.pipeEntry;
    const body = this.rusty.body;
    if (!entry || !body.blocked.down) return false;
    const left = entry.column * LEVEL.tileSize;
    const pipeTop = entry.row * LEVEL.tileSize;
    return (
      Math.abs(body.bottom - pipeTop) <= 1 &&
      body.center.x > left &&
      body.center.x < left + PIPE_TILES * LEVEL.tileSize
    );
  }

  /** Down the pipe: Rusty sinks out of sight behind it, and the room below loads. */
  private sinkIntoPipe(): void {
    this.throughPipe = true;
    this.rusty.body.setVelocity(0, 0);
    this.rusty.body.setEnable(false);
    this.rusty.setDepth(BEHIND_TILES_DEPTH);
    this.rusty.showPose({ pose: 'stand', facing: 1 });
    this.tweens.add({
      targets: this.rusty,
      y: this.rusty.y + this.rusty.displayHeight,
      duration: PIPES.passMs,
      onComplete: () => this.leaveThroughPipe(),
    });
  }

  /** The room is below the level, and the pipe in it leads back up to where he came from. */
  private leaveThroughPipe(): void {
    const run = this.currentRun();
    const timeLeft = this.timer.left;
    if (this.inRoom) {
      fadeToScene(this, SCENES.level, { ...run, returnTo: this.returnTo, timeLeft });
      return;
    }
    fadeToScene(this, SCENES.level, { ...run, inRoom: true, returnTo: this.level.pipeReturn, timeLeft });
  }

  /** Back from the room: he rises out of the pipe under the return marker. */
  private riseFromPipe(cell: Cell): void {
    this.throughPipe = true;
    const pipeTop = (cell.row + 1) * LEVEL.tileSize;
    // The marker sits above the left half of a two-tile pipe, and he comes up its middle.
    this.rusty.setPosition((cell.column + 1) * LEVEL.tileSize, pipeTop + this.rusty.displayHeight);
    this.rusty.setDepth(BEHIND_TILES_DEPTH);
    this.rusty.body.setEnable(false);
    this.tweens.add({
      targets: this.rusty,
      y: pipeTop,
      duration: PIPES.passMs,
      onComplete: () => {
        this.rusty.setDepth(0);
        this.rusty.body.setEnable(true);
        this.rusty.body.reset(this.rusty.x, this.rusty.y);
        this.throughPipe = false;
      },
    });
  }

  /** The top of the first solid tile under a cell: where the pole at the end of the level stands. */
  private groundBelow({ column, row }: Cell): number {
    for (let below = row + 1; below < LEVEL.rows; below++) {
      if (this.level.layer.getTileAt(column, below)?.collides) return below * LEVEL.tileSize;
    }
    return this.level.heightInPixels;
  }

  /**
   * Rusty has the valve wheel. The clock stops, he is paid for how high up the pole he caught
   * it, and he rides it down to the bottom.
   */
  private catchWheel(levelEnd: LevelEnd): void {
    this.ending = 'wheel';
    this.enemies.freeze();
    const bonus = wheelBonus(levelEnd.heightCaught(this.rusty.y));
    this.score += bonus;
    floatLabel(this, this.rusty.x, this.rusty.y - this.rusty.displayHeight, String(bonus), COLORS.text);

    this.rusty.body.setVelocity(0, 0);
    this.rusty.body.setEnable(false);
    this.rusty.setX(levelEnd.x - LEVEL_END.holdOffset);
    this.rusty.showPose({ pose: 'jump', facing: 1 });
    this.tweens.add({
      targets: this.rusty,
      y: levelEnd.bottomY,
      duration: levelEnd.windDown(),
      onComplete: () => {
        this.rusty.body.setEnable(true);
        this.walkOffUntil = this.time.now + LEVEL_END.walkOffMs;
        this.ending = 'walking';
      },
    });
  }

  /** At the foot of the pole he lets go and walks on, and then the clock is counted into the score. */
  private finishLevel(): void {
    if (this.ending !== 'walking') return;
    if (this.time.now < this.walkOffUntil) {
      this.rusty.body.setVelocityX(RUSTY.walkSpeed);
      this.rusty.showPose({ pose: 'walk', facing: 1 });
      return;
    }
    this.countClockIntoScore();
  }

  /** Every unit left on the clock is worth points, counted off one at a time. */
  private countClockIntoScore(): void {
    this.ending = 'counting';
    this.rusty.body.setVelocityX(0);
    this.rusty.showPose({ pose: 'stand', facing: 1 });
    this.time.addEvent({
      delay: LEVEL_END.countdownMs,
      // One tick for each unit, and one more that finds the clock empty and moves on.
      repeat: this.timer.left,
      callback: () => {
        if (!this.timer.takeUnit()) {
          this.time.delayedCall(LEVEL_END.countedPauseMs, () => this.clearLevel());
          return;
        }
        this.score += SCORING.timeUnit;
        this.hud.show(this.hudValues());
      },
    });
  }

  /** The clock ran out: Rusty is beaten where he stands, as on the original console. */
  private timeUp(): void {
    addCenteredPixelText(this, TIME_UP_Y, 'TIME UP', { color: COLORS.danger }).setScrollFactor(0);
    this.defeat();
  }

  /** The run as it stands now, with what he has collected and his power in this level. */
  private currentRun(): RunState {
    return { ...this.run, coins: this.coins, score: this.score, power: this.rusty.power };
  }

  private clearLevel(): void {
    const run = this.currentRun();
    const nextRun = advanceLevel(run);
    if (nextRun) fadeToScene(this, SCENES.worldIntro, nextRun);
    else fadeToScene(this, SCENES.ending, { score: run.score });
  }

  private loseLife(): void {
    const run = this.currentRun();
    const nextRun = loseLife(run);
    if (nextRun) fadeToScene(this, SCENES.worldIntro, nextRun);
    else fadeToScene(this, SCENES.gameOver, { score: run.score });
  }
}
