import type { ActionBindings } from '@shared/phaser/actionInput';

import type { InputName } from './systems/input/inputBits';

/** Native resolution in game pixels. The canvas is scaled up from this by whole numbers. */
export const SCREEN = {
  width: 320,
  height: 180,
} as const;

export const COLORS = {
  /** Behind the menu screens. */
  background: 0x000000,
  title: 0xffd23f,
  text: 0xf4f4f4,
  muted: 0x8a8aa8,
  /** Player 1 is red and player 2 is blue, on every screen. */
  player1: 0xff5a5a,
  player2: 0x5aa8ff,
  /** The H debug view's boxes. */
  pushbox: 0xffd23f,
  hurtbox: 0x5aa8ff,
  hitbox: 0xff3b3b,
  throwReach: 0x7cfc9a,
  /** The HUD: health bars, with the strip showing recent damage, and the round-win markers. */
  hudFrame: 0x14121c,
  healthLeft: 0xffd23f,
  healthTrail: 0xff8c1a,
  healthLost: 0x8e1f22,
  roundWon: 0xffd23f,
  roundNotWon: 0x3a3a52,
} as const;

/**
 * Screen-to-screen controls, for the keyboard and any gamepad. Gamepad buttons use the
 * standard layout: 0 = A, 1 = B, 9 = Start, 14 / 15 = D-pad left / right.
 */
