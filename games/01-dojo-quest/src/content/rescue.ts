/** The lines of the ending, kept short enough to sit on one centred row. */
export const RESCUE_TEXT = {
  caged: 'MEI IS CAGED BEHIND THE THRONE',
  /** Over the cage, so there is no doubt who is inside it. */
  name: 'MEI',
  hint: 'STRIKE THE BARS',
  barsBreak: 'THE BARS COME DOWN',
  /**
   * Shown on the game over screen after she puts him down. The game never warns him
   * beforehand: it lets the mistake happen, then explains it so it can be put right.
   */
  deathReason: ['MEI DID NOT KNOW YOU WITH YOUR FISTS UP.', 'GO TO HER WITH YOUR GUARD DOWN.'],
  /** Walking up to her with his hands down. */
  good: 'MEI IS FREE',
  /** Walking up to her with his fists still raised. */
  bad: 'FISTS UP, HE IS JUST ANOTHER RAIDER',
} as const;
