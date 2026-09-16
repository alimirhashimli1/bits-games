/** Every scene's name in one place, so transitions cannot break because of a typo. */
export const SCENES = {
  boot: 'Boot',
  title: 'Title',
  /** The cold open: the village is raided and Mei is taken. */
  raid: 'Raid',
  /** Kenji arrives at the burning village. */
  prologue: 'Prologue',
  story: 'Story',
  /** One screen of the fortress, with or without a guard. */
  area: 'Area',
  gameOver: 'GameOver',
  victory: 'Victory',
  /** Development tool: every animation on one screen. */
  spriteGallery: 'SpriteGallery',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
