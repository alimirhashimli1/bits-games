/** Native resolution in game pixels. The canvas is scaled up from this by whole numbers. */
export const SCREEN = {
  width: 320,
  height: 180,
} as const;

export const COLORS = {
  /** Behind every screen until the arenas are painted. */
  background: 0x000000,
  title: 0xffd23f,
  text: 0xf4f4f4,
  muted: 0x8a8aa8,
} as const;
