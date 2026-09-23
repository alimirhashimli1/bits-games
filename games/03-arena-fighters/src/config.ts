import type { ActionBinding, ActionBindings } from '@shared/phaser/actionInput';

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

export type SelectAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back';

/**
 * The character select gives each player their own cursor, moving at the same time, so both are
 * choosing at once rather than waiting their turn. Each player uses the same half of the keyboard
 * and the same gamepad as they will in the fight, so there is no second layout to learn: the
 * directions move the cursor, light punch confirms and light kick takes the choice back.
 */
/**
 * `shared` adds Enter, Space and Esc, which only player 1 gets: someone playing alone should not
 * have to hunt for F, but if both players answered to Enter one press would choose for both.
 */
function selectControls(keys: KeyLayout, shared: boolean): ActionBindings<SelectAction> {
  const pad = GAMEPAD_FIGHT_CONTROLS;
  return {
    up: { ...pad.up, keys: keys.up },
    down: { ...pad.down, keys: keys.down },
    left: { ...pad.left, keys: keys.left },
    right: { ...pad.right, keys: keys.right },
    confirm: { buttons: [0, 9], keys: [...keys.lightPunch, ...(shared ? ['ENTER', 'SPACE'] : [])] },
    back: { buttons: [1], keys: [...keys.lightKick, ...(shared ? ['ESC'] : [])] },
  };
}

export const SELECT_CONTROLS = [
  selectControls(KEYBOARD_FIGHT_CONTROLS[0], true),
  selectControls(KEYBOARD_FIGHT_CONTROLS[1], false),
] as const;

/**
 * The controls for a screen only one person is choosing on: player 1's, with player 2's
 * directions added to them. Someone alone at the keyboard reaches for the arrows as readily as
 * for WASD, and with no second cursor on the screen there is nothing for the arrows to disturb.
 * In versus the two sets stay apart, so one press never moves both players at once.
 */
export const ONE_PLAYER_SELECT_CONTROLS: ActionBindings<SelectAction> = bothWaysToMove(SELECT_CONTROLS[0], SELECT_CONTROLS[1]);

function bothWaysToMove(first: ActionBindings<SelectAction>, second: ActionBindings<SelectAction>): ActionBindings<SelectAction> {
  const direction = (action: 'up' | 'down' | 'left' | 'right'): ActionBinding => ({
    ...first[action],
    keys: [...(first[action].keys ?? []), ...(second[action].keys ?? [])],
  });
  return {
    up: direction('up'),
    down: direction('down'),
    left: direction('left'),
    right: direction('right'),
    confirm: first.confirm,
    back: first.back,
  };
}

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

/** The three levels a player can choose between. The boss plays at a level of his own. */
export type ChosenCpuLevel = 'easy' | 'normal' | 'hard';

export type CpuLevel = ChosenCpuLevel | 'boss';

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
  // Magnus Vane only. He sees sooner, thinks oftener and slips less than the hard CPU, but he
  // still plays by exactly the same rules: his inputs go through the fight like anyone else's.
  boss: { reactionSteps: 6, thinkSteps: 5, block: 0.88, readGuard: 0.96, antiAir: 0.8, techThrow: 0.55, mistake: 0.04, combo: 0.75, aggression: 1.15 },
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
  /** An overhead special is tried against a crouching opponent this close; beyond `close`, the heavy version, which steps further. */
  overhead: 46,
  /** A dive is tried from between these distances, the heavy one (which reaches further) beyond `heavyBeyond`. */
  dive: { nearest: 56, furthest: 100, heavyBeyond: 82 },
  /** A fighter this close to the wall behind them is cornered, and a wall leap gets them out. */
  cornered: 36,
  /** A counter is only raised against an attack started this close, which can actually reach. */
  counter: 52,
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
  /** How fast the prompt under a story blinks. */
  promptBlinkMs: 500,
  /** In arcade, the winner is shown this long before the next fighter's VS screen. */
  arcadeNextMs: 1800,
} as const;

/** How quickly a fighter's arcade story types itself out, in characters a second. */
export const STORY = { charsPerSecond: 44 } as const;

/** The arcade continue: how long the count gives the player to decide. */
export const ARCADE_CONTINUE = { seconds: 9 } as const;

/**
 * Online play. The two browsers talk to each other directly; everything here is about keeping
 * their two copies of the fight in step and noticing when they are not.
 */
export const NET = {
  /** Room codes: six characters from an alphabet without look-alike letters or digits. */
  codeAlphabet: 'ACDEFGHJKMNPQRSTUVWXYZ2345679',
  codeLength: 6,
  /** The guest needs an address of its own too, and nobody ever types it, so it is longer. */
  guestCodeLength: 14,
  /** Room codes are ids on a shared signalling server, so they carry the game's name. */
  peerPrefix: 'arena-fighters-',
  /** Round trips measured before the match starts; the quickest of them sets the input delay. */
  pings: 3,
  /** Steps of input delay: each side decides its input this many steps before the step runs. */
  minDelaySteps: 2,
  maxDelaySteps: 8,
  /** The fight compares checksums this often (once a second), and remembers this many of its own. */
  checkSteps: 60,
  checkMemory: 8,
  /** A step whose opponent's input has not arrived shows a notice after this long... */
  waitNoticeMs: 1000,
  /** ...and gives the match up after this long. Longer than the VS screen, which one side can skip. */
  disconnectMs: 10000,
  /** How far ahead of the step being fought an input may be before it is dropped as nonsense. */
  frameWindow: 900,
  /** The highest frame and match numbers a message may name at all. */
  maxFrame: 1000000,
  maxMatch: 999,
  /** How long a failure or the end of a match is shown before the title screen. */
  noticeMs: 2500,
} as const;

/**
 * Opening the pause menu over a frozen fight. Standard gamepad button 9 is Start.
 * An online match ignores it: the other browser cannot be stopped, so neither can this one.
 */
export const PAUSE_CONTROL = {
  pause: { keys: ['ESC'], buttons: [9] },
} as const satisfies ActionBindings<string>;

/** Keys that work on every screen, bound on the window rather than in a scene. */
export const GLOBAL_KEYS = {
  mute: ['M'],
} as const;

/** Sound and music. The fight makes no noise itself; these are the numbers its voice uses. */
export const AUDIO = {
  /** A blow taking at least this much health gets the heavier of the two impact sounds. */
  heavyHitDamage: 80,
} as const;
