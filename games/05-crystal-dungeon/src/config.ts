import type { ActionBindings } from '@shared/phaser/actionInput';

import type { Facing } from './systems/facing';

/** Native resolution in game pixels. The canvas is scaled up from this by whole numbers. */
export const SCREEN = {
  width: 320,
  height: 180,
} as const;

/**
 * Every overworld screen and dungeon room is the same size, and sits below the HUD.
 * 20 × 10 tiles of 16 px fill the 320 × 160 pixels under the 20-pixel HUD exactly.
 */
export const ROOM = {
  tileSize: 16,
  columns: 20,
  rows: 10,
  /** The HUD strip across the top of the screen. The room is drawn below it. */
  hudHeight: 20,
} as const;

export const COLORS = {
  /** Behind the title, game over and ending screens, and the HUD. */
  screen: 0x000000,
  title: 0x7ee8fa,
  text: 0xf4f4f4,
  muted: 0x8a8aa8,
  danger: 0xff6b6b,
  /** Laid over the frozen world behind the pause menu and the inventory. */
  dim: 0x05060f,
  /** Behind the sprite gallery: the overworld's grass, so sprites are seen as in the game. */
  gallery: 0x5aa83a,
  /** A hit enemy flashes this colour. */
  enemyHurtTint: 0xff5050,
  /** Solid tiles in the collision debug view. */
  debugSolid: 0xff3b6b,
  /** The dialogue box: its fill, its frame and the speaker's name. */
  dialogueBox: 0x0b0c1c,
  dialogueFrame: 0xf4f4f4,
  speaker: 0xffd23f,
  /** The price under a ware in the shop. */
  price: 0xf4f4f4,
  /** A stunned enemy is tinted this colour. */
  stunTint: 0x7ab0ff,
  /** Laid over a dark room until the Lantern lights it. */
  darkness: 0x000000,
  /** The cursor round the chosen item in the inventory. */
  inventoryCursor: 0xffd23f,
  inventorySlot: 0x4a4a66,
} as const;

/** How see-through the collision debug view is, from 0 (invisible) to 1. */
export const DEBUG_SOLID_ALPHA = 0.45;

/** How Wren moves. Speeds are in pixels per second, distances in pixels. One tile is 16 pixels. */
export const WREN = {
  /** The same in every direction: moving diagonally is not faster. */
  walkSpeed: 80,
  /**
   * Walking straight into the corner of something solid slides her round it, if she overlaps
   * it by this much or less. It makes doorways and one-tile gaps easy to walk into.
   */
  cornerSlideMargin: 6,
  /**
   * Her physics body inside the 16×16 frame: only her feet and lower legs, so her head and
   * shoulders can overlap the tiles above her, as if she stood in front of them.
   */
  body: { width: 10, height: 6, offsetX: 3, offsetY: 10 },
  /** What enemies hurt her by touching, round the middle of her frame: most of her figure, not just her feet. */
  hurtBox: { x: -5, y: -6, width: 10, height: 14 },
} as const;

/** Moving from one screen or room to the next. Times in milliseconds, distances in pixels. */
export const SCREEN_CHANGE = {
  /** Walking off an edge slides the old screen out and the next one in, in this time. */
  scrollMs: 700,
  /**
   * During the slide Wren is carried across the edge by her body's size plus this much, so she
   * ends up clear of the edge she came in by.
   */
  carry: 4,
  /**
   * Dungeon rooms have a wall a tile thick, with the doors in it: sliding into one carries her this
   * much further, clear of the wall, so a door that shuts behind her cannot close on her.
   */
  wallCarry: 16,
  /** Going through a door fades to black and back, each way taking this long. */
  fadeMs: 250,
  /** Her body counts as touching an edge this close to it, as physics rarely stops it exactly there. */
  edgeTolerance: 0.5,
} as const;

/** Draw order: higher is drawn on top. */
export const DEPTHS = {
  room: 0,
  enemies: 8,
  /** Facing up, the sword is held up in front of her, so from behind it is partly hidden by her. */
  swordBehind: 9,
  wren: 10,
  swordInFront: 11,
  spark: 12,
  /** Prices under the wares in the shop. */
  prices: 13,
  /** The Moonrang in flight, and the Lantern's flame. */
  items: 14,
  explosion: 15,
  /** A dark room's shadow, over everything in the room. */
  darkness: 18,
  debug: 20,
} as const;

