/**
 * What happens when Rusty touches an enemy, and what a steam puff or a sliding shell does to one.
 * Plain rules with no Phaser in them, so they can be read and tested on their own.
 */

export type EnemyForm = 'gloop' | 'shellbug' | 'flutterbug' | 'sprout' | 'spark';

/** Only Shellbugs have more than one state: everything else always walks. */
export type EnemyState = 'walking' | 'shell' | 'sliding';

export type TouchOutcome =
  /** Rusty takes a hit. */
  | 'hurtRusty'
  /** Stomped into a puddle. */
  | 'flatten'
  /** Thrown over on its back, falling out of the level. */
  | 'knockOver'
  /** A Shellbug pulls into its shell. */
  | 'shell'
  /** A Flutterbug loses its wings and carries on as a Shellbug. */
  | 'loseWings'
  /** A resting shell is kicked away from Rusty. */
  | 'kick'
  /** A sliding shell is stopped. */
  | 'stopShell'
  /** Nothing at all, for what cannot be beaten or hurt. */
  | 'nothing';

export interface Touch {
  readonly form: EnemyForm;
  readonly state: EnemyState;
  /** True when Rusty came down on it, rather than walking into it. */
  readonly fromAbove: boolean;
  /** True while the Golden Gasket lasts. */
  readonly invincible: boolean;
}

/** What Rusty touching this enemy does, to him or to it. */
export function resolveTouch({ form, state, fromAbove, invincible }: Touch): TouchOutcome {
  // A Spark is fire on a chain: it cannot be beaten, and the Gasket only keeps Rusty safe from it.
  if (form === 'spark') return invincible ? 'nothing' : 'hurtRusty';
  if (invincible) return 'knockOver';
  // A Sprout snaps from inside its pipe, so there is nothing to land on.
  if (form === 'sprout') return 'hurtRusty';
  if (state === 'shell') return 'kick';
  if (state === 'sliding') return fromAbove ? 'stopShell' : 'hurtRusty';
  if (!fromAbove) return 'hurtRusty';
  switch (form) {
    case 'gloop':
      return 'flatten';
    case 'flutterbug':
      return 'loseWings';
    case 'shellbug':
      return 'shell';
  }
}

/** A steam puff or a sliding shell beats anything it catches, except a Spark. */
export function survivesHit(form: EnemyForm): boolean {
  return form === 'spark';
}
