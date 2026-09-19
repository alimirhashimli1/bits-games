import type { FightState } from '../sim/fightState';
import type { InputBits } from './inputBits';

/**
 * Whatever drives one fighter: the keyboard and gamepad, the CPU, and later the other player
 * online. The fight asks it for an input on every step and cannot tell which it is.
 */
export interface Controller {
  /** Called once per screen frame, before that frame's steps. */
  readFrame(): void;
  /** Called on every step with the fight as it stands, for this step's input. */
  inputFor(state: FightState): InputBits;
}