/** Health is counted in half hearts. */
export const HEALTH = {
  unitsPerHeart: 2,
  startHearts: 3,
} as const;

/** A rectangle relative to the middle of Wren's frame. */
export interface OffsetRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The sword. Its sprite sits at `spriteOffset` from the middle of Wren's frame, and it hits
 * whatever overlaps `reach`, the blade and crossguard. Both depend on which way she faces.
 */
export const SWORD = {
  damage: 1,
  spriteOffset: {
    up: { x: 0, y: -11 },
    down: { x: 0, y: 10 },
    left: { x: -12, y: 1 },
    right: { x: 12, y: 1 },
  } satisfies Record<Facing, { readonly x: number; readonly y: number }>,
  reach: {
    up: { x: -3, y: -19, width: 6, height: 14 },
    down: { x: -3, y: 5, width: 6, height: 14 },
    left: { x: -20, y: -2, width: 14, height: 6 },
    right: { x: 6, y: -2, width: 14, height: 6 },
  } satisfies Record<Facing, OffsetRect>,
} as const;

/** Thrown by a swing at full health. It flies until it hits an enemy or leaves the room. */
export const SPARK = {
  speed: 220,
  damage: 1,
  /** Its hitbox: a square this size round its middle. */
  size: 8,
} as const;

/** Getting hurt, and hurting enemies. Speeds in pixels per second, times in milliseconds. */
export const COMBAT = {
  wrenKnockbackSpeed: 200,
  wrenKnockbackMs: 150,
  /** After a hit she cannot be hurt again for this long, and blinks. */
  wrenInvincibleMs: 1000,
  blinkMs: 60,
  enemyKnockbackSpeed: 220,
  enemyKnockbackMs: 120,
  /** An enemy flashes and cannot be hit again for this long: longer than one thrust, so a swing hits once. */
  enemyHurtMs: 250,
  /** After her defeat animation, the world stays up this long before Game Over. */
  defeatPauseMs: 800,
} as const;

/**
 * Overworld enemies. Health is in sword hits, contact damage in half hearts, speeds in pixels
 * per second, times in milliseconds. `[min, max]` pairs are picked from at random each time.
 */
export const ENEMIES = {
  blub: {
    health: 1,
    contactDamage: 1,
    restMs: [500, 1100],
    hopMs: 380,
    hopSpeed: 60,
  },
  pebblenose: {
    health: 2,
    contactDamage: 1,
    walkSpeed: 36,
    /** At each tile it reaches, the chance it turns a new way, and the chance it stops to spit a pebble. */
    turnChance: 0.3,
    spitChance: 0.2,
    /** It stands still this long, spitting halfway through. */
    spitPauseMs: 500,
  },
  flitter: {
    health: 1,
    contactDamage: 1,
    speed: 70,
    /** How fast its heading swings round, in radians per second. It swings one way, then the other. */
    turnRate: 2.5,
    turnSwitchMs: [400, 1200],
    flyMs: [2500, 4500],
    restMs: [800, 1600],
  },
  thornback: {
    health: 3,
    contactDamage: 2,
    walkSpeed: 24,
    turnChance: 0.3,
    chargeSpeed: 150,
    /** Wren counts as in line with it when she is this close to its row or column. */
    lineTolerance: 6,
    /** After a charge ends against something, it stands dazed, and cannot charge again for a while. */
    dazedMs: 600,
    chargeCooldownMs: 1200,
  },
} as const;

/** What a Pebblenose spits. Wren's shield stops it if she faces it while walking or standing. */
export const PEBBLE = {
  speed: 120,
  damage: 1,
  size: 6,
} as const;

/** Using the item in hand: she holds her pose this long (ms), unable to move. */
export const ITEM_USE = {
  poseMs: 180,
} as const;

/** The Moonrang: flies out, stuns what it hits, and brings back gems, hearts and keys. Pixels and milliseconds. */
export const MOONRANG = {
  speed: 200,
  /** How far it flies before it turns back. */
  range: 80,
  /** Its hitbox: a square this size round its middle. */
  size: 10,
  stunMs: 2000,
  /** It is caught once it comes back this close to the middle of her frame. */
  catchDistance: 8,
  /** Turns per second as it spins. */
  spinTurnsPerSecond: 3,
} as const;

