import { MATCH_DEFAULTS, type CpuLevel } from '../config';
import type { ArenaId } from '../content/arenas/arenaTypes';
import { FIGHTER_IDS, type FighterId } from '../content/roster';

export type GameMode = 'arcade' | 'versus' | 'online';

/** Player 1 is index 0 and player 2 is index 1, on the left and right at the start of a round. */
export type PlayerIndex = 0 | 1;

/** How long rounds last and how many make a match. The options screen will set these. */
export interface MatchRules {
  readonly roundSeconds: number;
  /** Round wins needed to take the match; the match lasts at most twice this, less one, rounds. */
  readonly roundsToWin: number;
}

/** What a match is: how it is played, who is fighting, where, and by which rules. Handed from scene to scene. */
export interface MatchSetup {
  readonly mode: GameMode;
  readonly fighters: readonly [FighterId, FighterId];
  readonly arena: ArenaId;
  readonly rules: MatchRules;
  /** How well the CPU plays, when there is one (player 2 in arcade mode). */
  readonly cpuLevel: CpuLevel;
}

/** How a match ended, for the results screen. No winner is a draw game. */
export interface MatchResult {
  readonly setup: MatchSetup;
  readonly winner: PlayerIndex | null;
}

export const DEFAULT_MATCH: MatchSetup = {
  mode: 'versus',
  fighters: ['brand', 'tala'],
  arena: 'docks',
  rules: MATCH_DEFAULTS,
  cpuLevel: 'normal',
};

/** Moves through the roster by `step`, wrapping round at either end. */
export function stepFighter(id: FighterId, step: number): FighterId {
  const count = FIGHTER_IDS.length;
  const index = (FIGHTER_IDS.indexOf(id) + step + count) % count;
  return FIGHTER_IDS[index] ?? id;
}
