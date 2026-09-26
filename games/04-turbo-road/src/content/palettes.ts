/** A colour for the light stripes and one for the dark ones. */
export interface StripeColors {
  readonly light: string;
  readonly dark: string;
}

/** Every colour the road renderer needs. Each stage theme has its own. */
export interface RoadPalette {
  /** Bands of sky from the top of the screen down to the horizon, drawn in equal heights. */
  readonly sky: readonly string[];
  /** The ground beside the road: grass, sand, or a quay or pavement at night. */
  readonly grass: StripeColors;
  readonly rumble: StripeColors;
  readonly road: StripeColors;
  readonly laneLine: string;
}

