/**
 * Tiny chiptune sound effects built on the Web Audio API.
 *
 * Browsers block audio until the player interacts with the page, so the
 * audio context is created on the first key press, click or tap.
 */

export interface ToneOptions {
  /** Start pitch in hertz. */
  readonly frequency: number;
  /** Length in seconds. */
  readonly duration: number;
  readonly waveform?: OscillatorType;
  /** Loudness from 0 to 1. */
  readonly volume?: number;
  /** End pitch in hertz, for a sliding sound. */
  readonly slideTo?: number;
  /** Seconds to wait before playing. */
  readonly delay?: number;
}

const DEFAULT_VOLUME = 0.08;
/** Exponential fades cannot reach exactly zero. */
const SILENCE = 0.0001;

let audioContext: AudioContext | null = null;

export function unlockAudioOnFirstInput(): void {
  const unlock = (): void => {
    audioContext ??= new AudioContext();
    void audioContext.resume();
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

/** Plays one retro beep. Does nothing until audio has been unlocked. */
export function playTone(options: ToneOptions): void {
  if (!audioContext) return;

  const { frequency, duration, waveform = 'square', volume = DEFAULT_VOLUME, slideTo, delay = 0 } = options;
  const startAt = audioContext.currentTime + delay;
  const endAt = startAt + duration;

  const oscillator = audioContext.createOscillator();
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  if (slideTo !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, endAt);
  }

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(SILENCE, endAt);

  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(endAt);
}
