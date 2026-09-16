import { GUARDS, type GuardRank } from '../../config';
import type { FighterConfig } from '../../entities/Fighter';
import { GUARD_ANIMATIONS, GUARD_SHEET } from '../sprites/guard';
import { buildFighterConfig } from './fighterConfig';

/** A guard of the given rank. Guards always fight in fighting stance, so both speeds are the walking speed. */
export function buildGuardFighter(rank: GuardRank): FighterConfig {
  const { maxPips, walkSpeed } = GUARDS[rank];
  return buildFighterConfig(GUARD_SHEET.key, GUARD_ANIMATIONS, {
    health: { maxPips },
    runSpeed: walkSpeed,
    walkSpeed,
  });
}
