import { mirrorPixelMap, PixelGrid, rotateCounterClockwise } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { FACINGS, type Facing } from '../../systems/facing';
import { ART_COLORS } from '../palette';
import { HEADS, LEGS, stack, TORSOS } from './wrenParts';

const STAND_DOWN = stack(HEADS.front, TORSOS.front, LEGS.frontStand);
const STAND_RIGHT = stack(HEADS.side, TORSOS.side, LEGS.sideStand);
const THRUST_RIGHT = stack(HEADS.side, TORSOS.sideThrust, LEGS.sideStep);

/** Wren's frames are one tile. */
const FRAME_SIZE = 16;

/** Both arms straight up, a hand either side of her head, as she lifts a treasure. */
function holdUp(): PixelMap {
  const grid = new PixelGrid(FRAME_SIZE, FRAME_SIZE);
  grid.stamp(stack(HEADS.front, TORSOS.armsUp, LEGS.frontStand), 0, 0);
  grid.fillRect(1, 2, 2, 5, 't');
  grid.fillRect(13, 2, 2, 5, 't');
  grid.fillRect(1, 0, 2, 2, 's');
  grid.fillRect(13, 0, 2, 2, 's');
  grid.outline('k');
  return grid.toPixelMap();
}

/** Wren, 16×16. Every facing has its own frames, so a sprite never needs flipping. */
export const WREN_SHEET = {
  key: 'wren',
  palette: {
    k: ART_COLORS.outline,
    h: ART_COLORS.wrenHair,
    H: ART_COLORS.wrenHairLight,
    s: ART_COLORS.wrenSkin,
    S: ART_COLORS.wrenSkinShade,
    t: ART_COLORS.wrenTunic,
    T: ART_COLORS.wrenTunicDark,
    y: ART_COLORS.amber,
    b: ART_COLORS.leather,
  },
  frames: {
    'stand-down': STAND_DOWN,
    'step1-down': stack(HEADS.front, TORSOS.front, LEGS.frontStep),
    'step2-down': stack(HEADS.front, TORSOS.front, mirrorPixelMap(LEGS.frontStep)),
    'thrust-down': stack(HEADS.front, TORSOS.frontThrust, LEGS.frontStand),

    'stand-up': stack(HEADS.back, TORSOS.front, LEGS.frontStand),
    'step1-up': stack(HEADS.back, TORSOS.front, LEGS.frontStep),
    'step2-up': stack(HEADS.back, TORSOS.front, mirrorPixelMap(LEGS.frontStep)),
    'thrust-up': stack(HEADS.back, TORSOS.backThrust, LEGS.frontStand),

    'stand-right': STAND_RIGHT,
    'step1-right': stack(HEADS.side, TORSOS.side, LEGS.sideStep),
    'step2-right': STAND_RIGHT,
    'thrust-right': THRUST_RIGHT,

    'stand-left': mirrorPixelMap(STAND_RIGHT),
    'step1-left': mirrorPixelMap(stack(HEADS.side, TORSOS.side, LEGS.sideStep)),
    'step2-left': mirrorPixelMap(STAND_RIGHT),
    'thrust-left': mirrorPixelMap(THRUST_RIGHT),

    holdUp: holdUp(),
    hurt: stack(HEADS.frontHurt, TORSOS.flinch, LEGS.frontStand),
    /** Lying on her back, head to the left. */
    fallen: rotateCounterClockwise(STAND_DOWN),
  },
} as const satisfies SpriteSheetDefinition;

type WrenFrame = keyof typeof WREN_SHEET.frames;

const WALK_FRAME_RATE = 8;
const SWING_FRAME_RATE = 15;
const DEFEAT_FRAME_RATE = 10;
/** Times she spins round before she falls. */
const DEFEAT_SPINS = 2;

/** One animation for each facing, e.g. `wren-walk-left`. */
function perFacing(
  name: string,
  frames: (facing: Facing) => readonly WrenFrame[],
  frameRate: number,
  repeat = 0,
): Readonly<Record<Facing, PixelAnimationDefinition>> {
  const entries = FACINGS.map((facing) => [facing, { key: `wren-${name}-${facing}`, frames: frames(facing), frameRate, repeat }]);
  return Object.fromEntries(entries) as Record<Facing, PixelAnimationDefinition>;
}

const SPIN: readonly WrenFrame[] = ['stand-down', 'stand-left', 'stand-up', 'stand-right'];

export const WREN_ANIMATIONS = {
  idle: perFacing('idle', (facing) => [`stand-${facing}`], 1),
  walk: perFacing('walk', (facing) => [`step1-${facing}`, `step2-${facing}`], WALK_FRAME_RATE, -1),
  /** Wind up, thrust and hold, then recover. How long the sword stays out is up to the combat code. */
  swing: perFacing(
    'swing',
    (facing) => [`stand-${facing}`, `thrust-${facing}`, `thrust-${facing}`, `thrust-${facing}`, `stand-${facing}`],
    SWING_FRAME_RATE,
  ),
  /** Using an item is the thrust, held for as long as the item needs. */
  useItem: perFacing('use-item', (facing) => [`thrust-${facing}`], 1),
  holdUp: { key: 'wren-hold-up', frames: ['holdUp'], frameRate: 1 },
  hurt: { key: 'wren-hurt', frames: ['hurt'], frameRate: 1 },
  /** Spins round on the spot, then falls. */
  defeat: {
    key: 'wren-defeat',
    frames: [...Array.from({ length: DEFEAT_SPINS }, () => SPIN).flat(), 'fallen'],
    frameRate: DEFEAT_FRAME_RATE,
  },
} as const;

/** Every one of Wren's animations, for registering. */
export const WREN_ANIMATION_LIST: readonly PixelAnimationDefinition[] = [
  ...Object.values(WREN_ANIMATIONS.idle),
  ...Object.values(WREN_ANIMATIONS.walk),
  ...Object.values(WREN_ANIMATIONS.swing),
  ...Object.values(WREN_ANIMATIONS.useItem),
  WREN_ANIMATIONS.holdUp,
  WREN_ANIMATIONS.hurt,
  WREN_ANIMATIONS.defeat,
];
