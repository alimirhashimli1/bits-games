/** Every level in play order: four worlds of two levels each. */
export const LEVEL_IDS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'] as const;

export type LevelId = (typeof LEVEL_IDS)[number];
