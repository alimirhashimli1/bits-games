import { BOSS } from '../../config';
import type { FighterConfig } from '../../entities/Fighter';
import { GORRAN_ANIMATIONS, GORRAN_SHEET } from '../sprites/gorran';
import { buildFighterConfig } from './fighterConfig';
import { GORRAN_MOVES } from './gorranMoves';

/** Warlord Gorran. Like his guards he never leaves fighting stance, so both speeds match. */
export const GORRAN_FIGHTER: FighterConfig = buildFighterConfig(GORRAN_SHEET.key, GORRAN_ANIMATIONS, {
  health: { maxPips: BOSS.maxPips },
  runSpeed: BOSS.walkSpeed,
  walkSpeed: BOSS.walkSpeed,
  attacks: GORRAN_MOVES,
});
