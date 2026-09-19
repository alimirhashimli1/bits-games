import * as Phaser from 'phaser';

import { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, FIGHT_CLOCK, FIGHT_DEV_CONTROLS, PLAYER_CONTROLS, TIMINGS } from '../config';
import { builtArena } from '../content/arenas';
import { builtFighter } from '../content/fighters/fighterData';
import { ArenaView } from '../entities/ArenaView';
import { FighterView } from '../entities/FighterView';
import { ProjectileViews } from '../entities/ProjectileViews';
import { CpuPlayer } from '../systems/cpu/cpuPlayer';
import type { Controller } from '../systems/input/controller';
import { LocalInput } from '../systems/input/localInput';
import { DEFAULT_MATCH, type MatchResult, type MatchSetup, type PlayerIndex } from '../systems/matchSetup';
import { cameraLeft } from '../systems/sim/camera';
import { checksum } from '../systems/sim/checksum';
import { createFightState, type FightState, type Winner } from '../systems/sim/fightState';
import { FixedStepClock } from '../systems/sim/fixedStepClock';
import { stepFight, type StepInputs } from '../systems/sim/stepFight';
import { BoxDebugView } from './hud/BoxDebugView';
import { FightHud } from './hud/FightHud';
import { InputDebugPanel } from './hud/InputDebugPanel';
import { devCpuLevel } from './devMatchSetup';
import { SCENES } from './sceneKeys';

const DEV_HINT_Y = 172;
const REPLAY_RESULT_Y = 44;
const REPLAY_RESULT_MS = 2500;
const PLAYERS: readonly PlayerIndex[] = [0, 1];

/**
 * The fight: a whole match, round after round. Each frame it reads both players' inputs, runs as
 * many fixed steps of the simulation as the time allows, then draws the result. It never changes
 * the state itself; the rounds, the clock and the winner are all decided inside the simulation.
 * Once the match is over it moves on to the results.
 */
