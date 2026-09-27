/** The four ways Wren and most enemies can face. They move in eight directions, but face in four. */
export const FACINGS = ['down', 'up', 'left', 'right'] as const;

export type Facing = (typeof FACINGS)[number];

/** One step in each facing, in screen directions: y grows downwards. */
export const FACING_VECTORS: Readonly<Record<Facing, { readonly x: -1 | 0 | 1; readonly y: -1 | 0 | 1 }>> = {
  down: { x: 0, y: 1 },
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE_FACING: Readonly<Record<Facing, Facing>> = { down: 'up', up: 'down', left: 'right', right: 'left' };
