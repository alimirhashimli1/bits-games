import { choosesOpponent, isTwoPlayer, type GameMode, type PlayerIndex } from '../../systems/matchSetup';

/** Which sides have settled on a fighter. Both must, wherever both are chosen on this screen. */
export type Settled = Readonly<Record<PlayerIndex, boolean>>;

/** What a back press does: give a settled side back to whoever chose it, or leave the screen. */
export type BackStep = { readonly kind: 'unsettle'; readonly side: PlayerIndex } | { readonly kind: 'leave' };

const BOTH: readonly PlayerIndex[] = [0, 1];

/**
 * How the character select is worked, by mode. It is here rather than in the scene because it is
 * the order the screen is used in, not a piece of drawing, and out here it can be run through a
 * whole sequence of presses without a browser.
 */

/** The sides chosen on this screen: both in versus and in VS CPU, and player 1's alone otherwise. */
export function sidesChosen(mode: GameMode): readonly PlayerIndex[] {
  return isTwoPlayer(mode) || choosesOpponent(mode) ? BOTH : [0];
}

/**
 * Which side a lone player's cursor is on. In VS CPU one player chooses twice, so the cursor
 * moves to the opponent's side once their own fighter is settled; everywhere else it stays on
 * their own, and in versus each player has a cursor of their own and this is not asked.
 */
export function activeSide(mode: GameMode, settled: Settled): PlayerIndex {
  return choosesOpponent(mode) && settled[0] ? 1 : 0;
}

/** True once every side this screen chooses has settled, so the match can start. */
export function everyoneReady(mode: GameMode, settled: Settled): boolean {
  return sidesChosen(mode).every((side) => settled[side]);
}

/**
 * What back does for the player working `side`. A settled side is given back first. An unsettled
 * side that is not the player's own is the VS CPU opponent, and backing out of it returns to
 * their own fighter rather than leaving; from their own unsettled cursor, back leaves the screen.
 */
export function backFrom(player: PlayerIndex, side: PlayerIndex, settled: Settled): BackStep {
  if (settled[side]) return { kind: 'unsettle', side };
  if (side !== player) return { kind: 'unsettle', side: player };
  return { kind: 'leave' };
}
