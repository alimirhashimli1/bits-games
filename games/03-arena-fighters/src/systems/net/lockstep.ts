import type { InputBits } from '../input/inputBits';

/**
 * This side's half of a lockstep match: the input for a step is decided a few steps before the
 * step is fought, and sent at once, which is what gives it time to reach the other browser.
 *
 * The opening steps are fought by nobody, since their inputs were due before the fight began.
 * Both browsers fill them the same way, so both still compute the same fight, and they are spent
 * on the "ROUND 1" announcement, where the controls do nothing anyway.
 *
 * There is no way for the two sides to wedge each other. A side sends the input for a step
 * before fighting the one `delay` steps earlier, so a side waiting on the other is always the
 * one further ahead, and the other has everything it needs to catch up.
 */
export class Lockstep {
  private readonly decided = new Map<number, InputBits>();
  private next: number;

  constructor(private readonly delay: number) {
    for (let frame = 0; frame < delay; frame += 1) this.decided.set(frame, 0);
    this.next = delay;
  }

  /**
   * Settles this side's input for the step `delay` ahead of `frame`, and hands back the step it
   * belongs to so that it can be sent. Returns nothing when that step is already settled.
   */
  decide(frame: number, bits: InputBits): { readonly frame: number; readonly bits: InputBits } | null {
    const due = frame + this.delay;
    if (due < this.next) return null;
    this.decided.set(due, bits);
    this.next = due + 1;
    return { frame: due, bits };
  }

  /**
   * True for the opening steps. Their inputs were due before the fight began, so neither side
   * sends them and neither waits for them: both fill them in with nothing, the same way.
   */
  opens(frame: number): boolean {
    return frame < this.delay;
  }

  /** This side's input for a step, which is finished with once the step has been fought. */
  take(frame: number): InputBits {
    const bits = this.decided.get(frame) ?? 0;
    this.decided.delete(frame);
    return bits;
  }
}
