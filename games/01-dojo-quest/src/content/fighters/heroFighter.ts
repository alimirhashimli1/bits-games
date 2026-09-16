import { HEALTH, HERO } from '../../config';
import { HERO_ANIMATIONS, HERO_SHEET } from '../sprites/hero';
import { buildFighterConfig } from './fighterConfig';

/** Kenji. */
export const HERO_FIGHTER = buildFighterConfig(HERO_SHEET.key, HERO_ANIMATIONS, {
  health: { maxPips: HEALTH.heroMaxPips, regenIntervalMs: HEALTH.heroRegenIntervalMs },
  runSpeed: HERO.runSpeed,
  walkSpeed: HERO.walkSpeed,
});
