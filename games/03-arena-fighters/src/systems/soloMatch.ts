import type { ChosenCpuLevel } from '../config';
import { ARENA_IDS } from '../content/arenas/arenaTypes';
import { FIGHTER_IDS, type PlayableId } from '../content/roster';
import { Random } from './cpu/random';
import type { MatchRules, MatchSetup } from './matchSetup';
import { pickFrom } from './randomPick';

/**
 * A single match against the computer: one fight, no ladder behind it. The player picks their
 * fighter, their opponent and how hard the computer plays, and the arena is drawn, so the same
 * pairing is not always fought on the same ground.
 *
 * `opponent` is left out when nobody chose one — the results screen's random opponent — and one
 * is drawn as well. The draw is from `FIGHTER_IDS`, so Magnus Vane is never in it: he is the end
 * of arcade mode, and meeting him unasked would be both a surprise at a difficulty the player did
 * not choose and the end of him being earned. Every arena is in the draw, the tower roof
 * included: it is the one place the roof can be fought on without first climbing the ladder.
 */
export function soloMatch(
  fighter: PlayableId,
  opponent: PlayableId | undefined,
  cpuLevel: ChosenCpuLevel,
  rules: MatchRules,
  seed: number,
): MatchSetup {
  const random = new Random(seed);
  const arena = pickFrom(ARENA_IDS, random, 'docks');
  return {
    mode: 'solo',
    fighters: [fighter, opponent ?? pickFrom(FIGHTER_IDS, random, fighter)],
    arena,
    rules,
    cpuLevel,
  };
}

/**
 * A solo match that keeps the level and the rules the screen before it settled on. Both the
 * fighter select and the results use it, so starting a match and asking for another opponent
 * afterwards go through the same code and cannot drift apart.
 */
export function soloMatchFor(
  setup: MatchSetup,
  fighter: PlayableId,
  opponent: PlayableId | undefined,
  seed: number,
): MatchSetup {
  return soloMatch(fighter, opponent, chosenLevel(setup), setup.rules, seed);
}

/**
 * The level a solo match was set to. The boss level can never be chosen for a solo match, but
 * `MatchSetup` carries the wider type that arcade's last rung needs, so it is narrowed here.
 */
function chosenLevel(setup: MatchSetup): ChosenCpuLevel {
  return setup.cpuLevel === 'boss' ? 'hard' : setup.cpuLevel;
}
