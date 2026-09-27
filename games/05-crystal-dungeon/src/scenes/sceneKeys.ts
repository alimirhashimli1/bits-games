/** Every scene's name in one place, so transitions cannot break because of a typo. */
export const SCENES = {
  boot: 'Boot',
  title: 'Title',
  /** The controls table, from the title menu. */
  controls: 'Controls',
  /** The overworld and the dungeons: wherever Wren is walking. */
  world: 'World',
  /** The strip across the top, running beside the World scene. */
  hud: 'Hud',
  /** Laid over a frozen world rather than replacing it. */
  pause: 'Pause',
  /** Items and the dungeon map, laid over a frozen world like the pause menu. */
  inventory: 'Inventory',
  /** What people and signs say, and the shop's questions, laid over a frozen world. */
  dialogue: 'Dialogue',
  gameOver: 'GameOver',
  /** The Heartcrystal is whole again and the valley lights up. */
  ending: 'Ending',
  /** Development tool: every animation on one screen. */
  spriteGallery: 'SpriteGallery',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
