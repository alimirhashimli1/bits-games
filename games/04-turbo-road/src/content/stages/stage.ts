import type { Track } from '../../systems/road/Track';
import type { Ending } from '../endings/ending';
import type { GateStyle } from '../sprites/gates';
import type { StageTheme } from '../themes/theme';

export type StageId = 'sunsetCoast' | 'palmCanyon' | 'harbourLights' | 'redrockDesert' | 'pinewoodPass' | 'neonBoulevard';
export type GoalId = 'starObservatory' | 'summitLodge' | 'skylinePier';
export type ForkSide = 'left' | 'right';

/** Where a stage leads: a fork to one of two stages, or a finish line. */
export type StageExit =
  | { readonly kind: 'fork'; readonly left: StageId; readonly right: StageId }
  | { readonly kind: 'goal'; readonly goal: GoalId };

/** One stage of the race: its name on the HUD, how it looks, its road, and where it leads. */
export interface Stage {
  readonly id: StageId;
  readonly name: string;
  readonly theme: StageTheme;
  readonly buildTrack: () => Track;
  readonly exit: StageExit;
}

/** One of the three finish lines: its gate over the road, and the ending it leads to. */
export interface Goal {
  readonly id: GoalId;
  readonly name: string;
  readonly gate: GateStyle;
  readonly ending: Ending;
}