/** Bombs: set down in front of Wren, they blow up after a while, hurting everything near and opening cracked walls. */
export const BOMB = {
  /** How far in front of the middle of her frame it is set down. */
  placeDistance: 12,
  fuseMs: 1500,
  /** It blinks for the last part of its fuse, faster and faster: from blinkMs down to this share of it. */
  blinkFromMs: 900,
  blinkMs: 90,
  fastestBlinkShare: 1 / 3,
  /** Everything whose middle is this close to the bomb is caught in the blast; cracked walls this close open. */
  radius: 26,
  /** In sword hits for enemies; in half hearts for Wren. */
  damage: 2,
  wrenDamage: 2,
  maxOnScreen: 2,
  /** How long the blast shows. */
  blastMs: 300,
} as const;

/** The Lantern: its flame, held out in front of her, lights a dark room (and later, torches). */
export const LANTERN = {
  /** How far in front of the middle of her frame the flame burns. */
  reach: 14,
  flameMs: 450,
  /** How dark a dark room is before it is lit, from 0 (not at all) to 1 (black). */
  darkAlpha: 0.88,
  /** How long the darkness takes to lift. */
  lightUpMs: 500,
} as const;

/** What a defeated enemy may leave behind. Chances are out of 1, of all defeats; the rest leave nothing. */
export const DROPS = {
  heartChance: 0.15,
  /** Only once Wren has the bomb bag: before that, these defeats leave nothing. */
  bombChance: 0.1,
  gemChance: 0.4,
  /** How often each gem value turns up, out of the gems dropped. */
  gemValues: [
    { value: 1, weight: 80 },
    { value: 5, weight: 18 },
    { value: 20, weight: 2 },
  ],
  /** Half hearts a heart gives back. */
  heartHealth: 2,
  /** Drops lie there this long, blinking for the last part, then vanish. */
  lifetimeMs: 8000,
  blinkFromMs: 5500,
  /** Pickups can be collected by touching them with this much of her figure. */
  size: 10,
} as const;

/** The most of each thing Wren can carry, and how much a pickup gives. */
export const CARRY = {
  maxGems: 999,
  maxKeys: 9,
  /** The bomb bag holds this many. Before she finds it she can carry none. */
  bombBagSize: 8,
  bombsPerPickup: 4,
} as const;

/**
 * The HUD strip across the top: the mini-map on the left, then the gem, key and bomb counters,
 * the item in hand, and the hearts on the right. Positions in pixels inside the strip.
 */
export const HUD = {
  miniMap: { x: 4, y: 3, width: 44, height: 14, gap: 1 },
  /** Each counter is an 8-pixel icon, then its number. */
  counters: { x: 56, y: 6, iconSize: 8, iconGap: 2, spacing: 6 },
  /** The framed box showing the item in hand, with its 16-pixel sprite inside. */
  itemBox: { x: 164, y: 1, size: 18 },
  hearts: { size: 8, spacing: 9, rightMargin: 8 },
  colors: {
    miniMapBack: 0x2a2a3a,
    miniMapScreen: 0x6a6a88,
    miniMapHere: 0x7ee8fa,
    /** The boss room, once she has the dungeon's compass. */
    miniMapBoss: 0xff5a6a,
    itemFrame: 0x8a8aa8,
    counter: 0xf4f4f4,
  },
} as const;

/**
 * The dialogue box, laid over the room below the HUD: at the bottom, or at the top when Wren is
 * in the lower half of the room. Sizes in pixels. A page is the speaker's name and up to
 * `linesPerPage` lines of text, wrapped at `charsPerLine`.
 */
export const DIALOGUE = {
  margin: 4,
  width: 312,
  height: 50,
  padding: 6,
  lineHeight: 10,
  linesPerPage: 3,
  charsPerLine: 48,
  charsPerSecond: 45,
  /** How see-through the box is, from 0 (invisible) to 1. */
  alpha: 0.95,
  /** The "more" arrow in the corner blinks at this rate once a page is fully shown. */
  moreBlinkMs: 300,
} as const;

/** Talking: walking into someone or a sign. */
export const TALK = {
  /** After a talk ends, walking into them again does nothing for this long (ms), so a held key does not restart it. */
  cooldownMs: 400,
  /** She talks to what is this many pixels ahead of her body, the way she faces and pushes. */
  reach: 2,
  /**
   * The solid part of a villager or a ware inside its 16×16 frame: most of it, but not the top
   * rows, so Wren can stand just above someone with her feet against their shoulders.
   */
  body: { width: 12, height: 12, offsetX: 2, offsetY: 4 },
} as const;

