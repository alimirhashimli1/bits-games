import type { BackgroundLayer } from '../backgrounds';
import type { RoadPalette } from '../palettes';
import type { SceneryKind } from '../sprites/scenery';

/**
 * What a stage's scenery is, by the part it plays. Tracks ask for a role, so one track shape
 * can be dressed as a coast road, a canyon or a city street.
 */
export interface ThemeScenery {
  /** Lines the road: palms, pines, lamps. */
  readonly tall: SceneryKind;
  /** Low along the verge, usually soft enough to drive through. */
  readonly low: SceneryKind;
  /** Big and solid, well back from the road. */
  readonly building: SceneryKind;
  /** Solid and close enough to the road to hit. */
  readonly obstacle: SceneryKind;
}

/** How a stage looks: its road colours, its horizon and its scenery. */
export interface StageTheme {
  readonly palette: RoadPalette;
  readonly background: readonly BackgroundLayer[];
  readonly scenery: ThemeScenery;
}
