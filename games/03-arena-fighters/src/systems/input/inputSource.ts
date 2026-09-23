import type { FightState } from '../sim/fightState';
import type { StepInputs } from '../sim/stepFight';

/**
 * Where one step's inputs come from. On this computer both are always there, so a step can
 * always be fought; online the opponent's input has to arrive first, and until it does there
 * are no inputs to fight the step with and the fight waits.
 */
export interface InputSource {
  /** Called once per screen frame, before that frame's steps. */
  readFrame(): void;
  /** Both players' input for the state's next step, or nothing while the opponent's is missing. */
  stepInputs(state: FightState): StepInputs | null;
}
