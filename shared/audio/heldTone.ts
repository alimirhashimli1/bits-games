import { audioContext, audioOutput, type Wave } from './audioEngine';

/** How quickly pitch and volume glide to a new setting, in seconds: fast, but never a click. */
const GLIDE_SECONDS = 0.03;

export interface HeldToneOptions {
  readonly wave: Wave;
  /** Low-pass cutoff, to take the edge off a buzzy wave. None if left out. */
  readonly cutoffHz?: number;
}

/**
 * A tone that keeps sounding until it is stopped, with its pitch and volume changed as it
 * plays: an engine note that follows the revs, or a tyre squeal that comes and goes.
 * It starts silent.
 */
export class HeldTone {
  private readonly oscillator: OscillatorNode;
  private readonly gain: GainNode;
  private stopped = false;

  constructor({ wave, cutoffHz }: HeldToneOptions) {
    const ctx = audioContext();
    this.oscillator = ctx.createOscillator();
    this.oscillator.type = wave;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0;

    let chain: AudioNode = this.oscillator;
    if (cutoffHz !== undefined) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoffHz;
      chain = chain.connect(filter);
    }
    chain.connect(this.gain).connect(audioOutput());
    this.oscillator.start();
  }

  /** Glides to a new pitch (hertz) and volume (0 is silent). */
  set(freq: number, volume: number): void {
    if (this.stopped) return;
    const now = audioContext().currentTime;
    this.oscillator.frequency.setTargetAtTime(freq, now, GLIDE_SECONDS);
    this.gain.gain.setTargetAtTime(volume, now, GLIDE_SECONDS);
  }

  /** Fades out and releases the tone for good. */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    const now = audioContext().currentTime;
    this.gain.gain.setTargetAtTime(0, now, GLIDE_SECONDS);
    // Five glide times is silent to the ear.
    this.oscillator.stop(now + GLIDE_SECONDS * 5);
  }
}
