import type { PlayableId } from '../roster';

/**
 * Each fighter's reason for entering the Iron Crown, and what they do with it if they win.
 *
 * The intro is shown once, before the first rung of the ladder; the ending after Magnus Vane
 * falls. Both are at most `STORY_LINES` lines of at most `STORY_LINE_CHARS` characters, which is
 * what fits the 320-pixel screen in the pixel font with a margin either side.
 *
 * Typing this against `PlayableId` is deliberate: a fighter added to the roster without a story
 * will not compile, so no one can reach the top of the tower and be met with an empty screen.
 */
export const STORY_LINES = 4;
export const STORY_LINE_CHARS = 38;

export interface FighterStory {
  /** Shown before the first fight, under the fighter's name. */
  readonly intro: readonly string[];
  /** Shown after the boss falls. */
  readonly endingTitle: string;
  readonly ending: readonly string[];
}

export const FIGHTER_STORIES: Readonly<Record<PlayableId, FighterStory>> = {
  brand: {
    intro: [
      'THE DOCKS RAISED HIM AND THE DOCKS',
      'ARE BEING SOLD OUT FROM UNDER THEM.',
      'VANE SIGNED THE ORDER HIMSELF.',
      'BRAND MEANS TO HAND IT BACK TO HIM.',
    ],
    endingTitle: 'BRAND - THE QUIET HARBOUR',
    ending: [
      'HE LEAVES THE CROWN ON THE EMPTY',
      'THRONE AND TAKES THE STAIRS DOWN.',
      'BY MORNING THE ORDER IS ASHES AND',
      'THE CRANES ARE WORKING AGAIN.',
    ],
  },
  tala: {
    intro: [
      'THE PLAZA DANCED FOR TEN YEARS',
      'WAITING FOR A WINNER WHO NEVER CAME.',
      'TALA IS TIRED OF DANCING FOR A MAN',
      'WHO HAS NEVER ONCE COME DOWN.',
    ],
    endingTitle: 'TALA - THE LONG FESTIVAL',
    ending: [
      'SHE CARRIES THE CROWN INTO THE PLAZA',
      'AND HANGS IT WITH THE LANTERNS.',
      'THE FESTIVAL RUNS NINE DAYS.',
      'NOBODY ASKS FOR IT BACK.',
    ],
  },
  grom: {
    intro: [
      'THE MOUNTAIN TOOK HIS BROTHER AND',
      'THE COMPANY CALLED IT AN ACCIDENT.',
      'THE COMPANY IS VANE. THE MINE IS',
      'VANE. GROM CLIMBS TO TELL HIM SO.',
    ],
    endingTitle: 'GROM - THE DEEP SEAM',
    ending: [
      'HE MELTS THE CROWN IN HIS OWN',
      'FURNACE AND POURS IT INTO A BELL.',
      'IT HANGS AT THE MINE HEAD NOW,',
      'AND IT RINGS WHEN EVERYONE IS UP.',
    ],
  },
  nova: {
    intro: [
      'THE STATION LIGHTS HALF THE CITY',
      'AND THE TOWER TAKES THE OTHER HALF.',
      'NOVA HAS READ THE METERS.',
      'SHE IS GOING TO SETTLE THE BILL.',
    ],
    endingTitle: 'NOVA - THE EVEN CURRENT',
    ending: [
      'THE TOWER GOES DARK FOR ONE NIGHT',
      'WHILE SHE REWIRES IT HERSELF.',
      'AFTER THAT EVERY STREET GETS THE',
      'SAME LIGHT, AND THE CROWN GETS NONE.',
    ],
  },
  kestrel: {
    intro: [
      'THEY TOLD HIM THE TOWER COULD NOT',
      'BE CLIMBED FROM THE OUTSIDE.',
      'KESTREL CLIMBED IT ANYWAY, TWICE,',
      'AND WAS TOLD TO ENTER PROPERLY.',
    ],
    endingTitle: 'KESTREL - THE HIGH AIR',
    ending: [
      'HE TAKES THE CROWN TO THE ROOF EDGE',
      'AND LOOKS AT IT ONCE.',
      'THEN HE STEPS OFF, LAUGHING, AND',
      'THE WIND CARRIES HIM HOME.',
    ],
  },
  wen: {
    intro: [
      'HE TRAINED THE MAN WHO WEARS IT.',
      'HE TAUGHT HIM THE FORMS, THE BREATH,',
      'AND ONE THING HE DID NOT LEARN.',
      'OLD WEN COMES TO TEACH IT AGAIN.',
    ],
    endingTitle: 'OLD WEN - THE LAST LESSON',
    ending: [
      'HE SETS THE CROWN IN HIS STUDENT\'S',
      'HANDS AND CLOSES THEM ROUND IT.',
      '"IT WAS NEVER HEAVY," HE SAYS.',
      '"YOU WERE." THEN HE WALKS HOME.',
    ],
  },
  rook: {
    intro: [
      'HE FLEW VANE\'S SUPPLY RUNS FOR SIX',
      'YEARS AND NEVER ASKED WHAT WAS IN',
      'THE CRATES. LAST WINTER HE LOOKED.',
      'ROOK IS DONE CARRYING THEM.',
    ],
    endingTitle: 'ROOK - THE LAST RUN',
    ending: [
      'HE FILES THE CROWN AS CARGO,',
      'SIGNED FOR AND ACCOUNTED FOR,',
      'AND FLIES IT TO THE CAPITAL.',
      'THE PAPERWORK DOES THE REST.',
    ],
  },
  knox: {
    intro: [
      'THE GYM OWES MONEY TO MEN WHO OWE',
      'MONEY TO VANE. THAT IS THE WHOLE',
      'CHAIN, AND KNOX IS AT THE END OF IT.',
      'HE IS GOING TO PULL FROM HIS END.',
    ],
    endingTitle: 'KNOX - THE CLEARED DEBT',
    ending: [
      'HE PAWNS THE CROWN THE SAME NIGHT',
      'AND PAYS OFF THE WHOLE STREET.',
      'THE GYM KEEPS ITS DOORS. THE BILL',
      'ON THE WALL IS HIS, AND IT STAYS UP.',
    ],
  },
  cometa: {
    intro: [
      'THE MASK IS NOT HIS. IT PASSED TO',
      'HIM, AND IT WILL PASS ON AGAIN.',
      'WHAT IT NEEDS IS A NIGHT NOBODY',
      'FORGETS. COMETA HAS FOUND ONE.',
    ],
    endingTitle: 'COMETA - THE NIGHT MARKET',
    ending: [
      'HE WEARS THE CROWN FOR ONE MATCH,',
      'IN THE RING, FOR THE STALLS TO SEE.',
      'THEN IT GOES OVER THE ROPES TO A',
      'CHILD IN THE FRONT ROW. KEEP IT.',
    ],
  },
  sable: {
    intro: [
      'SHE HAS BEEN IN THE TOWER BEFORE,',
      'THROUGH A WINDOW, AND FOUND THE',
      'ROOM WHERE THE NAMES ARE KEPT.',
      'SABLE IS COMING BACK FOR THEM.',
    ],
    endingTitle: 'SABLE - THE OPENED ROOM',
    ending: [
      'SHE LEAVES THE CROWN WHERE IT LAY',
      'AND TAKES THE LEDGERS INSTEAD.',
      'BY DAWN EVERY NAME IN THEM IS',
      'NAILED TO THE TOWER DOOR.',
    ],
  },
  kanan: {
    intro: [
      'THE FOUNDRY POURED THAT CROWN.',
      'HIS FATHER\'S HANDS, HIS FATHER\'S',
      'FIRE, AND NOT ONE COIN FOR IT.',
      'KANAN IS COLLECTING LATE.',
    ],
    endingTitle: 'KANAN - THE SECOND POURING',
    ending: [
      'HE CARRIES IT BACK TO THE FOUNDRY',
      'AND DROPS IT IN THE CRUCIBLE.',
      'WHAT COMES OUT IS A GATE, AND THE',
      'FOUNDRY BELONGS TO THE FLOOR NOW.',
    ],
  },
  mahmood: {
    intro: [
      'HE LOST THE HAND ON A TOWER JOB',
      'AND WAS PAID OFF IN SILENCE.',
      'THEY SAID HE WOULD NEVER FIGHT.',
      'MAHMOOD IS ABOUT TO DISAGREE.',
    ],
    endingTitle: 'MAHMOOD - THE ROOFTOP ROAD',
    ending: [
      'HE HOLDS THE CROWN UP WITH THE HAND',
      'HE HAS LEFT, AND THE ROOFS ROAR.',
      'IT SELLS FOR ENOUGH TO OPEN A GYM',
      'THAT TAKES ANYONE WHO CLIMBS TO IT.',
    ],
  },
  rajab: {
    intro: [
      'VANE HAS NEVER LOST IN TEN YEARS.',
      'NO ONE WINS TEN YEARS RUNNING.',
      'RAJAB HAS DONE THE ARITHMETIC,',
      'AND HE IS CALLING THE HOUSE OUT.',
    ],
    endingTitle: 'RAJAB - THE CALLED BLUFF',
    ending: [
      'HE PUTS THE CROWN ON THE TABLE AS',
      'THE HOUSE STAKE AND DEALS ONE HAND.',
      'THE ROOM PLAYS FOR IT ALL NIGHT.',
      'BY MORNING IT HAS CHANGED HANDS SIX',
    ],
  },
  azar: {
    intro: [
      'HE SIGNED THE DEATH NOTICES FOR',
      'THE LAST THREE TOURNAMENTS.',
      'ALL THREE SAID THE SAME THING,',
      'AND NONE OF IT WAS TRUE.',
    ],
    endingTitle: 'AZAR - THE HONEST RECORD',
    ending: [
      'HE TRADES THE CROWN FOR THE TOWER\'S',
      'MEDICAL BOOKS AND PUBLISHES THEM.',
      'THE CLINIC IS BUSY FOR A MONTH.',
      'NO TOURNAMENT IS HELD THE NEXT YEAR.',
    ],
  },
  osal: {
    intro: [
      'HIS UNIT WAS SENT TO HOLD A ROAD',
      'THAT LED NOWHERE, FOR A MAN IN A',
      'TOWER. NINE CAME BACK.',
      'OSAL IS DELIVERING THE REPORT.',
    ],
    endingTitle: 'OSAL - THE ROAD HOME',
    ending: [
      'HE LEAVES THE CROWN ON THE PARAPET',
      'AND NINE NAMES BESIDE IT.',
      'THE CAMP STANDS DOWN THAT WEEK.',
      'THE ROAD IS LET GO BACK TO GRASS.',
    ],
  },
};
