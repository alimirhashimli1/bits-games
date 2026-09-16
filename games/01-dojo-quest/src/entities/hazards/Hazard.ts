import type * as Phaser from 'phaser';

import type { Fighter } from '../Fighter';

/** What a hazard did to Kenji this frame. Matches the labels the area scene already shows. */
export type HazardOutcome = 'hit' | 'knockout';

export interface HazardContext {
  readonly hero: Fighter;
  readonly deltaMs: number;
  /**
   * True once the area's guard is down and Kenji is still on this screen. Hazards only act
   * then, so duels stay one-on-one and the danger falls on the walk to the exit.
   */
  readonly isAreaClear: boolean;
}

/** Something in the scenery that can hurt Kenji and can be avoided. */
export interface Hazard {
  /** Advances the hazard by one frame and reports what it did to Kenji. */
  update(context: HazardContext): HazardOutcome | null;
  /** The area that can hurt right now, or null when it is harmless; shown by the H debug view. */
  dangerZone(): Phaser.Geom.Rectangle | null;
}

/** The gateway a portcullis hangs in, in world pixels. */
export interface GatePlacement {
  readonly left: number;
  readonly width: number;
  /** The underside of the arch: the gate is fully raised here and drops to the floor. */
  readonly openingTop: number;
}

/** A hazard as an area describes it; the area scene builds the real thing, as it does with guards. */
export type HazardPlacement = { readonly kind: 'hawk' } | ({ readonly kind: 'gate' } & GatePlacement);
