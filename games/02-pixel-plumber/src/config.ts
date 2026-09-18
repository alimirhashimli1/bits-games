import type { ActionBindings } from '@shared/phaser/actionInput';

/** Native resolution in game pixels. The canvas is scaled up from this by whole numbers. */
export const SCREEN = {
  width: 320,
  height: 180,
} as const;

export const COLORS = {
  /** Daytime sky over the streets of Brasswick. */
  background: 0x5c94fc,
  /** Behind the title, world intro and end screens. */
  screen: 0x000000,
  title: 0xffd23f,
  text: 0xf4f4f4,
  muted: 0x8a8aa8,
  danger: 0xff6b6b,
  success: 0x7cfc9a,
  /** Dusk over the rooftops of world 3. */
  dusk: 0x3a2f6a,
  /** Behind the sewers of world 2. */
  sewer: 0x141c2c,
  /** Behind the coin rooms under a level. */
  underground: 0x0a0a14,
} as const;

/**
 * Screen-to-screen controls. Gamepad buttons use the standard layout:
 * 0 = A, 1 = B, 9 = Start.
 */
export const SCREEN_CONTROLS = {
  confirm: { keys: ['ENTER', 'SPACE'], buttons: [0, 9] },
} as const satisfies ActionBindings<string>;

/**
 * Rusty's controls. Gamepad buttons use the standard layout:
 * 0 = A, 1 = B, 2 = X, 12-15 = D-pad up/down/left/right.
 */
