/** Every scene's name in one place, so transitions cannot break because of a typo. */
export const SCENES = {
  boot: 'Boot',
  title: 'Title',
  /** The black card before each level: world number and lives left. */
  worldIntro: 'WorldIntro',
  level: 'Level',
  gameOver: 'GameOver',
  /** The pipes run clear and Brasswick lights up again. */
  ending: 'Ending',
  /** Development tool: every Rusty animation on one screen. */
  spriteGallery: 'SpriteGallery',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
