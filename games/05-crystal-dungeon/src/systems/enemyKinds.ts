/** Every kind of enemy a room can list. The training dummy is a test enemy. */
export const ENEMY_KINDS = ['blub', 'pebblenose', 'flitter', 'thornback', 'dummy'] as const;

export type EnemyKind = (typeof ENEMY_KINDS)[number];

/** Flying enemies can start over water or anything else solid, and ignore it as they fly. */
export const FLYING_KINDS: ReadonlySet<EnemyKind> = new Set(['flitter']);
