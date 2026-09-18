/**
 * Pixel Plumber's story, in the order it is told: a card at the start of each world, and the
 * ending. Upper case only, and short lines, for the pixel font on a 320-pixel screen.
 */

export interface WorldStory {
  /** Under the world number on every card for the world. */
  readonly name: string;
  /** Typed out on the card before the first level of the world. */
  readonly lines: readonly string[];
}

export const WORLD_STORIES: Readonly<Record<string, WorldStory>> = {
  '1': {
    name: 'THE STREETS',
    lines: [
      'OVERNIGHT THE SLUDGE BARON CLOGGED',
      'EVERY MAIN IN BRASSWICK.',
      'RUSTY GRABS HIS WRENCH',
      'AND HEADS DOWN THE LINE.',
    ],
  },
  '2': {
    name: 'THE SEWERS',
    lines: [
      'THE SLUDGE RUNS DEEPER THAN THE STREETS.',
      'RUSTY FOLLOWS IT UNDERGROUND,',
      'WHERE THE OLD DRAINS GO DARK.',
    ],
  },
  '3': {
    name: 'THE ROOFTOPS',
    lines: [
      "THE BARON'S PUMPS PUSH THE SLUDGE",
      'UP EVERY CHIMNEY IN TOWN.',
      'OVER THE ROOFS, THEN, AT DUSK.',
    ],
  },
  '4': {
    name: 'THE BOILER WORKS',
    lines: [
      'EVERY PIPE LEADS BACK TO THE',
      'OLD BOILER WORKS. SOMEWHERE INSIDE,',
      'THE PRESSURE VALVE IS STILL SHUT.',
    ],
  },
};

/** Typed out over Brasswick once its lights are back on. */
export const ENDING_LINES: readonly string[] = [
  'THE PRESSURE IS OUT, THE BARON IS FLUSHED',
  'AWAY, AND THE PIPES RUN CLEAR.',
  'ONE BY ONE, BRASSWICK LIGHTS UP AGAIN.',
];

export const ENDING_HEADING = 'THANK YOU, RUSTY!';
