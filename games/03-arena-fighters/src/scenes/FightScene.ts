import * as Phaser from 'phaser';

import { playMusic, stopMusic } from '@shared/audio/music';
import { ActionInput } from '@shared/phaser/actionInput';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, FIGHT_CLOCK, FIGHT_DEV_CONTROLS, NET, PAUSE_CONTROL, PLAYER_CONTROLS, TIMINGS, type CpuLevel } from '../config';
import { builtArena } from '../content/arenas';
import { builtFighter } from '../content/fighters/fighterData';
import { ARENA_MUSIC } from '../content/music';
import { fighterSheetKey } from '../content/sprites/fighterSprites';
import { ensureAltFighterSprites } from '../content/sprites';
import { BOSS, type FighterId } from '../content/roster';
import { ArenaView } from '../entities/ArenaView';
import { FighterView } from '../entities/FighterView';
import { ProjectileViews } from '../entities/ProjectileViews';
import { CpuPlayer } from '../systems/cpu/cpuPlayer';
import { FightSounds } from '../systems/fightSounds';
import type { Controller } from '../systems/input/controller';
import type { InputSource } from '../systems/input/inputSource';
import { LocalInput } from '../systems/input/localInput';
import { LocalPair } from '../systems/input/localPair';
import {
  DEFAULT_MATCH,
  hasCpuOpponent,
  isTwoPlayer,
  type MatchResult,
  type MatchSetup,
  type PlayerIndex,
} from '../systems/matchSetup';
import { NetPlay } from '../systems/net/netPlay';
import { closeSession, currentSession } from '../systems/net/netSession';
import { NET_END_TEXT, type NetEndReason } from '../systems/net/peerLink';
import { cameraLeft } from '../systems/sim/camera';
import { checksum } from '../systems/sim/checksum';
import { createFightState, type FightState, type Winner } from '../systems/sim/fightState';
import { FixedStepClock } from '../systems/sim/fixedStepClock';
import { stepFight, type StepInputs } from '../systems/sim/stepFight';
import { BoxDebugView } from './hud/BoxDebugView';
import { FightHud } from './hud/FightHud';
import { InputDebugPanel } from './hud/InputDebugPanel';
import type { PauseSceneData } from './PauseScene';
import { devCpuLevel } from './devMatchSetup';
import { SCENES } from './sceneKeys';

