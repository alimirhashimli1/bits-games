export interface StoryChapter {
  readonly title: string;
  /** At most 4 lines, each at most 48 characters, to fit the text box. */
  readonly lines: readonly string[];
}

/** One chapter before each area, in the same order as AREAS. */
export const STORY_CHAPTERS: readonly StoryChapter[] = [
  {
    title: 'CHAPTER 1: ASHES',
    lines: [
      'KENJI FOLLOWS THE HOOFPRINTS NORTH',
      'UNTIL THE FIELDS TURN TO BARE ROCK.',
      'THE CLIFF ROAD CLIMBS INTO THE DARK,',
      "AND GORRAN'S FIRST MAN IS WAITING.",
    ],
  },
  {
    title: 'CHAPTER 2: THE STAIRS',
    lines: [
      'THE ROAD NARROWS INTO CUT STONE STEPS.',
      'FAR BELOW, HIS VILLAGE STILL BURNS.',
      'A SENTRY GUARDS THE LANDING ABOVE.',
    ],
  },
  {
    title: 'CHAPTER 3: THE WALL',
    lines: [
      'THE STAIRS END AT A WALL OF BLACK STONE.',
      'TORCHES BURN BESIDE THE OUTER GATE,',
      'AND THESE MEN FIGHT BETTER THAN THE LAST.',
    ],
  },
  {
    title: 'CHAPTER 4: THE COURTYARD',
    lines: [
      'BEYOND THE GATE, A CHERRY TREE BLOOMS',
      'IN A SILENT COURTYARD.',
      'NOTHING HERE HAS HEARD OF MERCY.',
    ],
  },
  {
    title: 'CHAPTER 5: THE BARRACKS',
    lines: [
      'SPEARS LEAN IN ROWS AGAINST THE WALL.',
      "GORRAN'S MEN SLEEP HERE IN SHIFTS.",
      'ONE OF THEM IS STILL WIDE AWAKE.',
    ],
  },
  {
    title: 'CHAPTER 6: THE HALL',
    lines: [
      'WAR BANNERS HANG IN THE INNER HALL.',
      'SOMEWHERE ABOVE, MEI CALLS HIS NAME.',
      'THE BEST OF THEM STAND BETWEEN THEM.',
    ],
  },
  {
    title: 'CHAPTER 7: THE WATCHTOWER',
    lines: [
      'WIND AND A BELL ROPE, HIGH ABOVE THE WALLS.',
      'THE WHOLE VALLEY LIES DARK BELOW.',
      'ONE SHOUT WOULD BRING THE FORTRESS RUNNING.',
    ],
  },
  {
    title: 'CHAPTER 8: THE THRONE',
    lines: [
      'THE THRONE ROOM DOORS SWING OPEN.',
      "GORRAN'S STRONGEST GUARD BLOCKS THE WAY.",
      'THIS ENDS TONIGHT.',
    ],
  },
];

/** The chapter told before area `index`; throws if it does not exist. */
export function chapterAt(index: number): StoryChapter {
  const chapter = STORY_CHAPTERS[index];
  if (!chapter) throw new Error(`There is no story chapter ${index}.`);
  return chapter;
}