export const PLAYER_CONTROLS = {
  left: { keys: ['LEFT'], buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { keys: ['RIGHT'], buttons: [15], stick: { axis: 0, direction: 1 } },
  down: { keys: ['DOWN'], buttons: [13], stick: { axis: 1, direction: 1 } },
  jump: { keys: ['Z', 'SPACE'], buttons: [0] },
  run: { keys: ['X'], buttons: [2, 1] },
} as const satisfies ActionBindings<string>;

export type PlayerAction = keyof typeof PLAYER_CONTROLS;

/** Level keys for testing, until the real level end and enemies exist. Keyboard only. */
export const LEVEL_DEV_CONTROLS = {
  clearLevel: { keys: ['ENTER'] },
  loseLife: { keys: ['L'] },
  /** Cycles Rusty through small, big and steam, straight away. */
  cyclePower: { keys: ['G'] },
  /** Hurts Rusty as an enemy would. */
  hurt: { keys: ['K'] },
  /** Drops the next enemy a few tiles in front of Rusty: Gloop, Shellbug, Flutterbug, in turn. */
  dropEnemy: { keys: ['J'] },
  /** Shows or hides solid tiles and physics bodies (hidden by default). */
  debugCollision: { keys: ['H'] },
} as const satisfies ActionBindings<string>;

/**
 * How Rusty moves. Speeds are in pixels per second, accelerations in pixels per second
 * squared, and timings in milliseconds. One tile is 16 pixels.
 */
export const RUSTY = {
  walkSpeed: 90,
  runSpeed: 150,
  walkAcceleration: 300,
  runAcceleration: 400,
  /** Slowing down with no direction held, and easing back to walking speed when run is let go. */
  releaseDeceleration: 600,
  /** Braking while pushing the other way on the ground: this is the skid. */
  skidDeceleration: 1100,
  /** In the air Rusty can still steer, but more weakly. */
  airTurnDeceleration: 400,
  airReleaseDeceleration: 120,

  gravity: 1000,
  /** Holding jump all the way clears a 4-tile (64 px) ledge from standing, and 5 tiles when running. */
  jumpSpeed: 390,
  /** Extra jump speed for each pixel per second of running speed, so running jumps go higher. */
  runJumpBonus: 0.15,
  /** Letting go of jump while rising faster than this cuts the rise down to it. */
  jumpCutSpeed: 130,
  maxFallSpeed: 400,
  /** A jump still works this long after walking off a ledge. */
  coyoteMs: 80,
  /** A jump pressed this long before landing still happens. */
  jumpBufferMs: 100,
  /** Below this speed Rusty counts as standing still. */
  stillSpeed: 4,
} as const;

/** Rusty's physics body in each shape, inside his 16-pixel-wide frame. */
export const RUSTY_BODIES = {
  small: { width: 12, height: 15, offsetX: 2, offsetY: 1 },
  big: { width: 12, height: 28, offsetX: 2, offsetY: 4 },
  duck: { width: 12, height: 14, offsetX: 2, offsetY: 18 },
} as const;

export const LEVEL = {
  /** Tiles are square, in game pixels. */
  tileSize: 16,
  /**
   * Every level map is this many rows. 12 rows are 192 pixels, 12 more than the screen,
   * so the top row sits half hidden behind the HUD, as on the original console.
   */
  rows: 12,
  /**
   * Where Rusty's feet sit on screen, in pixels from the left edge, once the camera starts
   * following him. A little left of centre leaves more room to see what is coming.
   */
  cameraLeadX: 144,
  /** After falling into a pit, how long the level stays on screen before the life is lost. */
  pitLifeLostDelayMs: 1000,
  /** Each level starts with this much time. One unit takes a little under half a second, as on the original. */
  startTime: 400,
  timeUnitMs: 400,
  /** Below this the clock turns red and every remaining unit counts. */
  lowTime: 100,
  /** Solid tiles in the collision debug view. */
  debugSolidColor: 0xff3b6b,
  debugSolidAlpha: 0.45,
} as const;

/** Blocks, coins and brick pieces. Distances in pixels, speeds in pixels per second. */
export const BLOCKS = {
  /** How far a hit block pops up, and how long it takes to go up (and again to come down). */
  bumpHeight: 4,
  bumpMs: 70,
  /** A coin brick keeps paying out for this long after its first hit, up to `multiCoinMax` coins. */
  multiCoinWindowMs: 4000,
  multiCoinMax: 10,
  /** A coin from a block flies this high above the block, then drops back a little and vanishes. */
  coinPopHeight: 36,
  coinPopRiseMs: 200,
  coinPopFallMs: 120,
  coinPopFallDistance: 12,
  /** A loose coin's body, smaller than its 16×16 frame so Rusty has to actually touch the coin. */
  coinBodyWidth: 8,
  coinBodyHeight: 12,
  /** A broken brick bursts into four pieces: two thrown high, two lower, spreading sideways. */
  debrisSpreadSpeed: 60,
  debrisHighLaunchSpeed: 320,
  debrisLowLaunchSpeed: 200,
  debrisLifetimeMs: 1500,
} as const;

/** Changing power state, getting hurt and losing a life. Timings in milliseconds. */
export const POWER = {
  /** Between big and steam Rusty the game freezes while he flickers from one look to the other this many times. */
  flickerMs: 70,
  flickerCount: 8,
  /** After a hit Rusty blinks, and nothing can hurt him, for this long. */
  hurtInvincibleMs: 2000,
  hurtBlinkMs: 50,
  /** The Golden Gasket: how long it lasts, how fast Rusty flashes, and when the flashing slows as a warning. */
  gasketMs: 9000,
  gasketFlashMs: 60,
  gasketWarningMs: 2000,
  gasketWarningFlashMs: 180,
  /** Colours Rusty flashes through while the Golden Gasket lasts. White shows him as he is. */
  gasketTints: [0xffd23f, 0xffffff, 0xff9a3c, 0xffffff],
  /** Losing a life to a hit: a frozen moment, then a hop up and a fall out of the level. */
  defeatPauseMs: 500,
  defeatJumpSpeed: 330,
  defeatLifeLostDelayMs: 2500,
} as const;

/** Items coming out of blocks. Distances in pixels, speeds in pixels per second. */
export const ITEMS = {
  /** An item rises out of its block this slowly before it starts moving. */
  riseMs: 700,
  /** Gear and 1-Up Wrench slide along the ground, turning round at walls. */
  slideSpeed: 60,
  /** The Golden Gasket bounces along. */
  gasketSpeed: 80,
  gasketBounceSpeed: 300,
  /** Every item's body, bottom-centred in its 16×16 frame. */
  bodyWidth: 12,
  bodyHeight: 14,
  /** The floating "1UP" over Rusty: how far it rises and how long it takes. */
  labelRise: 24,
  labelMs: 800,
} as const;

/** Steam Rusty's puffs. Distances in pixels, speeds in pixels per second. */
export const STEAM = {
  /** At most this many puffs can be out at once. */
  maxPuffs: 2,
  speed: 210,
  /** Each time a puff lands it bounces up at this speed. */
  bounceSpeed: 200,
  /** Where a puff starts, from Rusty's feet: this far in front of him and this far up. */
  spawnAhead: 8,
  spawnHeight: 18,
  bodySize: 6,
  /** How long the burst shows when a puff hits a wall. */
  burstMs: 120,
} as const;

/** Brasswick's pests. Speeds are in pixels per second, timings in milliseconds. */
export const ENEMIES = {
  /** An enemy stands still until the right-hand edge of the screen comes this close to it. */
  wakeMargin: 24,
  /** Rusty's feet have to come down within this far of an enemy's top for it to count as a stomp. */
  stompDepth: 10,
  /** How hard Rusty bounces off something he stomps or kicks. */
  stompBounceSpeed: 250,
  walkSpeed: 40,
  /** How long a stomped Gloop lies flat before it is gone. */
  flatMs: 400,
  /** A kicked shell slides this fast, and wakes up again if it is left alone this long. */
  shellSpeed: 190,
  shellWakeMs: 7000,
  /** Just after a shell is kicked or stopped it passes through Rusty, so it is not kicked straight back. */
  kickGraceMs: 250,
  /** Standing this close to the middle of a shell kicks it the way Rusty faces, not away from him. */
  kickFacingDistance: 6,
  /** A Flutterbug hops this hard, this often. */
  hopSpeed: 250,
  hopMs: 1200,
  /** A Sprout stays down while Rusty is this close, so the pipe he is standing on is safe. */
  sproutSafeX: 30,
  sproutRiseSpeed: 40,
  /** How long a Sprout stays out, and how long it waits inside its pipe. */
  sproutOutMs: 1600,
  sproutDownMs: 1800,
  /** A Spark swings round its anchor: how far out it is, and how long one turn takes. */
  sparkRadius: 34,
  sparkTurnMs: 2600,
  sparkChainLinks: 3,
  /** A beaten enemy flips over, is thrown up this hard, and falls out of the level. */
  knockOverSpeed: 240,
} as const;

/** Each enemy's physics body, inside its frame. Shells are shorter than the beetles in them. */
export const ENEMY_BODIES = {
  gloop: { width: 14, height: 12, offsetX: 1, offsetY: 4 },
  shellbug: { width: 13, height: 12, offsetX: 1, offsetY: 4 },
  shell: { width: 14, height: 9, offsetX: 1, offsetY: 7 },
  sprout: { width: 12, height: 15, offsetX: 2, offsetY: 3 },
  spark: { width: 10, height: 10, offsetX: 3, offsetY: 3 },
} as const;

/** The girders that ride back and forth over the rooftops. Speeds in pixels per second. */
export const PLATFORMS = {
  /** Every platform is this many tiles wide, and this many pixels thick. */
  widthTiles: 3,
  thickness: 8,
  speed: 48,
  /** At each end of its track a platform waits this long, so Rusty can step on and off. */
  restMs: 800,
  /**
   * How far Rusty's feet may have gone past a platform's top in one frame and still land on it.
   * A platform moving under him and gravity pulling him down both stay well inside this.
   */
  footing: 3,
} as const;

/** Pipes Rusty can go down, and the rooms under them. */
export const PIPES = {
  /** How long sinking into a pipe, or rising back out of one, takes. */
  passMs: 600,
} as const;

/** Finishing a level on the valve wheel. Distances in pixels, speeds in pixels per second. */
export const LEVEL_END = {
  /** How wide the pole is to catch hold of. */
  grabWidth: 12,
  /** How far Rusty's middle sits from the middle of the pole while he holds the wheel. */
  holdOffset: 8,
  /** How fast the wheel, and Rusty with it, wind down the pole. */
  slideSpeed: 110,
  /** He lets go at the bottom, then walks on for this long before the clock is counted. */
  walkOffMs: 1400,
  /** How long each unit left on the clock takes to count into the score. */
  countdownMs: 12,
  /** A pause on an empty clock, before the next level. */
  countedPauseMs: 700,
} as const;

/** What everything is worth. */
export const SCORING = {
  /**
   * Beating enemies without a pause is worth more each time: the last one on the list and
   * everything after it in the same run gives an extra life instead of points.
   */
  chainPoints: [100, 200, 400, 800, 1000, 2000, 4000, 5000, 8000],
  /** Another enemy beaten within this long carries the run on. */
  chainWindowMs: 1500,
  /** Kicking a shell is worth the same every time: it carries no run, or a shell could be kicked for lives. */
  kick: 400,
  coin: 200,
  /** A Gear, a Steam Valve or a Golden Gasket. The 1-Up Wrench gives a life instead. */
  item: 1000,
  brokenBrick: 50,
  /** Catching the valve wheel, from the foot of the pole to the very top. */
  wheelBonus: [100, 400, 800, 2000, 5000],
  /** Each unit left on the clock when a level is finished. */
  timeUnit: 50,
  /** Coins roll over at this many, and each roll-over is an extra life. */
  coinsPerLife: 100,
} as const;

export const RUN = {
  startingLives: 3,
} as const;

export const TIMING = {
  promptBlinkMs: 500,
  /** How long the world intro card stays up before the level starts on its own. */
  worldIntroMs: 2000,
} as const;
