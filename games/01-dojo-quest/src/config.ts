import type { ActionBindings } from '@shared/phaser/actionInput';

import type { GuardTactics } from './systems/guardAi';

/** Native resolution in game pixels. The canvas is scaled up from this by whole numbers. */
export const SCREEN = {
  width: 320,
  height: 180,
} as const;

export const COLORS = {
  background: 0x1a1026,
  title: 0xffd23f,
  text: 0xf4f4f4,
  muted: 0x8a8aa8,
  danger: 0xff6b6b,
  success: 0x7cfc9a,
  floor: 0x2e2440,
  floorEdge: 0x4a3b63,
  heroHealth: 0xffd23f,
  enemyHealth: 0xff6b6b,
  smoke: 0x2a2430,
  ember: 0xff8c1a,
} as const;

/** Phaser key names for menus and development shortcuts. */
export const KEYS = {
  confirm: ['ENTER', 'SPACE'],
  /** Skips a whole story scene. */
  skip: ['ESC'],
  /** Shows or hides the hitbox debug view (hidden by default). */
  debugHitboxes: ['H'],
  /** Development builds only: knocks out the current guard, to test walking through the fortress. */
  devDefeatGuard: ['K'],
} as const;

/**
 * In-game controls. Gamepad buttons use the standard layout:
 * 0 = A, 1 = B, 2 = X, 3 = Y, 12-15 = D-pad up/down/left/right.
 */
export const PLAYER_CONTROLS = {
  left: { keys: ['LEFT', 'A'], buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { keys: ['RIGHT', 'D'], buttons: [15], stick: { axis: 0, direction: 1 } },
  up: { keys: ['UP'], buttons: [12], stick: { axis: 1, direction: -1 } },
  down: { keys: ['DOWN'], buttons: [13], stick: { axis: 1, direction: 1 } },
  stance: { keys: ['SHIFT'], buttons: [3] },
  punch: { keys: ['Z'], buttons: [2] },
  kick: { keys: ['X'], buttons: [0] },
  block: { keys: ['C'], buttons: [1] },
} as const satisfies ActionBindings<string>;

export type PlayerAction = keyof typeof PLAYER_CONTROLS;

export const TIMING = {
  promptBlinkMs: 500,
} as const;

/** The fighting floor: feet stand on `groundY`, and fighters stay between `minX` and `maxX`. */
export const ARENA = {
  groundY: 150,
  minX: 16,
  maxX: 304,
} as const;

/** Kenji's movement, in pixels per second. */
export const HERO = {
  startX: 60,
  runSpeed: 72,
  walkSpeed: 24,
} as const;

/** Health in pips. Kenji slowly regains pips while no enemy is engaged. */
export const HEALTH = {
  heroMaxPips: 10,
  heroRegenIntervalMs: 1500,
} as const;

/** Attack phases in milliseconds. Kicks are slower than punches but reach further. */
export const ATTACK_TIMING = {
  punch: { windupMs: 100, activeMs: 100, recoveryMs: 150 },
  kick: { windupMs: 180, activeMs: 120, recoveryMs: 220 },
} as const;

export const COMBAT = {
  /** Pips lost per clean hit. A fighter caught in running stance loses all remaining pips instead. */
  damage: { punch: 1, kick: 2 },
  /** How long a hit fighter cannot act. */
  stunMs: 350,
  /** Starting slide speed after a clean hit and after a blocked hit, in pixels per second. */
  knockbackSpeed: 90,
  blockPushSpeed: 45,
  /** How quickly the slide slows down, in pixels per second squared. */
  knockbackDeceleration: 400,
  /** Fighters cannot stand closer than this; every attack still reaches at this distance. */
  minSeparation: 18,
  /** A high guard stops high and mid attacks; a low guard stops only low attacks. */
  blockCoverage: { high: ['high', 'mid'], low: ['low'] },
} as const;

/** The village scenes (the raid and the opening). Nobody fights here, so they get a taller picture. */
export const VILLAGE = {
  groundY: 166,
  smokeRiseMs: 4000,
  smokeDelayMs: 1200,
  emberCount: 14,
  emberDelayMs: 220,
} as const;

/** The opening scene: Kenji comes home to the burning village. */
export const PROLOGUE = {
  /** How long Kenji takes to run into the village, and where he stops. */
  heroRunMs: 1800,
  heroStopX: 42,
} as const;

/** The raid scene: Gorran's men burn the village and carry Mei off. */
export const RAID = {
  /** Mei waits outside the dojo. */
  meiX: 150,
  /** The raiders run in and stop within arm's reach of her. */
  raidersArriveMs: 1700,
  /** One of them lunges and grabs her; she recoils and struggles. */
  seizeAtMs: 2500,
  seizeMs: 250,
  struggleMs: 1200,
  struggleShakeMs: 90,
  /** Fires catch one after another. */
  fireStartMs: 2200,
  fireDelayMs: 240,
  fireFadeMs: 500,
  /** They march her off; she is pulled along backwards, still resisting. */
  abductionAtMs: 3800,
  abductionMs: 2800,
} as const;

/** Story scenes between areas. */
export const STORY = {
  /** Typewriter speed. */
  charsPerSecond: 40,
  /** How long Kenji takes to run into the picture. */
  heroRunMs: 1600,
} as const;

/** Moving through the fortress, one area (screen) at a time. */
export const AREA = {
  heroEntryX: 24,
  guardStartX: 220,
  /** How long the area name stays on screen before fading out. */
  nameShowMs: 1800,
  nameFadeMs: 600,
  exitHintBlinkMs: 400,
  /** Pause after Kenji is knocked out before Game Over. */
  knockoutDelayMs: 1200,
} as const;

/**
 * Distances the guard AI uses, measured between the fighters' feet. They follow from
 * the move hitboxes: every punch reaches at 20 pixels, every kick at 24.
 */
export const GUARD_AI = {
  punchReach: 20,
  kickReach: 24,
  /** Hero attacks closer than this are worth blocking. */
  threatDistance: 32,
  /** How far from the preferred distance the guard may stand before stepping. */
  distanceTolerance: 2,
} as const;

interface GuardProfile {
  readonly maxPips: number;
  /** Pixels per second. */
  readonly walkSpeed: number;
  readonly tactics: GuardTactics;
}

/**
 * Guard ranks, weakest first. Reaction time decides which attacks a guard can block
 * in time: a punch hits 100 ms after it starts, a kick after 180 ms.
 */
export const GUARDS = {
  rookie: {
    maxPips: 4,
    walkSpeed: 18,
    tactics: {
      reactionMs: 160,
      blockChance: 0.3,
      aggression: 0.5,
      attackCooldownMs: [900, 1600],
      retreatChance: 0.2,
      retreatMs: 500,
      preferredDistance: 22,
    },
  },
  veteran: {
    maxPips: 6,
    walkSpeed: 22,
    tactics: {
      reactionMs: 90,
      blockChance: 0.5,
      aggression: 0.65,
      attackCooldownMs: [650, 1200],
      retreatChance: 0.35,
      retreatMs: 600,
      preferredDistance: 21,
    },
  },
  elite: {
    maxPips: 8,
    walkSpeed: 26,
    tactics: {
      reactionMs: 50,
      blockChance: 0.7,
      aggression: 0.8,
      attackCooldownMs: [450, 900],
      retreatChance: 0.5,
      retreatMs: 700,
      preferredDistance: 21,
    },
  },
} as const satisfies Record<string, GuardProfile>;

export type GuardRank = keyof typeof GUARDS;
