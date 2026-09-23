import type { FightState } from '../sim/fightState';
import type { StepInputs } from '../sim/stepFight';
import type { Controller } from './controller';
import type { InputSource } from './inputSource';

/** Both fighters driven from this computer — keyboards, gamepads, the CPU — so every step is ready. */
export class LocalPair implements InputSource {
  constructor(private readonly players: readonly [Controller, Controller]) {}

  readFrame(): void {
    for (const player of this.players) player.readFrame();
  }

  stepInputs(state: FightState): StepInputs {
    return [this.players[0].inputFor(state), this.players[1].inputFor(state)];
  }
}
