/**
 * A tiny chiptune engine. Sounds are written as data — layered oscillator tones and bursts
 * of filtered noise — and synthesised with the Web Audio API when they play, so the games
 * ship no audio files, exactly as the art ships no image files.
 */

export type Wave = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface ToneSpec {
  readonly wave: Wave;
  readonly freq: number;
  /** Slides to this pitch across the tone, for falls and whooshes. */
  readonly toFreq?: number;
  readonly durationMs: number;
  /** Delay before this layer starts, which is how one spec becomes a little tune. */
  readonly delayMs?: number;
  readonly volume?: number;
  readonly attackMs?: number;
}

export interface NoiseSpec {
  readonly durationMs: number;
  readonly delayMs?: number;
  readonly volume?: number;
  /** Low-pass cutoff: low for a thud, high for a hiss. */
  readonly cutoffHz?: number;
}

/** One sound effect: any number of tones and noise bursts, played together. */
export interface SoundSpec {
  readonly tones?: readonly ToneSpec[];
  readonly noise?: readonly NoiseSpec[];
}

const DEFAULT_VOLUME = 0.25;
const DEFAULT_ATTACK_MS = 4;
const DEFAULT_CUTOFF_HZ = 1200;
/** Master level, low enough that several sounds at once do not clip. */
const MASTER_VOLUME = 0.5;
/** A whole second of noise, generated once and reused by every burst. */
const NOISE_SECONDS = 1;
/** Leaves the node running a moment past its envelope, so nothing clicks as it stops. */
const TAIL_SECONDS = 0.02;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted = false;

/** The shared context, created on first use. */
export function audioContext(): AudioContext {
  if (!context) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = muted ? 0 : MASTER_VOLUME;
    master.connect(context.destination);
  }
  return context;
}

function output(): GainNode {
  audioContext();
  if (!master) throw new Error('The audio engine has no output node.');
  return master;
}

/**
 * Browsers refuse to make noise until the page has been interacted with, so the context is
 * resumed on the first key press or click. Safe to call more than once.
 */
export function unlockAudio(): void {
  const resume = (): void => {
    const ctx = audioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  };
  window.addEventListener('keydown', resume, { once: true });
  window.addEventListener('pointerdown', resume, { once: true });
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (master) master.gain.value = muted ? 0 : MASTER_VOLUME;
}

/** Flips mute and reports the new state, for a key binding to show. */
export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

/** Plays a sound now. */
export function playSound(spec: SoundSpec): void {
  const ctx = audioContext();
  if (ctx.state === 'suspended') return;

  const now = ctx.currentTime;
  spec.tones?.forEach((tone) => scheduleTone(tone, now + (tone.delayMs ?? 0) / 1000));
  spec.noise?.forEach((noise) => scheduleNoise(noise, now + (noise.delayMs ?? 0) / 1000));
}

/** Plays one tone at an exact moment on the audio clock; the music scheduler works in these. */
export function scheduleTone(spec: ToneSpec, startTime: number): void {
  const ctx = audioContext();
  const duration = spec.durationMs / 1000;
  const attack = Math.min((spec.attackMs ?? DEFAULT_ATTACK_MS) / 1000, duration / 2);

  const oscillator = ctx.createOscillator();
  oscillator.type = spec.wave;
  oscillator.frequency.setValueAtTime(spec.freq, startTime);
  if (spec.toFreq !== undefined) {
    // Exponential ramps cannot reach zero, so the target is kept above silence.
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, spec.toFreq), startTime + duration);
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(spec.volume ?? DEFAULT_VOLUME, startTime + attack);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gain).connect(output());
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + TAIL_SECONDS);
}

/** A burst of noise: footsteps, impacts and anything else without a pitch. */
export function scheduleNoise(spec: NoiseSpec, startTime: number): void {
  const ctx = audioContext();
  const duration = spec.durationMs / 1000;

  const source = ctx.createBufferSource();
  source.buffer = whiteNoise(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = spec.cutoffHz ?? DEFAULT_CUTOFF_HZ;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(spec.volume ?? DEFAULT_VOLUME, startTime);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  source.connect(filter).connect(gain).connect(output());
  source.start(startTime);
  source.stop(startTime + duration + TAIL_SECONDS);
}

function whiteNoise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;

  const buffer = ctx.createBuffer(1, ctx.sampleRate * NOISE_SECONDS, ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;

  noiseBuffer = buffer;
  return buffer;
}
