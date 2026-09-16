import { ART_COLORS } from '../palette';
import { createFighterAnimations, createFighterSheet } from './fighterSprites';

/** Kenji: white gi and red headband. */
export const HERO_SHEET = createFighterSheet('hero', {
  h: ART_COLORS.hair,
  r: ART_COLORS.headband,
  s: ART_COLORS.skin,
  S: ART_COLORS.skinShade,
  k: ART_COLORS.outline,
  g: ART_COLORS.gi,
  G: ART_COLORS.giShade,
  b: ART_COLORS.outline,
});

export const HERO_ANIMATIONS = createFighterAnimations(HERO_SHEET.key);
