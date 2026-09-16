import type { Fighter, FighterIntent } from '../entities/Fighter';
import { GuardBrain, type GuardTactics } from './guardAi';

export interface BossTactics {
  /** How he fights while he is still ahead. */
  readonly calm: GuardTactics;
  /** How he fights once he is down to half his health or less. */
  readonly enraged: GuardTactics;
}

/**
 * Gorran fights by the same rules as his guards, but in two gears. While he is healthy he
 * paces himself; at half health he stops waiting, attacks far more often and stops backing
 * off when he is hit. The change of gear is the tell that the fight has turned.
 */
export class BossBrain extends GuardBrain {
  private readonly phases: BossTactics;

  constructor(phases: BossTactics, boss: Fighter, random: () => number = Math.random) {
    super(phases.calm, boss, random);
    this.phases = phases;
  }

  override think(boss: Fighter, hero: Fighter, deltaMs: number): FighterIntent {
    this.tactics = boss.health.current * 2 <= boss.health.max ? this.phases.enraged : this.phases.calm;
    return super.think(boss, hero, deltaMs);
  }
}
