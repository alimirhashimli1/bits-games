/** Every scene's name in one place, so transitions cannot break because of a typo. */
export const SCENES = {
  boot: 'Boot',
  title: 'Title',
  /** The controls table, from the title menu. */
  controls: 'Controls',
  /** Round time, rounds to win, how well the computer plays, and sound. */
  options: 'Options',
  /** Laid over a frozen fight rather than replacing it. Never in an online match. */
  pause: 'Pause',
  /** Arcade, VS CPU, versus or online. */
  modeSelect: 'ModeSelect',
  characterSelect: 'CharacterSelect',
  /** Versus only: which of the sixteen arenas the next match is fought in. */
  arenaSelect: 'ArenaSelect',
  /** Online only: the room is opened, its link shared, and the two browsers introduced. */
  online: 'Online',
  /** A fighter's arcade story: their reason for entering, and their ending. */
  story: 'Story',
  /** The arcade countdown after a lost fight. */
  continue: 'Continue',
  /** The two fighters face each other before the match. */
  versus: 'Versus',
  fight: 'Fight',
  results: 'Results',
  /** Development tool: every animation and attack of one fighter. */
  spriteGallery: 'SpriteGallery',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
