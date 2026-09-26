/** Native resolution in game pixels, the same as the other games. */
export const SCREEN = {
  width: 320,
  height: 180,
} as const;

/** The game updates this many times per second, whatever the monitor's refresh rate. */
export const STEPS_PER_SECOND = 60;

/**
 * After a long pause (a background tab, a debugger), the loop drops the missed time
 * instead of racing through hundreds of steps to catch up.
 */
export const MAX_STEPS_PER_FRAME = 5;

/** Length of a fade to or from black between scenes, in steps (0.3 s, as in the other games). */
export const FADE_STEPS = 18;

export const COLORS = {
  background: '#000000',
  title: '#ffd23f',
  text: '#f4f4f4',
  muted: '#8a8aa8',
  selected: '#ffd23f',
  /** The clock when time is running out. */
  warning: '#ff4a3a',
  /** Drawn round HUD text, so it reads over sky, clouds and road. */
  textOutline: '#1b1b22',
} as const;

/** The clock and the score. */
export const RACE = {
  /** Time on the clock at the start. Checkpoints add more. */
  startSeconds: 60,
  /** At or under this many seconds, the clock turns red. */
  lowTimeSeconds: 10,
  /**
   * Points per world unit driven at top speed. Slower driving earns less per unit as well as
   * covering less ground: flat out is 600 points a second.
   */
  pointsPerUnit: 0.05,
  /** Crossing a finish line, every second left on the clock is worth this many points. */
  timeBonusPerSecond: 1000,
  /**
   * Once time is up, or the Comet is over a finish line, and it has braked to a stop, the race
   * waits this long before Game Over or the ending (1 s).
   */
  stoppedDelaySteps: 60,
} as const;

/** The road, in world units. The camera sits above the road's centre line. */
export const ROAD = {
  /** Length of one segment of track. */
  segmentLength: 200,
  /** Half the width of the tarmac, from the centre line to the rumble strip. */
  halfWidth: 1200,
  lanes: 3,
  /** Rumble strips, grass and tarmac change shade every this many segments, which shows the speed. */
  stripeSegments: 3,
  /** Rumble strip width, as a share of the road's half width. */
  rumbleWidth: 0.12,
  /** Lane line width, as a share of the road's half width. */
  laneLineWidth: 0.03,
  cameraHeight: 1000,
  fieldOfViewDegrees: 100,
  /** How many segments ahead are drawn. */
  drawDistance: 160,
  /** The screen row the road vanishes towards. */
  horizonY: 84,
  /** Steepest a hill may get (rise over distance). Steeper drops hide the road just ahead. */
  maxSlope: 0.3,
} as const;

/** Where a stage's road splits in two at its end. */
export const FORK = {
  /**
   * How far each branch's centre ends up from the old centre line, in road half-widths. At 2,
   * the branches' inner rumble strips are 1.76 apart, with grass and the fork sign between.
   */
  branchOffset: 2,
  /** The fork sign stands in the median once the branches are this far apart (half-widths). */
  signFrom: 1.8,
  /** The banner naming both branches goes up this far before the fork, in world units. */
  warningDistance: 12000,
} as const;

/** What happens when the car hits scenery. */
export const CRASH = {
  /** Faster than this (about 73 km/h), a hit flips the car. Slower, it only bumps it. */
  minSpeed: 50,
  /** How long the car tumbles before it is back on the road, in steps (1.5 s). */
  tumbleSteps: 90,
  /** How many times it turns over. */
  tumbleTurns: 2,
  /** Highest point of the tumble, in pixels above the road. */
  tumbleHeight: 28,
  /** Share of its speed the tumbling car keeps each step, as it slides to a stop. */
  slideDrag: 0.95,
  /** Share of its speed the car keeps after a bump. */
  bumpSpeedKept: 0.4,
  /** How far a bump nudges the car back towards the road, in road half-widths. */
  bumpPush: 0.12,
} as const;

/** The other vehicles on the road. Speeds are in world units per step, like the Comet's. */
export const TRAFFIC = {
  /** Vehicles are spread along a stage one per this many world units at the start. */
  spacing: 6000,
  /**
   * No vehicle starts closer to the camera than this, in world units: the road is clear for the
   * Comet and the rivals' starting grid (the last rival starts 6,500 ahead of the camera).
   */
  clearStart: 8000,
  /** Speeding up and slowing down, per step. */
  acceleration: 0.5,
  braking: 1.5,
  /**
   * A driver brakes in time to be going no faster than anything in their lane by the time they
   * are this far behind it, in world units.
   */
  followGap: 700,
  /** Chance per step that a driver starts moving to the next lane. */
  laneChangeChance: 0.004,
  /** Sideways speed while changing lanes, in road half-widths per step. */
  laneChangeSpeed: 0.02,
  /** How long a vehicle is, in world units: the Comet touches it when its nose is inside this. */
  length: 250,
  /** Touching the back of a vehicle, any driver (the Comet too) drops to this share of its speed. */
  bumpSpeedShare: 0.8,
  /** How far a touch knocks the Comet sideways, away from the vehicle, in road half-widths. */
  bumpPush: 0.25,
} as const;

