import type { PixelMap } from '@shared/pixel-art/pixelMap';

/**
 * Wren is drawn from parts: a 7-row head, a 5-row torso and 4 rows of legs make one 16×16
 * frame. The front view is used facing down, the back view facing up, and the side view
 * faces right (left is the same, mirrored).
 *
 * Symbols: k outline, h / H hair and its highlight, s / S skin and its shade, t / T tunic and
 * its dark, y amber scarf and belt, b leather boots.
 */

export const HEADS = {
  front: [
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khHhhhhHhk...',
    '...khsssssshk...',
    '...khsksskshk...',
    '....kssssssk....',
    '.....kyyyyk.....',
  ],
  /** Eyes squeezed shut. */
  frontHurt: [
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khHhhhhHhk...',
    '...khsssssshk...',
    '...khsSssSshk...',
    '....kssssssk....',
    '.....kyyyyk.....',
  ],
  /** Her ponytail hangs down between the ends of her scarf. */
  back: [
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khHhhhhHhk...',
    '...khhhhhhhhk...',
    '...khhhhhhhhk...',
    '....khhHHhhk....',
    '.....kyhhyk.....',
  ],
  side: [
    '....kkkkkk......',
    '...khhhhhhk.....',
    '..khHhhhhhhk....',
    '..khhhhhsssk....',
    '.khhhhhhsksk....',
    'khhk.kssssk.....',
    '.kk...kyyyk.....',
  ],
} as const satisfies Record<string, PixelMap>;

export const TORSOS = {
  /** Arms at her sides, hands by her belt. Seen from the back it looks the same. */
  front: [
    '...ktyyyyyytk...',
    '..kTttttttttTk..',
    '..kTttttttttTk..',
    '..ksTyyyyyyTsk..',
    '...kttttttttk...',
  ],
  /** Both hands together in front of her belt, holding the sword's grip. */
  frontThrust: [
    '...ktyyyyyytk...',
    '...kttttttttk...',
    '...kttksskttk...',
    '...ktyykkyytk...',
    '...kttttttttk...',
  ],
  /** Arms held forward, out of sight in front of her. */
  backThrust: [
    '...ktyyyyyytk...',
    '...kttttttttk...',
    '...kTttttttTk...',
    '...ktyyyyyytk...',
    '...kttttttttk...',
  ],
  side: [
    '.....ktyyytk....',
    '.....kttTttk....',
    '.....kttTttk....',
    '.....kyyTsyk....',
    '.....kttttk.....',
  ],
  /** Her arm reaches out to the right edge of the frame. */
  sideThrust: [
    '.....ktyyytk....',
    '.....ktttttsssk.',
    '.....kttTtkkkk..',
    '.....kyyTyk.....',
    '.....kttttk.....',
  ],
  /** Shoulders raised: her arms go up past her head, and are added on top of the frame. */
  armsUp: [
    '..kttyyyyyyttk..',
    '...kttttttttk...',
    '...kTttttttTk...',
    '...ktyyyyyytk...',
    '...kttttttttk...',
  ],
  /** Arms flung out to the sides. */
  flinch: [
    '...ktyyyyyytk...',
    '.kTTttttttttTTk.',
    '.ks.kttttttk.sk.',
    '...ktyyyyyytk...',
    '...kttttttttk...',
  ],
} as const satisfies Record<string, PixelMap>;

export const LEGS = {
  frontStand: [
    '....kTttttTk....',
    '....kbbkkbbk....',
    '....kbbkkbbk....',
    '....kkk..kkk....',
  ],
  /** Her left foot lifted. The other step is this, mirrored. */
  frontStep: [
    '....kTttttTk....',
    '....kbbkkbbk....',
    '....kkkkkbbk....',
    '.........kkk....',
  ],
  sideStand: [
    '.....kTtttk.....',
    '......kbbk......',
    '......kbbk......',
    '......kbbbk.....',
  ],
  sideStep: [
    '.....kTtttk.....',
    '.....kbkkbk.....',
    '....kbk..kbk....',
    '....kk....kbk...',
  ],
} as const satisfies Record<string, PixelMap>;

/** One 16×16 frame: head on top of torso on top of legs. */
export function stack(head: PixelMap, torso: PixelMap, legs: PixelMap): PixelMap {
  return [...head, ...torso, ...legs];
}
