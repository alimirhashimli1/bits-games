import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { SpriteAssets } from '@shared/phaser/pixelSprites';

/** Each projectile animates through its frames at this rate, frames per second. */
const FRAME_RATE = 12;

const FIREBALL = { width: 16, height: 12 } as const;
/** The hot core sits towards the front (the right, the way it flies); the flames trail behind. */
const CORE_X = 10;
const CORE_Y = (FIREBALL.height - 1) / 2;
/** Behind the core the flame is stretched out into a tail. */
const TAIL_STRETCH = 0.55;
/** Rings out from the core: white-hot, yellow, orange, dark red. */
const RINGS: ReadonlyArray<readonly [radius: number, symbol: string]> = [
  [2.2, 'w'],
  [3.8, 'y'],
  [5.2, 'r'],
  [6.2, 'o'],
];
const FLICKER_FRAMES = 3;

/**
 * One frame of a fireball, facing right. The tail's edge is broken up by a diagonal pattern
 * that shifts from frame to frame, which is what makes it flicker.
 */
function fireballFrame(flicker: number): PixelMap {
  const rows: string[] = [];
  for (let y = 0; y < FIREBALL.height; y++) {
    let row = '';
    for (let x = 0; x < FIREBALL.width; x++) {
      const behind = x < CORE_X;
      const ragged = behind && (x + y + flicker) % FLICKER_FRAMES === 0 ? 0.8 : 0;
      const distance = Math.hypot((x - CORE_X) * (behind ? TAIL_STRETCH : 1), y - CORE_Y) + ragged;
      row += RINGS.find(([radius]) => distance < radius)?.[1] ?? '.';
    }
    rows.push(row);
  }
  return rows;
}

const SHOCKWAVE = { width: 20, height: 10, frames: 3 } as const;

/**
 * One frame of Kanan's shockwave: a wave of rock and dust rolling along the floor, its crest
 * leaning forward, with chips of stone kicked up behind it that jump about between frames.
 */
function shockwaveFrame(frame: number): PixelMap {
  const rows: string[] = [];
  for (let y = 0; y < SHOCKWAVE.height; y++) {
    let row = '';
    for (let x = 0; x < SHOCKWAVE.width; x++) {
      // The crest is tallest at the front and falls away behind it.
      const crest = SHOCKWAVE.height - 1 - Math.round((x / (SHOCKWAVE.width - 1)) ** 1.6 * (SHOCKWAVE.height - 2));
      const chip = y < crest && (x * 7 + y * 3 + frame * 5) % 11 === 0 && x > 4;
      if (y >= crest) row += y === crest ? 'l' : y >= SHOCKWAVE.height - 2 ? 'd' : 'm';
      else row += chip ? 'd' : '.';
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Rajab's thrown cards, spinning as they fly: face on, edge on, and the back. Each is a white
 * card with a red pip, or its patterned back.
 */
const CARD_FRAMES: readonly PixelMap[] = [
  [
    '..oooooo..',
    '.owwwwwwo.',
    'owwwrwwwwo',
    'owwrrrwwwo',
    'owwwrwwwwo',
    '.owwwwwwo.',
    '..oooooo..',
  ],
  [
    '..........',
    '..........',
    '.oooooooo.',
    'owwwwwwwwo',
    '.oooooooo.',
    '..........',
    '..........',
  ],
  [
    '..oooooo..',
    '.obbbbbbo.',
    'obbwbbwbbo',
    'obwbbwbbbo',
    'obbwbbwbbo',
    '.obbbbbbo.',
    '..oooooo..',
  ],
];

/**
 * Azar's syringe, needle first (facing right), half full of green serum, with a glint that runs
 * along the barrel.
 */
function syringeFrame(frame: number): PixelMap {
  const glint = 3 + frame * 2;
  const barrel = [...'hwwwwwwwwh'].map((symbol, x) => (x === glint ? 'W' : symbol)).join('');
  return [
    'p..hhhhhhhhhh.....',
    `pppp${barrel}nnnn`,
    `pppp${barrel.replaceAll('w', 'g')}....`,
    'p..hhhhhhhhhh.....',
  ];
}

/** An animation that loops the sheet's frames, named `<key>-burn` (see `projectileAnimationKey`). */
function projectileSprites(key: string, palette: Readonly<Record<string, string>>, frames: readonly PixelMap[]): SpriteAssets {
  const names = frames.map((_, index) => `burn${index}`);
  return {
    sheet: { key, palette, frames: Object.fromEntries(frames.map((frame, index) => [`burn${index}`, frame])) },
    animations: [{ key: projectileAnimationKey(key), frames: names, frameRate: FRAME_RATE, repeat: -1 }],
  };
}

/** Every projectile's sprites. A projectile's sheet key is also the start of its animation key. */
export const PROJECTILE_SPRITES: readonly SpriteAssets[] = [
  // Brand's Ember Shot.
  projectileSprites(
    'emberShot',
    { w: '#fff3b0', y: '#ffb03a', r: '#e4572e', o: '#8e1f22' },
    Array.from({ length: FLICKER_FRAMES }, (_, frame) => fireballFrame(frame)),
  ),
  // Kanan's Quake Stomp.
  projectileSprites(
    'shockwave',
    { l: '#e8d2a8', m: '#a07850', d: '#5e4430' },
    Array.from({ length: SHOCKWAVE.frames }, (_, frame) => shockwaveFrame(frame)),
  ),
  // Rajab's Card Toss.
  projectileSprites('card', { o: '#1a1216', w: '#f4f0e6', r: '#d8342c', b: '#2a4c9e' }, CARD_FRAMES),
  // Azar's Syringe Dart.
  projectileSprites(
    'syringe',
    { p: '#e6e6ee', h: '#8a96a8', w: '#cfe8f0', g: '#6ad07a', W: '#ffffff', n: '#c0c8d4' },
    [0, 1, 2].map(syringeFrame),
  ),
];

export function projectileAnimationKey(sprite: string): string {
  return `${sprite}-burn`;
}

