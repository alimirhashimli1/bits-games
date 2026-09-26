import { playSound } from '@shared/audio/audioEngine';
import { HeldTone } from '@shared/audio/heldTone';

import { BUMP } from '../../content/sounds';
import { SOUND } from '../../config';
import type { CarState } from '../driving/carPhysics';
import { enginePitch } from './carNoise';

/** The sound of the Comet this step. */
export interface CarNoise {
  readonly car: CarState;
  readonly throttle: boolean;
  readonly squealing: boolean;
}

/** One octave down. */
const SUB_OCTAVE = 0.5;

/**
 * The race's held sounds: the engine note, which follows the revs, and the tyre squeal, which
 * comes and goes. Also keeps a bump against a vehicle from thudding every step it touches.
 * Call `stop()` when the race scene is left, or the engine would drone on.
 */
export class RaceAudio {
  private readonly engine = new HeldTone({ wave: 'sawtooth', cutoffHz: SOUND.engine.cutoffHz });
  private readonly engineSub = new HeldTone({ wave: 'square', cutoffHz: SOUND.engine.cutoffHz });
  private readonly squeal = new HeldTone({ wave: 'square', cutoffHz: SOUND.squeal.cutoffHz });
  private steps = 0;
  private lastBumpStep = -Infinity;

  constructor(private readonly random: () => number) {}

  update({ car, throttle, squealing }: CarNoise): void {
    this.steps++;
    const pitch = enginePitch(car);
    const volume = throttle ? SOUND.engine.volume : SOUND.engine.coastVolume;
    this.engine.set(pitch, volume);
    this.engineSub.set(pitch * SUB_OCTAVE, SOUND.engine.subVolume);

    const { freqHz, wobbleHz } = SOUND.squeal;
    const wobble = (this.random() * 2 - 1) * wobbleHz;
    this.squeal.set(freqHz + wobble, squealing ? SOUND.squeal.volume : 0);
  }

  /** Thuds for a touch, unless it is the same touch still going on. */
  bump(): void {
    if (this.steps - this.lastBumpStep > SOUND.bumpRepeatSteps) playSound(BUMP);
    this.lastBumpStep = this.steps;
  }

  /** Silent for now, as while paused. The next `update()` brings the sound back. */
  hush(): void {
    this.engine.set(SOUND.engine.idleHz, 0);
    this.engineSub.set(SOUND.engine.idleHz, 0);
    this.squeal.set(SOUND.squeal.freqHz, 0);
  }

  stop(): void {
    this.engine.stop();
    this.engineSub.stop();
    this.squeal.stop();
  }
}
