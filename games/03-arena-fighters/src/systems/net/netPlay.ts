import { NET } from '../../config';
import type { Controller } from '../input/controller';
import type { InputBits } from '../input/inputBits';
import type { InputSource } from '../input/inputSource';
import { checksum } from '../sim/checksum';
import type { FightState } from '../sim/fightState';
import type { StepInputs } from '../sim/stepFight';
import { Lockstep } from './lockstep';
import type { NetSession } from './netSession';

/** What is shown over the fight while it is held up waiting for the other browser. */
const WAITING_TEXT = 'WAITING FOR OPPONENT';

/**
 * One online fight's inputs. This player's controls go through the lockstep, which settles them
 * a few steps early and sends them; the opponent's come out of the session's inbox; and a step
 * is fought only once both are in hand, so the two browsers fight exactly the same steps in
 * exactly the same order.
 *
 * It also watches for the two ways an online match can go wrong: an opponent who has stopped
 * sending, and two copies of the fight that have drifted apart.
 */
export class NetPlay implements InputSource {
  private readonly lockstep: Lockstep;
  /** This side's checksums, waiting for the opponent's to compare them against. */
  private readonly sums = new Map<number, number>();
  private waitingMs = 0;
  private stalled = false;

  constructor(
    private readonly session: NetSession,
    private readonly local: Controller,
  ) {
    this.lockstep = new Lockstep(session.delay);
  }

  readFrame(): void {
    this.local.readFrame();
  }

  stepInputs(state: FightState): StepInputs | null {
    const { frame } = state;
    this.session.inbox.atFrame(frame);
    // Settled and sent before the step it belongs to is fought: that is where the delay goes.
    const decided = this.lockstep.decide(frame, this.local.inputFor(state));
    if (decided !== null) this.session.sendInput(decided.frame, decided.bits);

    const theirs = this.opponentInput(frame);
    this.stalled = theirs === undefined;
    if (theirs === undefined) return null;
    this.session.inbox.useInput(frame);
    const mine = this.lockstep.take(frame);
    return this.session.seat === 0 ? [mine, theirs] : [theirs, mine];
  }

  /**
   * The opponent's input for a step, once it has arrived. The opening steps are nobody's, and
   * are filled in here rather than waited for: they were due before either side began.
   */
  private opponentInput(frame: number): InputBits | undefined {
    return this.lockstep.opens(frame) ? 0 : this.session.inbox.input(frame);
  }

  /**
   * After every step. Once a second each side sends a fingerprint of its whole fight and
   * compares the one it is sent: if they differ the two games have drifted apart, and the match
   * is ended rather than left to run as two different fights on two screens.
   */
  observe(state: FightState): void {
    if (state.frame % NET.checkSteps !== 0) return;
    const sum = checksum(state);
    this.session.sendCheck(state.frame, sum);
    this.sums.set(state.frame, sum);
    this.compare();
  }

  /** Once a screen frame. An opponent who stops sending holds the fight up, then ends it. */
  update(deltaMs: number): void {
    this.waitingMs = this.stalled ? this.waitingMs + deltaMs : 0;
    if (this.waitingMs >= NET.disconnectMs) this.session.end('lost');
  }

  /** What to say over the fight while it is held up, once the wait is long enough to notice. */
  get notice(): string | null {
    return this.waitingMs >= NET.waitNoticeMs ? WAITING_TEXT : null;
  }

  private compare(): void {
    for (const [frame, mine] of this.sums) {
      const theirs = this.session.inbox.takeCheck(frame);
      if (theirs === undefined) continue;
      this.sums.delete(frame);
      if (theirs !== mine) {
        this.session.end('desync');
        return;
      }
    }
    // A fingerprint whose answer never came is forgotten, so unanswered ones cannot pile up.
    while (this.sums.size > NET.checkMemory) {
      const oldest = this.sums.keys().next().value;
      if (oldest === undefined) return;
      this.sums.delete(oldest);
    }
  }
}
