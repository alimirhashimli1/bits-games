import { devNumberParam, devParam } from '@shared/phaser/devStartScene';

import { CPU_LEVELS, type CpuLevel } from '../config';
import { isArenaId } from '../content/arenas';
import { HOME_ARENAS } from '../content/arenas/arenaTypes';
import { isFighterId, type FighterId } from '../content/roster';
import { DEFAULT_MATCH, type GameMode, type MatchSetup } from '../systems/matchSetup';

const GAME_MODES: readonly GameMode[] = ['arcade', 'versus', 'online'];

/**
 * Development only: the match asked for in the address bar, with the defaults filling any gaps.
 * `?scene=Fight&p1=grom&p2=nova&mode=arcade` jumps straight into a match, in player 2's home
 * arena unless `&stage=docks` picks another, `&roundSeconds=5&roundsToWin=1` shortens the match, and `&cpu=hard` sets the CPU's
 * level. Production builds ignore all of it.
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
  return { mode, fighters, arena, rules, cpuLevel };
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