const DEV_HINT_Y = 172;
/** Where the fight says it is waiting for the other browser, or why it has stopped. */
const NOTICE_Y = 60;
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
  private pauseInput!: ActionInput<keyof typeof PAUSE_CONTROL>;
  private inputs!: InputSource;
  /** Set in an online match only: the same input source, asked about the state of the line. */
  private net: NetPlay | undefined;
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
  private sounds!: FightSounds;
  private notice!: Phaser.GameObjects.BitmapText;
  private paused = false;
  private leaving = false;

  constructor() {
    super(SCENES.fight);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    this.setup = setup;
    this.devInput = new ActionInput(this, FIGHT_DEV_CONTROLS);
    this.pauseInput = new ActionInput(this, PAUSE_CONTROL);
    this.net = undefined;
    this.inputs = this.createInputs(setup);
    this.clock = new FixedStepClock(FIGHT_CLOCK.stepsPerSecond, FIGHT_CLOCK.maxStepsPerFrame);
    this.state = createFightState(setup.fighters, setup.rules);
    this.recordedInputs = [];
    this.paused = false;
    this.leaving = false;
    // The fight makes no noise itself: this watches the states go by and plays what changed,
    // starting with the state it opens on, where the first round is called.
    this.sounds = new FightSounds();
    this.sounds.observe(this.state);
    playMusic(ARENA_MUSIC[setup.arena]);

    this.arena = new ArenaView(this, builtArena(setup.arena));
    const [player1, player2] = setup.fighters;
    // Both sides picked the same fighter, so player 2 wears that fighter's alternate colours.
    const mirror = player1 === player2;
    if (mirror) ensureAltFighterSprites(this, builtFighter(player2));
    this.views = [
      new FighterView(this, fighterSheetKey(builtFighter(player1), false)),
      new FighterView(this, fighterSheetKey(builtFighter(player2), mirror)),
    ];
    this.projectileViews = new ProjectileViews(this);
    this.hud = new FightHud(this, setup.fighters);
    this.inputPanel = new InputDebugPanel(this);
    this.boxView = new BoxDebugView(this);
    this.notice = addCenteredPixelText(this, NOTICE_Y, '', { color: COLORS.title }).setScrollFactor(0).setVisible(false);
    if (import.meta.env.DEV) this.addDevLabels();

    // The pause menu stops the music while it is open, so the arena starts its loop again here.
    this.events.on(Phaser.Scenes.Events.RESUME, this.resumeFight, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.resumeFight, this);
    });
  }

  override update(_time: number, deltaMs: number): void {
    this.inputs.readFrame();
    this.devInput.update();
    this.pauseInput.update();
    if (import.meta.env.DEV) this.handleDevKeys();
    if (this.canPause() && this.pauseInput.justPressed('pause')) {
      this.openPauseMenu();
      return;
    }

    const steps = this.clock.advance(deltaMs);
    const stepsToRun = this.paused ? Number(import.meta.env.DEV && this.devInput.justPressed('stepOnce')) : steps;
    // A step whose online opponent has not answered yet is not run, and nor is anything after it.
    for (let step = 0; step < stepsToRun; step += 1) {
      if (!this.runStep()) break;
    }
    this.net?.update(deltaMs);

    this.arena.update(this.state);
    for (const player of PLAYERS) this.views[player].draw(this.state.fighters[player], this.isCelebrating(player));
    this.projectileViews.draw(this.state);
    this.inputPanel.draw(this.state);
    this.boxView.draw(this.state);
    this.hud.draw(this.state);
    this.cameras.main.setScroll(cameraLeft(this.state), 0);

    if (this.net) this.watchLine(this.net);
    if (this.state.matchWinner !== null) this.leaveFor(this.state.matchWinner);
  }

  /**
   * Whether the fight can be stopped at all. An online match cannot: the other browser fights
   * on regardless, and a fight that stopped on one side alone would only fall out of step. A
   * match already on its way to the results is left alone too.
   */
  private canPause(): boolean {
    return this.net === undefined && !this.leaving;
  }

  /** Freezes the fight and lays the pause menu over it. */
  private openPauseMenu(): void {
    const data: PauseSceneData = { pausedScene: SCENES.fight };
    this.scene.pause();
    this.scene.launch(SCENES.pause, data);
  }

  private resumeFight(): void {
    playMusic(ARENA_MUSIC[this.setup.arena]);
  }

  /** One step of the fight, or false when the online opponent's input for it has not arrived. */
  private runStep(): boolean {
    const inputs: StepInputs | null = this.inputs.stepInputs(this.state);
    if (inputs === null) return false;
    this.state = stepFight(this.state, inputs);
    this.recordedInputs.push(inputs);
    this.inputPanel.observe(this.state);
    this.sounds.observe(this.state);
    this.net?.observe(this.state);
    return true;
  }

  /**
   * Where a step's inputs come from. Online it is the lockstep: this player's controls go into
   * it and the opponent's come out of it, a few steps behind. Everywhere else both fighters are
   * driven from this computer and every step is ready the moment it is asked for.
   */
  private createInputs(setup: MatchSetup): InputSource {
    const session = currentSession();
    if (setup.mode === 'online' && session !== undefined) {
      // One player at this keyboard, whichever side of the screen the match put them on.
      this.net = new NetPlay(session, new LocalInput(this, PLAYER_CONTROLS[0]));
      return this.net;
    }
    return new LocalPair(this.createControllers(setup));
  }

  /**
   * Who drives each fighter on this computer. Against the computer — arcade or VS CPU — player 2
   * is the CPU; in versus both are here, each with their own gamepad, and with one player at the
   * keyboard any pad will do.
   */
  private createControllers(setup: MatchSetup): readonly [Controller, Controller] {
    const seed = (): number => Math.floor(Math.random() * 2 ** 32);
    const devCpu = devCpuLevel('p1cpu');
    const player1 = devCpu
      ? new CpuPlayer(0, cpuLevelFor(setup.fighters[0], devCpu), seed())
      : new LocalInput(this, PLAYER_CONTROLS[0], isTwoPlayer(setup.mode) ? 0 : undefined);
    const player2 =
      hasCpuOpponent(setup.mode)
        ? new CpuPlayer(1, cpuLevelFor(setup.fighters[1], setup.cpuLevel), seed())
        : new LocalInput(this, PLAYER_CONTROLS[1], 1);
    return [player1, player2];
  }

  /** The winner of a round strikes their pose while the result is shown, and at the end of the match. */
  private isCelebrating(player: PlayerIndex): boolean {
    const { phase, winner } = this.state.round;
    return (phase === 'result' || phase === 'matchOver') && winner === player;
  }

  /**
   * How the line is doing, each frame of an online match. Once the scene is on its way out
   * the notice is left as it is, so the reason the match ended is not written over by the
   * fight it left standing still.
   */
  private watchLine(net: NetPlay): void {
    if (this.leaving) return;
    const ended = currentSession()?.ended ?? null;
    if (ended !== null) this.leaveLine(ended);
    else this.showNotice(net.notice);
  }

  /**
   * An online match that has ended by itself — the opponent left, the line went quiet, or the
   * two copies of the fight drifted apart — says so and goes back to the title. There is no
   * result to show: this match was never finished.
   */
  private leaveLine(reason: NetEndReason): void {
    if (this.leaving) return;
    this.leaving = true;
    stopMusic();
    closeSession(reason);
    this.notice.setTint(COLORS.player1);
    this.showNotice(NET_END_TEXT[reason]);
    this.time.delayedCall(NET.noticeMs, () => fadeToScene(this, SCENES.title));
  }

  /** The one line the fight puts over itself: waiting for an opponent, or why it has stopped. */
  private showNotice(text: string | null): void {
    if (text === null) {
      this.notice.setVisible(false);
      return;
    }
    if (text !== this.notice.text) setCenteredPixelText(this.notice, text);
    this.notice.setVisible(true);
  }

  /** Once the match is decided, the scene lingers on it for a moment, then shows the results. */
  private leaveFor(winner: Winner): void {
    if (this.leaving) return;
    this.leaving = true;
    // The winner's jingle is already playing, and it should have the room to itself.
    stopMusic();
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

/**
 * How well a CPU plays this fighter. Magnus Vane always fights at his own level, whatever the
 * match asked for: he is the end of arcade mode, not a difficulty setting.
 */
function cpuLevelFor(fighter: FighterId, chosen: CpuLevel): CpuLevel {
  return fighter === BOSS.id ? 'boss' : chosen;
}
