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
 * Rajab's thrown cards, turning over as they fly: a big white face with a red diamond, the same
 * card at an angle, its patterned back, and back at an angle. They never go fully edge on, so
 * they read as cards the whole way across the arena.
 */
const CARD_FRAMES: readonly PixelMap[] = [
  [
    '.oooooooooo.',
    'owwwwwwwwwwo',
    'owwwwwrwwwwo',
    'owwwwrrrwwwo',
    'owwwrrrrrwwo',
    'owwwwrrrwwwo',
    'owwwwwrwwwwo',
    'owwwwwwwwwwo',
    '.oooooooooo.',
  ],
  [
    '..oooooooo..',
    '..owwwwwwo..',
    '..owwwrwwo..',
    '..owwrrrwo..',
    '..owrrrrro..',
    '..owwrrrwo..',
    '..owwwrwwo..',
    '..owwwwwwo..',
    '..oooooooo..',
  ],
  [
    '.oooooooooo.',
    'obbbbbbbbbbo',
    'obwbbwbbwbbo',
    'obbwbbwbbwbo',
    'obwbbwbbwbbo',
    'obbwbbwbbwbo',
    'obwbbwbbwbbo',
    'obbbbbbbbbbo',
    '.oooooooooo.',
  ],
  [
    '..oooooooo..',
    '..obbbbbbo..',
    '..obwbbwbo..',
    '..obbwbbwo..',
    '..obwbbwbo..',
    '..obbwbbwo..',
    '..obwbbwbo..',
    '..obbbbbbo..',
    '..oooooooo..',
  ],
];

const TRACER = { width: 16, height: 5, frames: 3 } as const;
/** The round itself is the bright head at the front; the hot air behind it breaks up as it goes. */
const TRACER_HEAD_X = TRACER.width - 3;
const TRACER_MIDDLE = (TRACER.height - 1) / 2;

