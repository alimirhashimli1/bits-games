import { drawHumanoid } from '@shared/pixel-art/humanoidRig';
import type { Palette } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { FIGHTER_BODY } from '../fighters/fighterBody';
import { HERO_POSES, type HeroPoseName } from '../fighters/heroPoses';

/** Every fighter shares Kenji's poses, so the pixel maps are drawn once and recoloured per palette. */
const FIGHTER_FRAMES = Object.fromEntries(
  Object.entries(HERO_POSES).map(([name, pose]) => [name, drawHumanoid(pose, FIGHTER_BODY)]),
);

/**
 * A fighter sprite sheet in the given colours. Palette symbols: h hair, r headband,
 * s/S skin and shade, k eye, g/G cloth and shade, b belt.
 */
export function createFighterSheet(key: string, palette: Palette): SpriteSheetDefinition {
  return { key, palette, frames: FIGHTER_FRAMES };
}

/** Lists frames by pose name, so a typo is caught by the type checker. */
const frames = (...names: HeroPoseName[]): readonly HeroPoseName[] => names;

/**
 * Movement and reaction animations for one fighter sheet. Attacks and blocks are not
 * animations: the Fighter shows their frames directly, timed by the move data.
 */
export function createFighterAnimations(sheetKey: string) {
  return {
    stand: { key: `${sheetKey}-stand`, frames: frames('stand'), frameRate: 1, repeat: -1 },
    run: { key: `${sheetKey}-run`, frames: frames('run1', 'run2', 'run3', 'run4'), frameRate: 10, repeat: -1 },
    toFight: { key: `${sheetKey}-to-fight`, frames: frames('stanceShift', 'fight'), frameRate: 12 },
    toStand: { key: `${sheetKey}-to-stand`, frames: frames('stanceShift', 'stand'), frameRate: 12 },
    fightIdle: { key: `${sheetKey}-fight-idle`, frames: frames('fight', 'fightBreath'), frameRate: 3, repeat: -1 },
    walk: { key: `${sheetKey}-walk`, frames: frames('walkClose', 'fight'), frameRate: 6, repeat: -1 },
    hit: { key: `${sheetKey}-hit`, frames: frames('hit'), frameRate: 1 },
    fall: { key: `${sheetKey}-fall`, frames: frames('hit', 'fallBack', 'lying'), frameRate: 6 },
  } satisfies Record<string, PixelAnimationDefinition>;
}

export type FighterAnimations = ReturnType<typeof createFighterAnimations>;
