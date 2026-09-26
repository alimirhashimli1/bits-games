/** How much a bend turns per segment. Positive bends go right, negative ones left. */
export const CURVE = {
  gentle: 2,
  medium: 4,
  sharp: 6,
} as const;

/**
 * How far from the centre line scenery stands, in road half-widths (the tarmac and rumble strip
 * end at 1.12). Use them negative for the left-hand side.
 */
export const SIDE = {
  /** Just past the rumble strip: curve signs. */
  verge: 1.2,
  /** Close enough to hit with a wide line. */
  near: 1.5,
  /** Well out on the grass. */
  far: 2.4,
} as const;

/**
 * How far a hill climbs, in world units (the camera rides 1,000 above the road). The track
 * builder refuses hills that are too steep, so higher ones need longer sections: at least
 * 27, 53 and 79 segments for these three.
 */
export const HILL = {
  low: 1000,
  medium: 2000,
  high: 3000,
} as const;

/**
 * Seconds added at the checkpoint just after the start of each stage on legs 2 and 3. Those
 * stages take 27 to 33 seconds flat out with no traffic, so a clean run gains a few seconds on
 * each, and a crash or two can be made up. The first stage takes about 40 of the first 60.
 */
export const STAGE_CHECKPOINT_SECONDS = 40;

/** Every stage starts with this long a straight, and leg 2 and 3 checkpoints stand at its end. */
export const START_STRAIGHT = 25;

/** Straight road before the fork begins, and the length of the fork itself. */
export const FORK_APPROACH = 40;
export const FORK_LENGTH = 60;
