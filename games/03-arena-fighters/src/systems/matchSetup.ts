import { MATCH_DEFAULTS, type CpuLevel } from '../config';
import type { ArenaId } from '../content/arenas/arenaTypes';
import { FIGHTER_IDS, type FighterId, type PlayableId } from '../content/roster';
import type { ArcadeRun } from './arcade';

/**
 * How a match is played. `solo` is a single match against the computer, with the opponent and
 * the arena drawn at random: arcade without the ladder, the story or the continues.
 */
export type GameMode = 'arcade' | 'solo' | 'versus' | 'online';

/**
 * True when player 2 is the computer. Asked rather than compared against one mode by name, so
 * that adding a mode is a change in one place instead of a comparison quietly falling through
 * everywhere it was not updated.
 */
export function hasCpuOpponent(mode: GameMode): boolean {
  return mode === 'arcade' || mode === 'solo';
}

/** True when two people are playing on this computer, each on their own half of the controls. */
export function isTwoPlayer(mode: GameMode): boolean {
  return mode === 'versus';
}

/**
 * True when one player chooses both fighters on the character select: their own, and then the
 * one the computer will play. Arcade draws its opponents from the ladder and online is given
 * them by the other browser, so in those the player chooses only their own.
 */
export function choosesOpponent(mode: GameMode): boolean {
  return mode === 'solo';
}

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
  /**
   * Who chose this arena, in versus. The choice passes to whoever loses, so the next screen
   * needs to know who had it; arcade and VS CPU draw their own arena and leave it out.
   */
  readonly arenaPicker?: PlayerIndex;
  /** The ladder this match is a rung of, in arcade mode. Left out by versus and online. */
  readonly arcade?: ArcadeRun;
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


/**
 * Who chooses the arena for the next versus match: the player who just lost it. Player 1 picks
 * the first one, since nobody has lost yet. A draw game hands the choice to the other side, so
 * it changes hands rather than sticking with whoever already had it.
 *
 * It lives here rather than on the screen that uses it because it is a rule of the match, not a
 * piece of drawing, and out here it can be checked without a browser.
 */
export function nextArenaPicker(setup: MatchSetup, winner: PlayerIndex | null): PlayerIndex {
  return otherPlayer(winner ?? setup.arenaPicker ?? 0);
}

export function otherPlayer(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0;
}

/** Moves through the roster by `step`, wrapping round at either end. The boss is not in it. */
export function stepFighter(id: PlayableId, step: number): PlayableId {
  const count = FIGHTER_IDS.length;
  const index = (FIGHTER_IDS.indexOf(id) + step + count) % count;
  return FIGHTER_IDS[index] ?? id;
}
