import { ART_COLORS } from '../palette';
import { createFighterAnimations, createFighterSheet } from './fighterSprites';

/** Mei: pink kimono and a gold ribbon, drawn from the same poses as the fighters. */
export const MEI_SHEET = createFighterSheet('mei', {
  h: ART_COLORS.hair,
  r: ART_COLORS.meiRibbon,
  s: ART_COLORS.skin,
  S: ART_COLORS.skinShade,
  k: ART_COLORS.outline,
  g: ART_COLORS.meiKimono,
  G: ART_COLORS.meiKimonoShade,
  b: ART_COLORS.meiSash,
});

export const MEI_ANIMATIONS = createFighterAnimations(MEI_SHEET.key);
