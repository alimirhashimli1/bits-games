import type { ActionBindings } from '@shared/phaser/actionInput';

import type { BossTactics } from './systems/bossAi';
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
  /** Turns all sound and music on or off. */
  mute: ['M'],
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
  /** Opens the pause menu over the frozen game. */
  pause: { keys: ['ESC'], buttons: [9] },
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

/**
 * Environmental hazards. They only stir once the area's guard is down, so duels stay
 * one-on-one and the danger falls on the walk to the exit.
 */
export const HAZARDS = {
  /** The hawk: it cruises overhead, then swoops at Kenji's head. */
  hawk: {
    damage: 1,
    knockbackSpeed: 60,
    stunMs: 300,
    /** Height it circles at, and how low it comes at the bottom of the swoop. */
    cruiseY: 30,
    strikeY: 120,
    /** How wide the dip around its target is, so the dive is visible well before it lands. */
    swoopWidth: 80,
    /**
     * It flies level at striking height this far either side of its target. That level
     * stretch is the window to duck under it or strike it out of the air.
     */
    levelWidth: 28,
    /**
     * It slows to this speed across the level stretch: the flare before the strike. Without it
     * the bird crosses Kenji's reach in under a tenth of a second, and meeting it is pure luck.
     */
    strikeSpeed: 70,
    /** Pixels per second, across and (while fleeing a punch) upwards. */
    speed: 150,
    climbSpeed: 90,
    waitBeforeFirstDiveMs: 1400,
    waitBetweenDivesMs: 3200,
    /** Body size for hitting and for being hit, slightly tighter than the art. */
    body: { width: 14, height: 8 },
  },
  /** The gate: the outer portcullis, which drops on whoever is standing under it. */
  gate: {
    damage: 2,
    knockbackSpeed: 120,
    stunMs: 400,
    /** One cycle: open, a rattled warning, the slam, shut, then grinding back up. */
    openMs: 1500,
    warningMs: 600,
    slamMs: 160,
    shutMs: 1200,
    riseMs: 900,
    /** The warning shudder: how far it shakes and how quickly. */
    rattlePixels: 1,
    rattleMs: 70,
  },
} as const;

/**
 * The rescue, after Gorran falls. Mei is caged behind the throne; Kenji breaks the bars
 * down and then has to walk up to her, and the stance he does it in decides the ending.
 */
export const RESCUE = {
  heroStartX: 24,
  /** Gorran lies where he fell. */
  gorranX: 140,
  /** The cage, standing on the floor beside the throne. */
  cage: { left: 214, top: 104, width: 52, height: 46 },
  /** Mei behind the bars, and where she steps once they are down. */
  cagedMeiX: 240,
  freeMeiX: 236,
  meiStepOutMs: 900,
  /** Blows needed to bring the bars down. */
  hitsToBreak: 3,
  shakeMs: 140,
  shakePixels: 1,
  /** Standing bars are solid: Kenji is kept this far clear of them. */
  barrierGap: 10,
  /** The hint appears once he is this close to the bars. */
  hintDistance: 44,
  /** How close he has to come to Mei for the ending to play. */
  meetDistance: 16,
  /** How long her hands stay up before she lashes out, so the moment reads as fright. */
  flinchMs: 320,
  /** The mistake: she kicks, and he goes down. */
  stumbleDistance: 10,
  stumbleMs: 300,
  badEndingMs: 2400,
  /** The rescue: a beat to take her in, then they leave together. */
  walkOutDelayMs: 1100,
  walkOutDistance: 260,
  walkOutMs: 2600,
  goodEndingMs: 4200,
  labelShowMs: 2200,
  labelFadeMs: 600,
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

/** Gorran's attack phases. Everything he throws is slower to start than a guard's, and hurts more. */
export const BOSS_ATTACK_TIMING = {
  /** The overhead smash: slow enough to read, and punishing if it lands. */
  smash: { windupMs: 320, activeMs: 150, recoveryMs: 340 },
  punch: { windupMs: 150, activeMs: 110, recoveryMs: 200 },
  kick: { windupMs: 220, activeMs: 130, recoveryMs: 260 },
} as const;

interface BossProfile {
  readonly maxPips: number;
  /** Pixels per second. */
  readonly walkSpeed: number;
  /** Pips the overhead smash costs; his other blows do the usual damage. */
  readonly smashDamage: number;
  readonly tactics: BossTactics;
}

/**
 * Warlord Gorran. He carries more health than any guard and hits far harder, and once he is
 * down to half he stops pacing himself.
 *
 * `preferredDistance` must stay comfortably inside `GUARD_AI.kickReach`: a fighter whose
 * preferred spacing (give or take `distanceTolerance`) sits outside his own reach is happy
 * where he stands and never throws a blow.
 */
export const BOSS = {
  maxPips: 12,
  walkSpeed: 20,
  smashDamage: 3,
  tactics: {
    calm: {
      reactionMs: 70,
      blockChance: 0.6,
      aggression: 0.7,
      attackCooldownMs: [700, 1200],
      retreatChance: 0.25,
      retreatMs: 500,
      preferredDistance: 22,
    },
    enraged: {
      reactionMs: 45,
      blockChance: 0.75,
      aggression: 0.95,
      attackCooldownMs: [350, 700],
      retreatChance: 0.1,
      retreatMs: 300,
      preferredDistance: 20,
    },
  },
} as const satisfies BossProfile;
