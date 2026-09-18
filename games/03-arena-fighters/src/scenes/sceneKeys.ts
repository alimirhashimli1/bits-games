/** Every scene's name in one place, so transitions cannot break because of a typo. */
export const SCENES = {
  boot: 'Boot',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];