/** What the Emberfen shop sells, in gems. */
export const SHOP = {
  prices: { brightshield: 90, bombRefill: 20, potion: 40 },
  /** The price is drawn this far below the middle of its ware, in the cell below it. */
  priceOffsetY: 11,
  /**
   * A ware's solid part covers its own cell and the price in the cell below, so Wren stops
   * clear of both and can see what she is buying.
   */
  wareBody: { width: 14, height: 32, offsetX: 1, offsetY: 0 },
} as const;

/** The training dummy: a test enemy that stands still, and hurts on contact. */
export const DUMMY = {
  health: 3,
  contactDamage: 1,
} as const;

/**
 * Wren's controls in the world. Gamepad buttons use the standard layout:
 * 8 = Select, 9 = Start, 12-15 = D-pad up/down/left/right. The directions are named after
 * the way she faces, so a pressed direction is also a facing.
 */
export const PLAYER_CONTROLS = {
  up: { keys: ['UP', 'W'], buttons: [12], stick: { axis: 1, direction: -1 } },
  down: { keys: ['DOWN', 'S'], buttons: [13], stick: { axis: 1, direction: 1 } },
  left: { keys: ['LEFT', 'A'], buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { keys: ['RIGHT', 'D'], buttons: [15], stick: { axis: 0, direction: 1 } },
  /** 0 = A. */
  sword: { keys: ['Z', 'SPACE'], buttons: [0] },
  /** Uses the item in hand. 1 = B. */
  useItem: { keys: ['X'], buttons: [1] },
  /** Opens the pause menu over the frozen world. */
  pause: { keys: ['ESC'], buttons: [8] },
  /** Opens the inventory over the frozen world. */
  inventory: { keys: ['ENTER'], buttons: [9] },
} as const satisfies ActionBindings<string>;

export type PlayerAction = keyof typeof PLAYER_CONTROLS;

/**
 * The inventory: left and right choose the item in hand; it closes with the button that opened
 * it, or the menus' usual way back (Esc, or B = button 1).
 */
export const INVENTORY_CONTROLS = {
  left: { keys: ['LEFT', 'A'], buttons: [14], stick: { axis: 0, direction: -1 } },
  right: { keys: ['RIGHT', 'D'], buttons: [15], stick: { axis: 0, direction: 1 } },
  close: { keys: ['ENTER', 'ESC'], buttons: [9, 1] },
} as const satisfies ActionBindings<string>;

/** The inventory's row of items, in pixels. */
export const INVENTORY = {
  slotSize: 22,
  slotGap: 8,
  slotsY: 70,
  nameY: 100,
  bombsY: 116,
} as const;

/** World keys for testing, until real defeats and the real ending exist. Keyboard only. */
export const WORLD_DEV_CONTROLS = {
  gameOver: { keys: ['G'] },
  ending: { keys: ['V'] },
  /** Shows or hides solid tiles and physics bodies (hidden by default). */
  debugCollision: { keys: ['H'] },
  /** Drops an enemy in front of Wren: the training dummy, then each kind in turn. */
  spawnEnemy: { keys: ['J'] },
  /** Hurts Wren by half a heart, as if hit from in front. */
  hurtWren: { keys: ['K'] },
  /** Gives every item and a full bomb bag. */
  giveItems: { keys: ['I'] },
  giveKey: { keys: ['U'] },
  /** Gives `DEV_GEMS` gems. (M is kept for muting.) */
  giveGems: { keys: ['N'] },
  /** Puts the next item she owns in her hand, without opening the inventory. */
  cycleItem: { keys: ['C'] },
} as const satisfies ActionBindings<string>;

export const DEV_GEMS = 50;

/** Moving on in the dialogue box: shows the whole page, then the next one. */
export const DIALOGUE_CONTROLS = {
  advance: { keys: ['Z', 'SPACE', 'ENTER'], buttons: [0] },
} as const satisfies ActionBindings<string>;

/** J drops an enemy this many tiles in front of Wren. */
export const DEV_SPAWN_DISTANCE_TILES = 2;
