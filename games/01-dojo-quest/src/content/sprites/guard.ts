import { ART_COLORS } from '../palette';
import { createFighterAnimations, createFighterSheet } from './fighterSprites';

/** Gorran's guards: dark red gi and white headband, same poses as Kenji. */
export const GUARD_SHEET = createFighterSheet('guard', {
  h: ART_COLORS.hair,
  r: ART_COLORS.guardHeadband,
  s: ART_COLORS.skin,
  S: ART_COLORS.skinShade,
  k: ART_COLORS.outline,
  g: ART_COLORS.guardGi,
  G: ART_COLORS.guardGiShade,
  b: ART_COLORS.outline,
});

export const GUARD_ANIMATIONS = createFighterAnimations(GUARD_SHEET.key);
