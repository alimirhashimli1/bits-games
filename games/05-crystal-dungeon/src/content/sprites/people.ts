import type { PixelMap } from '@shared/pixel-art/pixelMap';
import type { PixelAnimationDefinition, SpriteSheetDefinition } from '@shared/phaser/pixelSprites';

import { ART_COLORS } from '../palette';

/**
 * The people of Emberfen, drawn from the front: they stand and face whoever talks to them.
 * Each has a second frame with the eyes shut, for blinking.
 */

/** Gran Maudie: a grey bun, a purple shawl and a long red skirt. */
const GRAN: PixelMap = [
  '......kkkk......',
  '.....kgGggk.....',
  '....kggggggk....',
  '...kgGggggggk...',
  '...kgssssssgk...',
  '...kskssssksk...',
  '....kssSSssk....',
  '.....kssssk.....',
  '...kppppppppk...',
  '..kpPppppppPpk..',
  '..ksPppppppPsk..',
  '...krrrrrrrrk...',
  '...krRrrrrRrk...',
  '..krrRrrrrRrrk..',
  '..krrrrrrrrrrk..',
  '...kbbk..kbbk...',
];

/** Pim the shopkeeper: a red cap, a moustache and a white apron. */
const PIM: PixelMap = [
  '.....kkkkkk.....',
  '....kcCcccck....',
  '...kkkkkkkkkk...',
  '...khsssssshk...',
  '...khsksskshk...',
  '....kssssssk....',
  '....ksShhSsk....',
  '.....kssssk.....',
  '...ktaaaaaatk...',
  '..kttaaaaaattk..',
  '..kstaaaaaatsk..',
  '...ktaaaaaatk...',
  '...ktaAaaAatk...',
  '....kaaaaaak....',
  '....kLLkkLLk....',
  '....kkk..kkk....',
];

/** Tolly the fisher: a wide straw hat, a white beard and a green vest. */
const TOLLY: PixelMap = [
  '....kkkkkkkk....',
  '...kyYyyyyYyk...',
  '.kkyyyyyyyyyykk.',
  '..kkkkkkkkkkkk..',
  '....kskssksk....',
  '....kwsssswk....',
  '....kwwwwwwk....',
  '.....kwwwwk.....',
  '...kvvttttvvk...',
  '..kvvvttttvvvk..',
  '..ksvvttttvvsk..',
  '...kvvnnnnvvk...',
  '....kLLLLLLk....',
  '....kLLkkLLk....',
  '....kLLkkLLk....',
  '....kkk..kkk....',
];

/** Little Bree: two pigtails and a pink dress, a head shorter than the grown-ups. */
const BREE: PixelMap = [
  '................',
  '................',
  '.....kkkkkk.....',
  '..kk.khhhhk.kk..',
  '..khkhHhhHhkhk..',
  '...kkhsssshkk...',
  '....kskssksk....',
  '....kssSSssk....',
  '.....kssssk.....',
  '....kddddddk....',
  '...kdDddddDdk...',
  '...ksddddddsk...',
  '..kddDddddDddk..',
  '..kddddddddddk..',
  '....ksk..ksk....',
  '....kbk..kbk....',
];

/** Old Fennick the hermit: a brown hood, a long white beard, and a walking staff. */
const HERMIT: PixelMap = [
  '.....kkkkkk.....',
  '....kooooook....',
  '...kooOOOOook...',
  '...koksssskok...',
  '...koskssksok...',
  '...kowwwwwwok...',
  '..nkowwwwwwok...',
  '..nkoowwwwook...',
  '..nkooooooook...',
  '..skoOooooOok...',
  '..nkoOooooOok...',
  '..nkooooooook...',
  '..nkoOooooOok...',
  '..nkooooooook...',
  '..nkooooooook...',
  '..nkkkkkkkkkk...',
];

/** The same drawing with its eyes shut: the outline pixels on `row` become skin shade. */
function blinking(map: PixelMap, row: number): PixelMap {
  return map.map((line, index) => (index === row ? line.replace(/(?<=s)k(?=s)/g, 'S') : line));
}

/** Which row each person's eyes are on. */
const EYE_ROWS = { gran: 5, pim: 4, tolly: 4, bree: 6, hermit: 4 } as const;

export const PEOPLE_SHEET = {
  key: 'people',
  palette: {
    k: ART_COLORS.outline,
    s: ART_COLORS.wrenSkin,
    S: ART_COLORS.wrenSkinShade,
    g: ART_COLORS.greyHair,
    G: ART_COLORS.greyHairLight,
    p: ART_COLORS.shawl,
    P: ART_COLORS.shawlDark,
    r: ART_COLORS.skirt,
    R: ART_COLORS.skirtDark,
    b: ART_COLORS.leather,
    c: ART_COLORS.cap,
    C: ART_COLORS.capLight,
    h: ART_COLORS.brownHair,
    H: ART_COLORS.brownHairLight,
    t: ART_COLORS.shirt,
    a: ART_COLORS.apron,
    A: ART_COLORS.apronShade,
    L: ART_COLORS.trousers,
    y: ART_COLORS.straw,
    Y: ART_COLORS.strawDark,
    w: ART_COLORS.beard,
    v: ART_COLORS.vest,
    n: ART_COLORS.plankDark,
    d: ART_COLORS.dress,
    D: ART_COLORS.dressDark,
    o: ART_COLORS.robe,
    O: ART_COLORS.robeDark,
  },
  frames: {
    gran: GRAN,
    granBlink: blinking(GRAN, EYE_ROWS.gran),
    pim: PIM,
    pimBlink: blinking(PIM, EYE_ROWS.pim),
    tolly: TOLLY,
    tollyBlink: blinking(TOLLY, EYE_ROWS.tolly),
    bree: BREE,
    breeBlink: blinking(BREE, EYE_ROWS.bree),
    hermit: HERMIT,
    hermitBlink: blinking(HERMIT, EYE_ROWS.hermit),
  },
} as const satisfies SpriteSheetDefinition;

/** A blink lasts one frame; the eyes stay open for this many frames between blinks. */
const BLINK_FRAME_RATE = 6;
const OPEN_FRAMES = 16;

/** Eyes open for a while (the open frame played over and over), then shut for a moment. */
function idle(key: string, open: string, shut: string): PixelAnimationDefinition {
  return { key, frames: [...Array<string>(OPEN_FRAMES).fill(open), shut], frameRate: BLINK_FRAME_RATE, repeat: -1 };
}

export const PEOPLE_ANIMATIONS = {
  gran: idle('gran-idle', 'gran', 'granBlink'),
  pim: idle('pim-idle', 'pim', 'pimBlink'),
  tolly: idle('tolly-idle', 'tolly', 'tollyBlink'),
  bree: idle('bree-idle', 'bree', 'breeBlink'),
  hermit: idle('hermit-idle', 'hermit', 'hermitBlink'),
} as const satisfies Record<string, PixelAnimationDefinition>;

export type PersonLook = keyof typeof PEOPLE_ANIMATIONS;