/** The three rival drivers. Their cruising speeds are in `content/rivals.ts`. */
export const RIVALS = {
  /** Points for passing each rival, once per rival. */
  overtakeBonus: 5000,
  /** Speeding up and slowing down, per step. Off the line they pull away from the Comet. */
  acceleration: 0.8,
  braking: 3,
  /**
   * A rival looks for a way round anything in their lane closer ahead than this, in world units.
   * It must be more than a rival needs to brake from 186 to a truck's 50 (about 3,100), or a
   * rival could move into a lane that looked clear and find a truck it cannot stop for.
   */
  lookAhead: 3500,
  /** ...and only moves into a lane with nothing this close behind or `lookAhead` in front. */
  lookBehind: 600,
  /**
   * With no way round, a rival brakes in time to be going no faster than whatever is in the way
   * by the time it is this far behind it, in world units.
   */
  followGap: 300,
  /** Chance per step that a rival on a clear road weaves into the next lane anyway. */
  weaveChance: 0.006,
  /** Sideways speed while changing lanes, in road half-widths per step: sharper than traffic. */
  laneChangeSpeed: 0.035,
} as const;

/** The map of the route between stages. */
export const ROUTE_MAP = {
  /** It moves on by itself after this long (4 s), or sooner on START. */
  showSteps: 240,
  /** The next stage blinks on and off every this many steps. */
  blinkSteps: 20,
} as const;

/** The ending at each goal. */
export const ENDING = {
  /** The Comet drives up the road and parks over this long (2.5 s). */
  driveSteps: 150,
  /** Its size as it pulls in, and once parked, as a share of its size in the race. */
  startScale: 1,
  parkedScale: 0.5,
  /** Where its tyres are once parked, as a screen row. */
  parkedY: 112,
  /** After parking, the time bonus waits this long before it starts counting (0.5 s)... */
  tallyDelaySteps: 30,
  /** ...then moves one second across every this many steps. */
  tallyStepsPerSecond: 3,
  /** PRESS START blinks on and off every this many steps. */
  blinkSteps: 30,
} as const;

/** The engine note, the tyres, and how often one-off sounds may repeat. */
export const SOUND = {
  engine: {
    /** Pitch at a standstill, and how much it climbs from there to the top of a gear, in hertz. */
    idleHz: 48,
    revRangeHz: 132,
    /** Over-revving after changing down climbs no higher than this share of the gear's top. */
    maxRevs: 1.3,
    /** Louder with the throttle open than coasting. */
    volume: 0.08,
    coastVolume: 0.05,
    /** A second, square voice an octave below gives the note some body. */
    subVolume: 0.05,
    cutoffHz: 900,
  },
  squeal: {
    /** Tyres squeal braking faster than this... */
    brakingSpeed: 100,
    /** ...or steering into a bend at least this sharp, faster than this. */
    bendCurve: 4,
    bendSpeed: 150,
    freqHz: 1250,
    /** The pitch wobbles by up to this much, step to step. */
    wobbleHz: 80,
    volume: 0.025,
    cutoffHz: 3000,
  },
  /** A touch lasting several steps thuds once; the next thud needs this long without touching (0.25 s). */
  bumpRepeatSteps: 15,
} as const;

/** The best scores, kept in this browser. */
export const HIGH_SCORES = {
  /** How many are kept. */
  count: 5,
  initialsLength: 3,
  storageKey: 'turbo-road.high-scores',
} as const;

/** Short messages across the middle of the screen, such as a rival being passed. */
export const BANNER = {
  /** How long a message stays up, in steps (2 s). */
  showSteps: 120,
} as const;

/** The scenery beside the road. */
export const SCENERY = {
  /** How big one pixel of a scenery sprite is in the world. A 45-pixel palm stands 2,250 tall. */
  worldUnitsPerPixel: 50,
} as const;

/** The layers of scenery on the horizon. */
export const BACKGROUND = {
  /** Width of one repeat of a layer, in pixels: twice the screen, so a repeat is hard to spot. */
  layerWidth: 640,
} as const;

/**
 * The Comet GT. Speeds are in world units per step (200 = 12,000 per second, about 290 km/h).
 * Sideways positions are in road half-widths: 0 is the centre line, ±1 the edges of the tarmac.
 */
export const CAR = {
  gears: {
    /** Pulls hard from a standstill, but runs out of speed early. */
    low: { topSpeed: 110, acceleration: 0.9, minimumPull: 1, fullPullFrom: 1 },
    /** Barely pulls from a standstill, builds to full power by `fullPullFrom`, and is much faster at the top. */
    high: { topSpeed: 200, acceleration: 0.8, minimumPull: 0.12, fullPullFrom: 110 },
  },
  /** Slowing down with no pedal pressed, per step. */
  coastDrag: 0.2,
  braking: 2.4,
  /** Slowing down while over the top speed of the gear, after changing down at speed. */
  engineBraking: 1.2,
  offRoad: {
    /** How far out the tarmac and rumble strip reach. */
    edge: 1.12,
    topSpeed: 60,
    drag: 1.6,
    /** The car judders up and down on rough ground, one pixel every this many steps. */
    judderSteps: 3,
  },
  /** How far the car moves sideways per step at top speed, when steering. */
  steering: 0.035,
  /**
   * How hard a bend pushes the car outwards, per unit of bend, at top speed. A sharp bend (6)
   * then pushes 0.027 a step against 0.035 of steering: it can be held flat out, but only just.
   */
  bendPush: 0.0045,
  /** Furthest the car can go from the centre line, well out on the grass. */
  maxSideways: 2.5,
  /** For the speedometer: km/h per world unit per step. */
  kmhPerSpeed: 1.46,
  /**
   * How far ahead of the camera the car is. It is drawn at the bottom of the screen, which shows
   * the road about this far ahead, so bends, grass and scenery are all checked there.
   */
  distanceAhead: 1500,
  /** Half the car's width, in road half-widths, for hitting scenery. */
  hitHalfWidth: 0.2,
  /** Gap between the car's tyres and the bottom of the screen, in pixels. */
  screenBottomGap: 4,
  /** How far the body leans sideways in a turn, in pixels at the top of the sprite. */
  leanPixels: 2,
} as const;