/** One frame of Osal's rifle round, flying right: a white-hot head with a dashed trail behind it. */
function tracerFrame(frame: number): PixelMap {
  const rows: string[] = [];
  for (let y = 0; y < TRACER.height; y++) {
    let row = '';
    for (let x = 0; x < TRACER.width; x++) {
      const distance = Math.hypot((x - TRACER_HEAD_X) * 0.9, (y - TRACER_MIDDLE) * 1.7);
      if (distance < 1.4) row += 'w';
      else if (distance < 2.5) row += 'y';
      else if (y === TRACER_MIDDLE && x < TRACER_HEAD_X && (x + frame) % 4 !== 0) row += 't';
      else row += '.';
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Osal's grenade. Its frames are as big as the blast it becomes, since every frame of a sheet is
 * one size: the shell itself is the small tumbling thing in the middle.
 */
const GRENADE = { width: 28, height: 20, shellRadius: 3.7, frames: 4, blastFrames: 4 } as const;
const GRENADE_CENTER_X = (GRENADE.width - 1) / 2;
const GRENADE_CENTER_Y = (GRENADE.height - 1) / 2;

/** One frame of the grenade in the air: a ridged shell, its ridges turning over as it tumbles. */
function grenadeFrame(frame: number): PixelMap {
  const rows: string[] = [];
  for (let y = 0; y < GRENADE.height; y++) {
    let row = '';
    for (let x = 0; x < GRENADE.width; x++) {
      const distance = Math.hypot(x - GRENADE_CENTER_X, (y - GRENADE_CENTER_Y) * 0.95);
      if (distance > GRENADE.shellRadius) row += '.';
      else if (distance > GRENADE.shellRadius - 1) row += 'k';
      else row += (x + y + frame) % 3 === 0 ? 'G' : 'g';
    }
    rows.push(row);
  }
  return rows;
}

/**
 * One frame of the blast where it landed: a ball of fire that grows and turns to smoke, sitting
 * on the floor, with its edge broken up so it never looks like a drawn circle.
 */
function blastFrame(frame: number): PixelMap {
  const reach = 5 + frame * 3.4;
  const rows: string[] = [];
  for (let y = 0; y < GRENADE.height; y++) {
    let row = '';
    for (let x = 0; x < GRENADE.width; x++) {
      const ragged = (x * 3 + y * 5 + frame) % 4 === 0 ? 1.1 : 0;
      const distance = Math.hypot((x - GRENADE_CENTER_X) * 0.75, y - GRENADE_CENTER_Y) + ragged;
      if (distance < reach * 0.3 && frame < 2) row += 'w';
      else if (distance < reach * 0.55) row += 'y';
      else if (distance < reach * 0.8) row += 'r';
      else if (distance < reach) row += 'd';
      else row += '.';
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Rajab's loaded dice, thrown low and skipping along the floor. Each frame shows another face,
 * so they tumble as they go.
 */
const DICE_FRAMES: readonly PixelMap[] = [
  [
    '.oooooooo.',
    'owwwwwwwwo',
    'owkkwwkkwo',
    'owkkwwkkwo',
    'owwwwwwwwo',
    'owwwwwwwwo',
    'owkkwwkkwo',
    'owkkwwkkwo',
    'owwwwwwwwo',
    '.oooooooo.',
  ],
  [
    '.oooooooo.',
    'owwwwwwwwo',
    'owwwwwwwwo',
    'owwwwwwwwo',
    'owwwkkwwwo',
    'owwwkkwwwo',
    'owwwwwwwwo',
    'owwwwwwwwo',
    'owwwwwwwwo',
    '.oooooooo.',
  ],
  [
    '.oooooooo.',
    'owwwwwwwwo',
    'owkkwwkkwo',
    'owkkwwkkwo',
    'owwwkkwwwo',
    'owwwkkwwwo',
    'owkkwwkkwo',
    'owkkwwkkwo',
    'owwwwwwwwo',
    '.oooooooo.',
  ],
];

const STATIC_WAVE = { size: 16, frames: 3, core: 2.4, glow: 4.2, shell: 5.6, sparks: 5 } as const;
const STATIC_CENTER = (STATIC_WAVE.size - 1) / 2;

/**
 * One frame of Nova's Static Wave: a white-hot core in a blue ball of charge, with sparks that
 * crackle out from its edge. The sparks jump to new angles every frame, so the ball fizzes.
 */
function staticWaveFrame(frame: number): PixelMap {
  const sparkAngles = Array.from({ length: STATIC_WAVE.sparks }, (_, spark) => ((spark * 2 + frame * 3) % 10) * (Math.PI / 5));
  const rows: string[] = [];
  for (let y = 0; y < STATIC_WAVE.size; y++) {
    let row = '';
    for (let x = 0; x < STATIC_WAVE.size; x++) {
      const dx = x - STATIC_CENTER;
      const dy = y - STATIC_CENTER;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) + Math.PI;
      const onSpark = sparkAngles.some((spark) => Math.abs(Math.atan2(Math.sin(angle - spark), Math.cos(angle - spark))) < 0.2);
      if (distance < STATIC_WAVE.core) row += 'w';
      else if (distance < STATIC_WAVE.glow) row += 'c';
      else if (distance < STATIC_WAVE.shell) row += (x + y + frame) % 4 === 0 ? 'c' : 'b';
      else if (onSpark && distance < STATIC_CENTER + 0.5) row += 'w';
      else row += '.';
    }
    rows.push(row);
  }
  return rows;
}

const RAIL_SHOT = { width: 16, height: 14, frames: 3, radius: 7.2, bite: 6.4, biteOffset: 4.5 } as const;
const RAIL_CENTER_X = 8;
const RAIL_CENTER_Y = (RAIL_SHOT.height - 1) / 2;

/**
 * One frame of Rook's Rail Shot, flying right: a crescent of compressed air, its bulge leading,
 * made of a disc with a smaller disc bitten out of its back. A bright edge runs along the front
 * and faint streaks trail behind the horns, shifting every frame.
 */
function railShotFrame(frame: number): PixelMap {
  const rows: string[] = [];
  for (let y = 0; y < RAIL_SHOT.height; y++) {
    let row = '';
    for (let x = 0; x < RAIL_SHOT.width; x++) {
      const outer = Math.hypot(x - RAIL_CENTER_X, (y - RAIL_CENTER_Y) * 1.1);
      const inner = Math.hypot(x - (RAIL_CENTER_X - RAIL_SHOT.biteOffset), (y - RAIL_CENTER_Y) * 1.1);
      if (outer < RAIL_SHOT.radius && inner > RAIL_SHOT.bite) row += outer > RAIL_SHOT.radius - 1.6 ? 'w' : 'c';
      else if (outer < RAIL_SHOT.radius && x < RAIL_CENTER_X - 2 && (x + y + frame) % 3 === 0) row += 'b';
      else row += '.';
    }
    rows.push(row);
  }
  return rows;
}

const SHADE_ORB = { size: 14, frames: 3, core: 3.4, shell: 6.2 } as const;
const ORB_CENTER = (SHADE_ORB.size - 1) / 2;

/**
 * One frame of Sable's Shade Orb: a hole of darkness with a pale rim, and a few wisps torn off
 * its edge that drift round it from frame to frame.
 */
function shadeOrbFrame(frame: number): PixelMap {
  const rows: string[] = [];
  for (let y = 0; y < SHADE_ORB.size; y++) {
    let row = '';
    for (let x = 0; x < SHADE_ORB.size; x++) {
      const distance = Math.hypot(x - ORB_CENTER, y - ORB_CENTER);
      const wisp = (x * 5 + y * 3 + frame * 4) % 7 === 0;
      if (distance < SHADE_ORB.core) row += 'k';
      else if (distance < SHADE_ORB.shell - 1.4) row += wisp ? 'v' : 'd';
      else if (distance < SHADE_ORB.shell) row += 'v';
      else if (distance < SHADE_ORB.shell + 1.2 && wisp) row += 'V';
      else row += '.';
    }
    rows.push(row);
  }
  return rows;
}

const CROWN = { width: 18, height: 14, radius: 7.4, rimY: 6, rimRy: 2.8, band: 4, point: 3, points: 5, frames: 4 } as const;
const CROWN_CENTER_X = (CROWN.width - 1) / 2;
/** How narrow the crown gets as it turns edge-on, so it never disappears entirely. */
const CROWN_EDGE = 0.22;

/**
 * One frame of Magnus Vane's Iron Verdict: the Iron Crown itself, thrown spinning. It is drawn
 * as a band seen a little from above — an ellipse for the rim with the band hanging below it and
 * the crown's points standing up around it. Turning it through half a revolution over the frames
 * narrows the ellipse and carries the points round with it, so the crown spins as it flies.
 */
function ironVerdictFrame(frame: number): PixelMap {
  const turn = (frame / CROWN.frames) * Math.PI;
  const radiusX = Math.max(CROWN.radius * CROWN_EDGE, CROWN.radius * Math.abs(Math.cos(turn)));
  const grid = Array.from({ length: CROWN.height }, () => Array.from({ length: CROWN.width }, () => '.'));
  const plot = (x: number, y: number, symbol: string): void => {
    const row = grid[Math.round(y)];
    if (row && x >= 0 && x < CROWN.width) row[Math.round(x)] = symbol;
  };

  for (let x = 0; x < CROWN.width; x++) {
    const across = (x - CROWN_CENTER_X) / radiusX;
    if (Math.abs(across) > 1) continue;
    const half = CROWN.rimRy * Math.sqrt(1 - across * across);
    const back = CROWN.rimY - half;
    const front = CROWN.rimY + half;
    // The opening inside the rim, then the rim itself, then the band hanging from its front arc.
    for (let y = Math.ceil(back); y <= front; y++) plot(x, y, 'k');
    plot(x, back, 'N');
    plot(x, front, 'n');
    for (let y = front; y <= front + CROWN.band; y++) plot(x, y, y >= front + CROWN.band ? 'N' : 'n');
    // A highlight running down the band where the gold catches the light.
    if (Math.abs(across) < 0.35) plot(x, front + 1, 'w');
  }

  // The points, carried round the rim as it turns: each stands up from wherever its own arc is.
  for (let point = 0; point < CROWN.points; point++) {
    const around = (point / CROWN.points) * Math.PI * 2 + turn * 2;
    const x = CROWN_CENTER_X + Math.cos(around) * radiusX;
    const base = CROWN.rimY + Math.sin(around) * CROWN.rimRy;
    for (let step = 1; step <= CROWN.point; step++) plot(x, base - step, step === CROWN.point ? 'w' : 'n');
  }

  return grid.map((row) => row.join(''));
}

/** What a projectile's sprite is showing: the thing in flight, or the blast it left behind. */
export type ProjectilePhase = 'flight' | 'blast';

/**
 * An animation per phase, named `<key>-flight` and `<key>-blast` (see `projectileAnimationKey`).
 * Only a projectile that bursts where it lands needs the second one.
 */
function projectileSprites(
  key: string,
  palette: Readonly<Record<string, string>>,
  frames: readonly PixelMap[],
  blast: readonly PixelMap[] = [],
): SpriteAssets {
  const named = (phase: ProjectilePhase, maps: readonly PixelMap[]): Array<readonly [string, PixelMap]> =>
    maps.map((map, index) => [`${phase}${index}`, map] as const);
  const all = [...named('flight', frames), ...named('blast', blast)];
  const animation = (phase: ProjectilePhase, maps: readonly PixelMap[], repeat: number) => ({
    key: projectileAnimationKey(key, phase),
    frames: named(phase, maps).map(([name]) => name),
    frameRate: FRAME_RATE,
    repeat,
  });
  return {
    sheet: { key, palette, frames: Object.fromEntries(all) },
    // A blast plays once and holds its last frame; everything else loops while it flies.
    animations: [animation('flight', frames, -1), ...(blast.length > 0 ? [animation('blast', blast, 0)] : [])],
  };
}

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

/** Every projectile's sprites. A projectile's sheet key is also the start of its animation keys. */
export const PROJECTILE_SPRITES: readonly SpriteAssets[] = [
  // Brand's Ember Shot.
  projectileSprites(
    'emberShot',
    { w: '#fff3b0', y: '#ffb03a', r: '#e4572e', o: '#8e1f22' },
    Array.from({ length: FLICKER_FRAMES }, (_, frame) => fireballFrame(frame)),
  ),
  // Nova's Static Wave.
  projectileSprites(
    'staticWave',
    { w: '#f4fbff', c: '#8ad8ff', b: '#2a7ad8' },
    Array.from({ length: STATIC_WAVE.frames }, (_, frame) => staticWaveFrame(frame)),
  ),
  // Rook's Rail Shot.
  projectileSprites(
    'railShot',
    { w: '#ffffff', c: '#a8e0f0', b: '#5a90b0' },
    Array.from({ length: RAIL_SHOT.frames }, (_, frame) => railShotFrame(frame)),
  ),
  // Sable's Shade Orb.
  projectileSprites(
    'shadeOrb',
    { k: '#0a0812', d: '#241e38', v: '#6a5a9a', V: '#3a3158' },
    Array.from({ length: SHADE_ORB.frames }, (_, frame) => shadeOrbFrame(frame)),
  ),
  // Magnus Vane's Iron Verdict.
  projectileSprites(
    'ironVerdict',
    { w: '#fff4c0', n: '#f0cc60', N: '#a07c28', k: '#3a2c12' },
    Array.from({ length: CROWN.frames }, (_, frame) => ironVerdictFrame(frame)),
  ),
  // Kanan's Quake Stomp.
  projectileSprites(
    'shockwave',
    { l: '#e8d2a8', m: '#a07850', d: '#5e4430' },
    Array.from({ length: SHOCKWAVE.frames }, (_, frame) => shockwaveFrame(frame)),
  ),
  // Rajab's Card Toss.
  projectileSprites('card', { o: '#1a1216', w: '#f4f0e6', r: '#d8342c', b: '#2a4c9e' }, CARD_FRAMES),
  // Rajab's Loaded Dice.
  projectileSprites('dice', { o: '#1a1216', w: '#f4f0e6', k: '#24202a' }, DICE_FRAMES),
  // Azar's Syringe Dart.
  projectileSprites(
    'syringe',
    { p: '#e6e6ee', h: '#8a96a8', w: '#cfe8f0', g: '#6ad07a', W: '#ffffff', n: '#c0c8d4' },
    [0, 1, 2].map(syringeFrame),
  ),
  // Osal's Rifle Shot.
  projectileSprites(
    'tracer',
    { w: '#fff8d8', y: '#ffc23a', t: '#d0703a' },
    Array.from({ length: TRACER.frames }, (_, frame) => tracerFrame(frame)),
  ),
  // Osal's Grenade, and the blast where it lands.
  projectileSprites(
    'grenade',
    { k: '#14121c', g: '#4a6a3a', G: '#2c4224', w: '#fff3b0', y: '#ffb03a', r: '#e4572e', d: '#5a5262' },
    Array.from({ length: GRENADE.frames }, (_, frame) => grenadeFrame(frame)),
    Array.from({ length: GRENADE.blastFrames }, (_, frame) => blastFrame(frame)),
  ),
];

export function projectileAnimationKey(sprite: string, phase: ProjectilePhase = 'flight'): string {
  return `${sprite}-${phase}`;
}