export const SCREEN_CONTROLS = {
  confirm: { keys: ['ENTER', 'SPACE'], buttons: [0, 9] },
  back: { keys: ['ESC'], buttons: [1] },
  left: { keys: ['LEFT', 'A'], buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { keys: ['RIGHT', 'D'], buttons: [15], stick: { axis: 0, direction: 1 } },
} as const satisfies ActionBindings<string>;

export type ScreenAction = keyof typeof SCREEN_CONTROLS;

/** Gamepad buttons, the same for both players. Standard layout: 0 = A, 1 = B, 2 = X, 3 = Y, 12-15 = D-pad. */
const GAMEPAD_FIGHT_CONTROLS = {
  up: { buttons: [12], stick: { axis: 1, direction: -1 } },
  down: { buttons: [13], stick: { axis: 1, direction: 1 } },
  left: { buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { buttons: [15], stick: { axis: 0, direction: 1 } },
  lightPunch: { buttons: [2] },
  heavyPunch: { buttons: [3] },
  lightKick: { buttons: [0] },
  heavyKick: { buttons: [1] },
} as const satisfies ActionBindings<InputName>;

type KeyLayout = Readonly<Record<InputName, readonly string[]>>;

/** Keyboard keys for each player: player 1 has the left half of the keyboard, player 2 the right. */
const KEYBOARD_FIGHT_CONTROLS: readonly [KeyLayout, KeyLayout] = [
  {
    up: ['W'],
    down: ['S'],
    left: ['A'],
    right: ['D'],
    lightPunch: ['F'],
    heavyPunch: ['G'],
    lightKick: ['V'],
    heavyKick: ['B'],
  },
  {
    up: ['UP'],
    down: ['DOWN'],
    left: ['LEFT'],
    right: ['RIGHT'],
    lightPunch: ['K'],
    heavyPunch: ['L'],
    lightKick: ['COMMA'],
    heavyKick: ['PERIOD'],
  },
];

/** A player's fight controls: their half of the keyboard plus the gamepad buttons. */
function fightControls(keys: KeyLayout): ActionBindings<InputName> {
  const pad = GAMEPAD_FIGHT_CONTROLS;
  return {
    up: { ...pad.up, keys: keys.up },
    down: { ...pad.down, keys: keys.down },
    left: { ...pad.left, keys: keys.left },
    right: { ...pad.right, keys: keys.right },
    lightPunch: { ...pad.lightPunch, keys: keys.lightPunch },
    heavyPunch: { ...pad.heavyPunch, keys: keys.heavyPunch },
    lightKick: { ...pad.lightKick, keys: keys.lightKick },
    heavyKick: { ...pad.heavyKick, keys: keys.heavyKick },
  };
}

export const PLAYER_CONTROLS = [
  fightControls(KEYBOARD_FIGHT_CONTROLS[0]),
  fightControls(KEYBOARD_FIGHT_CONTROLS[1]),
] as const;

/** How forgiving the motion reader is, in fight steps (60 per second). */
export const INPUT_READING = {
  /** Inputs remembered per player. Must cover the longest motion several times over. */
  historySteps: 64,
  /** A whole motion such as ↓ → must fit in this long: half a second. */
  motionWindowSteps: 30,
  /**
   * A motion's last direction must have been pressed this recently, and the button follows
   * within the same window: a third of a second. Held any longer it counts as walking, not as
   * the tap that starts a special, so → + punch while walking in is still an ordinary punch.
   */
  tapSteps: 20,
  /**
   * Steps allowed between one direction of a motion and the next, such as letting go of ↓ and
   * pressing →: a twelfth of a second. Any longer and the ↓ was a crouch of its own, so the
   * D and F that follow are → + P rather than ↓ → + P.
   */
  motionGapSteps: 5,
} as const;

/** Keys for testing the fight. Keyboard only, and only in development builds. */
export const FIGHT_DEV_CONTROLS = {
  /** Replays every input since the fight began and checks it ends in exactly the live state. */
  replayCheck: { keys: ['R'] },
  /** Shows or hides each player's inputs and the motions read from them (hidden by default). */
  inputDebug: { keys: ['I'] },
  /** Shows or hides push boxes, hurtboxes, hitboxes and move phases (hidden by default). */
  boxDebug: { keys: ['H'] },
  /** Frame advance, as in a training mode: P freezes the fight, and O runs exactly one step. */
  pause: { keys: ['P'] },
  stepOnce: { keys: ['O'] },
} as const satisfies ActionBindings<string>;

/** The fight advances in fixed steps, whatever the refresh rate of the screen. */
export const FIGHT_CLOCK = {
  stepsPerSecond: 60,
  /** After a long stall (a background tab), the fight skips ahead rather than racing to catch up. */
  maxStepsPerFrame: 4,
} as const;

/**
 * Positions and speeds inside the fight are whole numbers of sub-pixels, so every browser
 * computes exactly the same fight. Below, `px` values are pixels and `sub` values sub-pixels.
 */
export const SUBPIXELS_PER_PIXEL = 256;

/** The arena, in pixels. It is wider than the screen, and the camera follows the fighters. */
export const STAGE = {
  width: 512,
  /** Screen row of the floor. */
  floorY: 160,
  /** Distance between the fighters' centres when a round starts. */
  startSeparation: 96,
  /** The furthest apart they can get, so both always stay on screen. */
  maxSeparation: 280,
} as const;

/** The push box every fighter shares, in pixels. Hurtboxes come from each pose instead (see boxes.ts). */
export const BODY = {
  /** Half the width of the push box, the part of a fighter that others cannot walk through. */
  halfWidth: 12,
  standHeight: 56,
  crouchHeight: 36,
  /** In the air the legs tuck up, so the push box starts this far above the feet. That makes it possible to jump over someone. */
  airborneTuck: 20,
} as const;

/**
 * How fighters move, in sub-pixels per step (speeds) and per step squared (gravity). These are the
 * standard speeds; each fighter's data may change them (see fighterMovement.ts), but not gravity.
 */
export const MOVEMENT = {
  walkForward: 384,
  /** Walking backwards is slower, as in the classics. */
  walkBack: 320,
  jumpForward: 448,
  jumpBack: 384,
  /** Upward speed on take-off. With the gravity below, a jump peaks at about 60 px after 22 steps. */
  jumpVelocity: 1400,
  gravity: 64,
  /** Below this upward or downward speed a jump is at its top and shows the tucked pose. */
  jumpApexSpeed: 700,
} as const;

/** The rules of a fight. Steps are fight steps (60 per second), speeds sub-pixels per step. */
export const COMBAT = {
  maxHealth: 1000,
  /** Both fighters freeze for a moment when a blow lands, which is what makes it feel solid. */
  hitstopSteps: { hit: 7, block: 5 },
  /** How quickly a pushback slide slows down, per step. */
  slideFriction: 48,
  knockdown: {
    /** A knocked-down fighter pops up and back before falling. */
    popSpeed: 900,
    driftSpeed: 256,
    lyingSteps: 30,
    risingSteps: 20,
  },
  throw: {
    /** Greatest distance between the two fighters' centres, in pixels, for a throw to catch. */
    rangePx: 30,
    /** Light punch and light kick count as pressed together when they come within this many steps. */
    inputSteps: 3,
    /** The one being thrown can break free by pressing the same buttons this soon. */
    techSteps: 10,
    durationSteps: 20,
    damage: 120,
    tossSpeed: 384,
    tossPop: 1000,
    /** A broken throw pushes both apart at this speed, and both hold their guard this long. */
    techPush: 768,
    techRecoverySteps: 10,
  },
} as const;

export type CpuLevel = 'easy' | 'normal' | 'hard';

/**
 * How well the CPU plays. Steps are fight steps (60 per second), chances run from 0 to 1.
 * - `reactionSteps`: how far behind the CPU sees its opponent. It reacts to what it saw that long ago.
 * - `thinkSteps`: how often it picks something new to do when it is free.
 * - `block`: chance of blocking an attack it sees coming; `readGuard`: chance of blocking it the right way (low or high).
 * - `antiAir`: chance of meeting a jump-in with an anti-air attack; `techThrow`: of breaking a throw.
 * - `mistake`: chance of doing something rash instead of the sensible thing; `combo`: of cancelling a hit into a special.
 * - `aggression`: scales how often it attacks rather than waiting.
 */
export const CPU_LEVELS: Readonly<Record<CpuLevel, CpuLevelSettings>> = {
  easy: { reactionSteps: 24, thinkSteps: 16, block: 0.15, readGuard: 0.2, antiAir: 0.1, techThrow: 0, mistake: 0.35, combo: 0, aggression: 0.6 },
  normal: { reactionSteps: 14, thinkSteps: 10, block: 0.5, readGuard: 0.6, antiAir: 0.4, techThrow: 0.25, mistake: 0.12, combo: 0.3, aggression: 0.9 },
  hard: { reactionSteps: 7, thinkSteps: 5, block: 0.85, readGuard: 0.95, antiAir: 0.75, techThrow: 0.5, mistake: 0.03, combo: 0.7, aggression: 1.1 },
};

export interface CpuLevelSettings {
  readonly reactionSteps: number;
  readonly thinkSteps: number;
  readonly block: number;
  readonly readGuard: number;
  readonly antiAir: number;
  readonly techThrow: number;
  readonly mistake: number;
  readonly combo: number;
  readonly aggression: number;
}

/** The CPU's sense of distance, in pixels between the fighters' centres. */
export const CPU_RANGES = {
  /** Close enough for jabs, sweeps and throws. */
  close: 34,
  throw: 28,
  /** An attack under way this close is a threat worth blocking. */
  threat: 80,
  /** A projectile this close and coming this way is a threat. */
  projectileThreat: 120,
  /** Far enough to throw a projectile rather than walk in. */
  projectile: 90,
  /** Close enough to jump in from. */
  jumpIn: 120,
  /** A jump-in this close gets an anti-air, and a jumping CPU kicks when its opponent is this close. */
  antiAir: 44,
  airAttack: 50,
} as const;

/** The match rules used unless the options (or the dev address bar) say otherwise. */
export const MATCH_DEFAULTS = {
  roundSeconds: 99,
  roundsToWin: 2,
} as const;

/** How a round unfolds, in fight steps (60 per second). */
export const ROUND = {
  /** "ROUND 1" is shown this long before the fight starts. */
  introSteps: 90,
  /** "FIGHT!" stays up this long once it has started. */
  fightTextSteps: 45,
  /** After a KO or when time runs out, the fighters settle for this long before the result. */
  endingSteps: 100,
  /** The round's result and the winner's pose, before the next round starts. */
  resultSteps: 150,
} as const;

/** How long screens stay up on their own, in milliseconds. */
export const TIMINGS = {
  /** The VS screen moves on by itself after this, or straight away on confirm. */
  versusScreenMs: 2500,
  /** Once the match is decided, the fight stays on screen this long before the results. */
  matchOverMs: 1500,
} as const;
