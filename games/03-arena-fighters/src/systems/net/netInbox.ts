import { NET } from '../../config';
import type { InputBits } from '../input/inputBits';

/**
 * What the opponent has sent and the fight has not used yet: one input per step, and a checksum
 * every second. It is kept here, outside any scene, because messages arrive whenever the other
 * browser sends them — during the VS screen, or while this side is still on the results — and
 * a message dropped because no screen was listening would stop the match dead.
 *
 * Messages are kept by match as well as by frame: after a rematch both sides count steps from
 * zero again, and the side that agreed first starts sending before the other has left the
 * results screen.
 *
 * It is also where a message's frame is judged (rule 14). A frame is only useful near the step
 * being fought: an input from the step onwards, a checksum from a window behind it, and neither
 * from further ahead than a window. Anything else is nonsense and is dropped rather than kept.
 */
export class NetInbox {
  private readonly inputs = new Map<number, Map<number, InputBits>>();
  private readonly checks = new Map<number, Map<number, number>>();
  private match = 0;
  private frame = 0;

  /** The step being fought, so that what arrives can be judged against it. */
  atFrame(frame: number): void {
    this.frame = frame;
  }

  /** A new fight: everything said about the last one is thrown away. */
  atMatch(match: number): void {
    this.match = match;
    this.frame = 0;
    forgetBefore(this.inputs, match);
    forgetBefore(this.checks, match);
  }

  /** An input is only of use from the step being fought onwards: it is fought, then forgotten. */
  addInput(match: number, frame: number, bits: InputBits): void {
    if (this.outOfRange(match, frame, 0)) return;
    mapFor(this.inputs, match).set(frame, bits);
  }

  /** A checksum is always of a step already fought, so it arrives from behind, not ahead. */
  addCheck(match: number, frame: number, sum: number): void {
    if (this.outOfRange(match, frame, NET.frameWindow)) return;
    mapFor(this.checks, match).set(frame, sum);
  }

  /** The opponent's input for a step, without using it up: the step may not be ready to run. */
  input(frame: number): InputBits | undefined {
    return this.inputs.get(this.match)?.get(frame);
  }

  /** The step has been fought, so its input is finished with. */
  useInput(frame: number): void {
    this.inputs.get(this.match)?.delete(frame);
  }

  /** The opponent's checksum for a step, used up as it is read: it is only ever compared once. */
  takeCheck(frame: number): number | undefined {
    const checks = this.checks.get(this.match);
    const sum = checks?.get(frame);
    checks?.delete(frame);
    return sum;
  }

  /**
   * Whether a frame is worth keeping, judged against the step being fought: never more than a
   * window ahead of it, and no further behind it than `behind` allows. A frame for the next
   * match is judged from its first step, since this side has not started counting it yet.
   */
  private outOfRange(match: number, frame: number, behind: number): boolean {
    if (match < this.match || match > this.match + 1) return true;
    const here = match === this.match ? this.frame : 0;
    return frame < here - behind || frame > here + NET.frameWindow;
  }
}

function mapFor<T>(byMatch: Map<number, Map<number, T>>, match: number): Map<number, T> {
  const existing = byMatch.get(match);
  if (existing) return existing;
  const created = new Map<number, T>();
  byMatch.set(match, created);
  return created;
}

function forgetBefore<T>(byMatch: Map<number, Map<number, T>>, match: number): void {
  for (const key of byMatch.keys()) {
    if (key < match) byMatch.delete(key);
  }
}
