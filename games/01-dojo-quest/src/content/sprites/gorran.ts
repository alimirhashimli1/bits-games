import { GORRAN_BODY } from '../fighters/gorranBody';
import { GORRAN_POSES } from '../fighters/gorranPoses';
import { ART_COLORS } from '../palette';
import { createFighterAnimations, createFighterSheet } from './fighterSprites';

/** Warlord Gorran: black and gold armour, a horned helmet and a deep red cape. */
export const GORRAN_SHEET = createFighterSheet(
  'gorran',
  {
    m: ART_COLORS.gorranHelmet,
    M: ART_COLORS.gorranGold,
    s: ART_COLORS.skin,
    S: ART_COLORS.skinShade,
    k: ART_COLORS.outline,
    g: ART_COLORS.gorranArmour,
    G: ART_COLORS.gorranArmourShade,
    b: ART_COLORS.gorranGold,
    c: ART_COLORS.gorranCape,
  },
  { body: GORRAN_BODY, extraPoses: GORRAN_POSES },
);

export const GORRAN_ANIMATIONS = createFighterAnimations(GORRAN_SHEET.key);
