import { audioContext, scheduleNoise, scheduleTone, type Wave } from './audioEngine';
import { note } from './notes';

export interface MusicNote {
  /** Which step of the loop the note starts on. */
  readonly step: number;
  readonly freq: number;
  /** Length in steps. */
  readonly steps: number;
  readonly wave: Wave;
  readonly volume: number;
}

/** A drum hit: a burst of filtered noise, low for a kick, high for a hi-hat. */
export interface MusicHit {
  readonly step: number;
  readonly durationMs: number;
  readonly volume: number;
  readonly cutoffHz: number;
}

export interface MusicTrack {
  readonly stepMs: number;
  /** Length of the loop in steps. */
  readonly steps: number;
  readonly notes: readonly MusicNote[];
  /** Drums, if the track has any. */
  readonly hits?: readonly MusicHit[];
}

/** How far ahead notes are handed to the audio clock. */
const LOOKAHEAD_SECONDS = 0.15;
/** How often to top the schedule up. Well inside the lookahead, so nothing is ever late. */
const SCHEDULE_INTERVAL_MS = 30;
/** A moment's head start, so the first notes are scheduled rather than already overdue. */
const START_DELAY_SECONDS = 0.06;

/**
 * Turns a row of note names into a line of music, one step each: `'A4'` plays, `null` rests.
 * A name may be held for several steps by writing it once and passing `steps`.
 */
export function line(
  names: readonly (string | null)[],
  { wave, volume, steps = 1 }: { wave: Wave; volume: number; steps?: number },
): MusicNote[] {
  return names.flatMap((name, step) => (name ? [{ step, freq: note(name), steps, wave, volume }] : []));
}

/**
 * Writes a line of music as text, one token per step: a note name such as `E5` or `F#3`
 * starts a note, `-` holds the note before it for another step, and `.` rests.
 * `'E5 - - G5 . C6 - -'` is E held for three steps, G for one, a rest, then C held for three.
 */
export function phrase(text: string, { wave, volume }: { wave: Wave; volume: number }): MusicNote[] {
  const notes: MusicNote[] = [];
  let held: { step: number; name: string; steps: number } | null = null;
  const finish = (): void => {
    if (held) notes.push({ step: held.step, freq: note(held.name), steps: held.steps, wave, volume });
    held = null;
  };
  text
    .split(/\s+/)
    .filter((token) => token !== '')
    .forEach((token, step) => {
      if (token === '-') {
        if (!held) throw new Error(`A "-" at step ${step} has no note to hold.`);
        held.steps++;
        return;
      }
      finish();
      if (token !== '.') held = { step, name: token, steps: 1 };
    });
  finish();
  return notes;
}

/** A drum pattern as text, one character per step: `x` hits, anything else rests. Spaces are ignored. */
export function beat(pattern: string, sound: Omit<MusicHit, 'step'>): MusicHit[] {
  return [...pattern.replace(/\s+/g, '')].flatMap((mark, step) => (mark === 'x' ? [{ ...sound, step }] : []));
}

/**
 * Plays looping music by handing notes to the Web Audio clock a little ahead of time.
 *
 * Restarting a sound at the end of a loop always leaves an audible seam, because it depends
 * on a timer firing at exactly the right millisecond. Scheduling ahead instead means the loop
 * boundary is just another step, and the loop is seamless.
 */
class MusicPlayer {
  private track: MusicTrack | null = null;
  private timer: number | null = null;
  private nextStepTime = 0;
  private step = 0;

  /** Starts a track, or does nothing if it is already the one playing. */
  play(track: MusicTrack): void {
    if (this.track === track) return;

    this.stop();
    const ctx = audioContext();
    this.track = track;
    this.step = 0;
    this.nextStepTime = ctx.currentTime + START_DELAY_SECONDS;
    this.timer = window.setInterval(() => this.schedule(), SCHEDULE_INTERVAL_MS);
    this.schedule();
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.track = null;
  }

  private schedule(): void {
    const track = this.track;
    if (!track) return;

    const ctx = audioContext();
    const stepSeconds = track.stepMs / 1000;

    while (this.nextStepTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
      const stepInLoop = this.step % track.steps;
      for (const music of track.notes) {
        if (music.step !== stepInLoop) continue;
        scheduleTone(
          {
            wave: music.wave,
            freq: music.freq,
            durationMs: music.steps * track.stepMs,
            volume: music.volume,
          },
          this.nextStepTime,
        );
      }
      for (const hit of track.hits ?? []) {
        if (hit.step !== stepInLoop) continue;
        scheduleNoise({ durationMs: hit.durationMs, volume: hit.volume, cutoffHz: hit.cutoffHz }, this.nextStepTime);
      }
      this.nextStepTime += stepSeconds;
      this.step++;
    }
  }
}

const player = new MusicPlayer();

/** Starts a looping track. Playing the track that is already running changes nothing, so music carries across scenes. */
export function playMusic(track: MusicTrack): void {
  player.play(track);
}

export function stopMusic(): void {
  player.stop();
}
