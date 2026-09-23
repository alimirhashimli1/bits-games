import type { ChosenCpuLevel } from '../config';
import { HOME_ARENAS } from '../content/arenas/arenaTypes';
import { BOSS, FIGHTER_IDS, type FighterId, type PlayableId } from '../content/roster';
import { Random } from './cpu/random';
import type { MatchRules, MatchSetup } from './matchSetup';

/**
 * The arcade ladder: seven of the other fourteen fighters in a shuffled order, and then Magnus
 * Vane. The opponents are drawn without replacement and the player is never among them, so no
 * fighter is met twice and nobody fights themselves.
 */
export const ARCADE = {
  /** Fighters met before the boss. */
  opponents: 7,
  /**
   * How well the CPU plays at each stage, so the ladder gets harder as it goes. The boss is not
   * in this list: he always plays at his own level, whatever the stage says (see `FightScene`).
   */
  levels: ['easy', 'easy', 'normal', 'normal', 'normal', 'hard', 'hard'] as readonly ChosenCpuLevel[],
} as const;

/** One run up the ladder, carried from scene to scene inside the `MatchSetup`. */
export interface ArcadeRun {
  /** The fighter the player chose, who fights every stage. */
  readonly fighter: PlayableId;
  /** Who is fought, in order: seven of the roster and then the boss. */
  readonly ladder: readonly FighterId[];
  /** Which rung they are on, from 0 up to `ladder.length - 1`. */
  readonly stage: number;
  readonly continuesUsed: number;
}

/** What to do once a stage is over. */
export type ArcadeStep =
  | { readonly kind: 'nextFight'; readonly run: ArcadeRun }
  | { readonly kind: 'ending' }
  | { readonly kind: 'continue' };

/** Starts a run: the opponents are shuffled, so two runs with the same fighter differ. */
export function createArcadeRun(fighter: PlayableId, seed: number): ArcadeRun {
  const random = new Random(seed);
  const others = FIGHTER_IDS.filter((id) => id !== fighter);
  const ladder: FighterId[] = [...shuffle(others, random).slice(0, ARCADE.opponents), BOSS.id];
  return { fighter, ladder, stage: 0, continuesUsed: 0 };
}

/** Who the run is facing now. */
export function currentOpponent(run: ArcadeRun): FighterId {
  return run.ladder[run.stage] ?? BOSS.id;
}

/** True on the last rung, where the boss waits. */
export function isBossStage(run: ArcadeRun): boolean {
  return run.stage >= run.ladder.length - 1;
}

/**
 * The match for the stage the run is on: the player on the left, this stage's opponent on the
 * right in their own home arena, at the level the ladder has reached.
 */
export function arcadeMatch(run: ArcadeRun, rules: MatchRules): MatchSetup {
  const opponent = currentOpponent(run);
  return {
    mode: 'arcade',
    fighters: [run.fighter, opponent],
    arena: HOME_ARENAS[opponent],
    rules,
    cpuLevel: ARCADE.levels[run.stage] ?? 'hard',
    arcade: run,
  };
}

/**
 * What follows a stage. Winning the last one is the end of the run; winning any other moves up
 * a rung. Anything else — a loss or a draw game — puts the player on the continue screen, since
 * the ladder is only passed by actually beating each fighter.
 */
export function arcadeOutcome(run: ArcadeRun, playerWon: boolean): ArcadeStep {
  if (!playerWon) return { kind: 'continue' };
  if (isBossStage(run)) return { kind: 'ending' };
  return { kind: 'nextFight', run: { ...run, stage: run.stage + 1 } };
}

/** Taking a continue: the same stage again, one more continue spent. */
export function continuedRun(run: ArcadeRun): ArcadeRun {
  return { ...run, continuesUsed: run.continuesUsed + 1 };
}

/** A copy of the list in a new order (Fisher-Yates), leaving the original alone. */
function shuffle<T>(items: readonly T[], random: Random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(random.next() * (index + 1));
    const here = shuffled[index];
    const there = shuffled[swap];
    if (here !== undefined && there !== undefined) {
      shuffled[index] = there;
      shuffled[swap] = here;
    }
  }
  return shuffled;
}
