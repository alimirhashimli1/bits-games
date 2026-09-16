import { MEI_BODY } from '../fighters/meiBody';
import { MEI_POSES } from '../fighters/meiPoses';
import { ART_COLORS } from '../palette';
import { createFighterAnimations, createFighterSheet } from './fighterSprites';

/** Mei: pink kimono, a gold ribbon, and her own long-haired build so she is never mistaken for a fighter. */
export const MEI_SHEET = createFighterSheet(
  'mei',
  {
    h: ART_COLORS.hair,
    r: ART_COLORS.meiRibbon,
    s: ART_COLORS.skin,
    S: ART_COLORS.skinShade,
    k: ART_COLORS.outline,
    g: ART_COLORS.meiKimono,
    G: ART_COLORS.meiKimonoShade,
    b: ART_COLORS.meiSash,
  },
  { body: MEI_BODY, extraPoses: MEI_POSES },
);

export const MEI_ANIMATIONS = createFighterAnimations(MEI_SHEET.key);
