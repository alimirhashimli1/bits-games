import { MATCH_DEFAULTS, type ChosenCpuLevel } from '../config';
import type { MatchRules } from './matchSetup';

/**
 * The options screen's settings, remembered between visits.
 *
 * Storage can be missing or refuse outright (a private window, blocked site data), and what
 * comes back from it is as untrustworthy as anything else written outside the game, so every
 * field is checked against the choices below and anything else falls back to the default. The
 * game then simply plays with the defaults instead of failing to start.
 */
export interface GameSettings {
  /** How well the computer plays, in arcade and VS CPU. The boss is not affected: he has his own level. */
  readonly cpuLevel: ChosenCpuLevel;
  readonly roundSeconds: number;
  readonly roundsToWin: number;
  /** Off is the same silence the M key gives, kept for next time. */
  readonly sound: boolean;
}

/** What each setting may be, in the order left and right walk through them. */
export const CPU_LEVEL_CHOICES: readonly ChosenCpuLevel[] = ['easy', 'normal', 'hard'];
export const ROUND_SECONDS_CHOICES: readonly number[] = [30, 60, 99];
export const ROUNDS_TO_WIN_CHOICES: readonly number[] = [1, 2, 3];

const STORAGE_KEY = 'arena-fighters.options';

const DEFAULTS: GameSettings = {
  cpuLevel: 'normal',
  roundSeconds: MATCH_DEFAULTS.roundSeconds,
  roundsToWin: MATCH_DEFAULTS.roundsToWin,
  sound: true,
};

/** Read once and kept here, so a screen that asks every frame does not touch storage every frame. */
let current: GameSettings | null = null;

export function settings(): GameSettings {
  current ??= readSettings();
  return current;
}

/** Changes some of the settings and remembers them. */
export function changeSettings(patch: Partial<GameSettings>): GameSettings {
  current = { ...settings(), ...patch };
  writeSettings(current);
  return current;
}

/** The rules a new match is started with. */
export function matchRules(): MatchRules {
  const { roundSeconds, roundsToWin } = settings();
  return { roundSeconds, roundsToWin };
}

function readSettings(): GameSettings {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored === null || typeof stored !== 'object') return DEFAULTS;
    const fields = stored as Record<string, unknown>;
    return {
      cpuLevel: oneOf(CPU_LEVEL_CHOICES, fields['cpuLevel'], DEFAULTS.cpuLevel),
      roundSeconds: oneOf(ROUND_SECONDS_CHOICES, fields['roundSeconds'], DEFAULTS.roundSeconds),
      roundsToWin: oneOf(ROUNDS_TO_WIN_CHOICES, fields['roundsToWin'], DEFAULTS.roundsToWin),
      sound: typeof fields['sound'] === 'boolean' ? fields['sound'] : DEFAULTS.sound,
    };
  } catch {
    // Unreadable or not valid JSON: the defaults are as good a starting point as ever.
    return DEFAULTS;
  }
}

function writeSettings(value: GameSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The settings still hold for this visit; they are simply forgotten by the next one.
  }
}

/** The stored value if it is one the game offers, and the default otherwise. */
function oneOf<T>(choices: readonly T[], value: unknown, fallback: T): T {
  return choices.includes(value as T) ? (value as T) : fallback;
}

/** The value after `step` places along the list, wrapping round at either end. */
export function stepChoice<T>(choices: readonly T[], value: T, step: number): T {
  const here = choices.indexOf(value);
  const next = (here + step + choices.length) % choices.length;
  return choices[next] ?? value;
}
