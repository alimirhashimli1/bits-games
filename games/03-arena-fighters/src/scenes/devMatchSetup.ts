import { devNumberParam, devParam } from '@shared/phaser/devStartScene';

import { CPU_LEVELS, type CpuLevel } from '../config';
import { isArenaId } from '../content/arenas';
import type { ArenaId } from '../content/arenas/arenaTypes';
import { HOME_ARENAS } from '../content/arenas/arenaTypes';
import { isFighterId, isPlayableId, type FighterId } from '../content/roster';
import { arcadeMatch, createArcadeRun } from '../systems/arcade';
import { DEFAULT_MATCH, type GameMode, type MatchSetup } from '../systems/matchSetup';

const GAME_MODES: readonly GameMode[] = ['arcade', 'solo', 'versus', 'online'];

/**
 * Development only: the match asked for in the address bar, with the defaults filling any gaps.
 * `?scene=Fight&p1=grom&p2=nova&mode=arcade` jumps straight into a match, in player 2's home
 * arena unless `&stage=docks` picks another, `&roundSeconds=5&roundsToWin=1` shortens the match, and `&cpu=hard` sets the CPU's
 * level. Production builds ignore all of it.
 *
 * With `&mode=arcade` the setup carries a real ladder for player 1, so the arcade scenes can be
 * jumped into. `&rung=7` starts on a given rung, which is how the boss fight and each fighter's
 * ending are reached without playing seven matches first.
 */
export function devMatchSetup(): MatchSetup {
  const mode = GAME_MODES.find((known) => known === devParam('mode')) ?? DEFAULT_MATCH.mode;
  const [defaultP1, defaultP2] = DEFAULT_MATCH.fighters;
  const rules = {
    roundSeconds: devNumberParam('roundSeconds') ?? DEFAULT_MATCH.rules.roundSeconds,
    roundsToWin: devNumberParam('roundsToWin') ?? DEFAULT_MATCH.rules.roundsToWin,
  };
  const fighters = [devFighter('p1') ?? defaultP1, devFighter('p2') ?? defaultP2] as const;
  const stage = devParam('stage');
  const arena = stage !== undefined && isArenaId(stage) ? stage : HOME_ARENAS[fighters[1]];
  const cpuLevel = devCpuLevel('cpu') ?? DEFAULT_MATCH.cpuLevel;
  const base: MatchSetup = { mode, fighters, arena, rules, cpuLevel };
  // The arena named in the address bar still wins; without one the ladder picks the opponent's.
  const chosenArena = stage !== undefined && isArenaId(stage) ? stage : undefined;
  return mode === 'arcade' ? devArcadeMatch(base, chosenArena) : base;
}

/** An arcade run for the chosen fighter, on the rung asked for, so the ladder can be jumped into. */
function devArcadeMatch(base: MatchSetup, chosenArena: ArenaId | undefined): MatchSetup {
  const player = base.fighters[0];
  if (!isPlayableId(player)) return base;
  const run = createArcadeRun(player, devNumberParam('seed') ?? 1);
  const rung = Math.min(Math.max(devNumberParam('rung') ?? 0, 0), run.ladder.length - 1);
  // A named opponent wins over the rung's own, so `&p2=vane` still fights who it says.
  const named = devFighter('p2');
  const ladder = named ? run.ladder.map((id, index) => (index === rung ? named : id)) : run.ladder;
  const match = arcadeMatch({ ...run, ladder, stage: rung }, base.rules);
  return chosenArena ? { ...match, arena: chosenArena } : match;
}

/** A CPU level named in the address bar, such as `&p1cpu=hard`, which makes player 1 a CPU too. Dev only. */
export function devCpuLevel(param: string): CpuLevel | undefined {
  const value = devParam(param);
  return Object.keys(CPU_LEVELS).find((level): level is CpuLevel => level === value);
}

function devFighter(param: string): FighterId | undefined {
  const value = devParam(param);
  return value !== undefined && isFighterId(value) ? value : undefined;
}
