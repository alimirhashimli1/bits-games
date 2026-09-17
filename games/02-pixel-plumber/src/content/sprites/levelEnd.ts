import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';
import { outlined, radial, shaded } from './shapes';

const WHEEL = { hubRadius: 1.4, rimInner: 4.4, rimOuter: 6.4, spokes: 4, spokeWidth: 0.1 } as const;

/** The red hand wheel that ends a level. `turn` moves its spokes round, so two frames spin it. */
function valveWheel(turn: number): PixelMap {
  return outlined(
    radial((distance, angle) => {
      if (distance <= WHEEL.hubRadius) return 'R';
      if (distance > WHEEL.rimOuter) return undefined;
      if (distance > WHEEL.rimInner) return shaded(angle, 'R', 'r', 'D');
      return Math.cos(WHEEL.spokes * (angle + turn)) > 1 - WHEEL.spokeWidth ? 'r' : undefined;
    }),
  );
}

/** The valve wheel on the pole at the end of a level, 16×16. */
export const VALVE_WHEEL_SHEET = {
  key: 'valve-wheel',
  palette: {
    k: ART_COLORS.outline,
    R: ART_COLORS.valveLight,
    r: ART_COLORS.valve,
    D: ART_COLORS.valveShade,
  },
  frames: {
    wheel1: valveWheel(0),
    wheel2: valveWheel(Math.PI / 8),
  },
} as const satisfies SpriteSheetDefinition;

export const VALVE_WHEEL_ANIMATIONS = {
  turn: { key: 'valve-wheel-turn', frames: ['wheel1', 'wheel2'], frameRate: 8, repeat: -1 },
} as const satisfies Record<string, PixelAnimationDefinition>;