export class FightScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private devInput!: ActionInput<keyof typeof FIGHT_DEV_CONTROLS>;
  private players!: readonly [Controller, Controller];
  private arena!: ArenaView;
  private views!: readonly [FighterView, FighterView];
  private projectileViews!: ProjectileViews;
  private clock!: FixedStepClock;
  private setup!: MatchSetup;
  private state!: FightState;
  /** Every step's inputs since the fight began, for the replay check. */
  private recordedInputs: StepInputs[] = [];
  private replayResult!: Phaser.GameObjects.BitmapText;
  private inputPanel!: InputDebugPanel;
  private boxView!: BoxDebugView;
  private hud!: FightHud;
  private paused = false;
  private leaving = false;

  constructor() {
    super(SCENES.fight);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    this.setup = setup;
    this.devInput = new ActionInput(this, FIGHT_DEV_CONTROLS);
    this.players = this.createControllers(setup);
    this.clock = new FixedStepClock(FIGHT_CLOCK.stepsPerSecond, FIGHT_CLOCK.maxStepsPerFrame);
    this.state = createFightState(setup.fighters, setup.rules);
    this.recordedInputs = [];
    this.paused = false;
    this.leaving = false;

    this.arena = new ArenaView(this, builtArena(setup.arena));
    const [player1, player2] = setup.fighters;
    this.views = [new FighterView(this, builtFighter(player1)), new FighterView(this, builtFighter(player2))];
    this.projectileViews = new ProjectileViews(this);
    this.hud = new FightHud(this, setup.fighters);
    this.inputPanel = new InputDebugPanel(this);
    this.boxView = new BoxDebugView(this);
    if (import.meta.env.DEV) this.addDevLabels();
  }

  override update(_time: number, deltaMs: number): void {
    this.players.forEach((player) => player.readFrame());
    this.devInput.update();
    if (import.meta.env.DEV) this.handleDevKeys();

    const steps = this.clock.advance(deltaMs);
    const stepsToRun = this.paused ? Number(import.meta.env.DEV && this.devInput.justPressed('stepOnce')) : steps;
    for (let step = 0; step < stepsToRun; step += 1) this.runStep();

    this.arena.update(this.state);
    for (const player of PLAYERS) this.views[player].draw(this.state.fighters[player], this.isCelebrating(player));
    this.projectileViews.draw(this.state);
    this.inputPanel.draw(this.state);
    this.boxView.draw(this.state);
    this.hud.draw(this.state);
    this.cameras.main.setScroll(cameraLeft(this.state), 0);

    if (this.state.matchWinner !== null) this.leaveFor(this.state.matchWinner);
  }

  private runStep(): void {
    const inputs: StepInputs = [this.players[0].inputFor(this.state), this.players[1].inputFor(this.state)];
    this.state = stepFight(this.state, inputs);
    this.recordedInputs.push(inputs);
    this.inputPanel.observe(this.state);
  }

  /**
   * Who drives each fighter. In arcade mode player 2 is the CPU; in versus both are on this
   * computer, each with their own gamepad, and with one player at the keyboard any pad will do.
   * Online play (step 25) will add the other player over the network.
   */
  private createControllers(setup: MatchSetup): readonly [Controller, Controller] {
    const seed = (): number => Math.floor(Math.random() * 2 ** 32);
    const devCpu = devCpuLevel('p1cpu');
    const player1 = devCpu
      ? new CpuPlayer(0, devCpu, seed())
      : new LocalInput(this, PLAYER_CONTROLS[0], setup.mode === 'versus' ? 0 : undefined);
    const player2 = setup.mode === 'arcade' ? new CpuPlayer(1, setup.cpuLevel, seed()) : new LocalInput(this, PLAYER_CONTROLS[1], 1);
    return [player1, player2];
  }

  /** The winner of a round strikes their pose while the result is shown, and at the end of the match. */
  private isCelebrating(player: PlayerIndex): boolean {
    const { phase, winner } = this.state.round;
    return (phase === 'result' || phase === 'matchOver') && winner === player;
  }

  /** Once the match is decided, the scene lingers on it for a moment, then shows the results. */
  private leaveFor(winner: Winner): void {
    if (this.leaving) return;
    this.leaving = true;
    const result: MatchResult = { setup: this.setup, winner: winner === 'draw' ? null : winner };
    this.time.delayedCall(TIMINGS.matchOverMs, () => fadeToScene(this, SCENES.results, result));
  }

  private handleDevKeys(): void {
    if (this.devInput.justPressed('pause')) this.paused = !this.paused;
    if (this.devInput.justPressed('replayCheck')) this.runReplayCheck();
    if (this.devInput.justPressed('inputDebug')) this.inputPanel.toggle();
    if (this.devInput.justPressed('boxDebug')) this.boxView.toggle();
  }

  /**
   * Replays every recorded input from the very first state and compares the result with the
   * live fight. They must match exactly, or online play would drift apart.
   */
  private runReplayCheck(): void {
    const replayed = this.recordedInputs.reduce(stepFight, createFightState(this.setup.fighters, this.setup.rules));
    const matches = checksum(replayed) === checksum(this.state);
    const verdict = matches ? 'REPLAY MATCHES' : 'REPLAY MISMATCH';
    setCenteredPixelText(this.replayResult, `${verdict}: ${this.state.frame} STEPS`);
    this.replayResult.setTint(matches ? COLORS.title : COLORS.player1).setVisible(true);
    this.time.delayedCall(REPLAY_RESULT_MS, () => this.replayResult.setVisible(false));
  }

  /** In development builds: the dev keys along the bottom, and the replay check's verdict. */
  private addDevLabels(): void {
    const hint = addCenteredPixelText(this, DEV_HINT_Y, 'R REPLAY I INPUTS H BOXES P PAUSE O STEP', { color: COLORS.muted });
    this.replayResult = addCenteredPixelText(this, REPLAY_RESULT_Y, '', { color: COLORS.title }).setVisible(false);
    [hint, this.replayResult].forEach((label) => label.setScrollFactor(0));
  }
}
