/** Every scene's name in one place, so transitions cannot break because of a typo. */
export const SCENES = {
  boot: 'Boot',
  title: 'Title',
  /** Arcade, versus or online. */
  modeSelect: 'ModeSelect',
  characterSelect: 'CharacterSelect',
  /** The two fighters face each other before the match. */
  versus: 'Versus',
  fight: 'Fight',
  results: 'Results',
  /** Development tool: every animation and attack of one fighter. */
  spriteGallery: 'SpriteGallery',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
