import type { Palette } from '@shared/pixel-art/pixelMap';

/**
 * The alternate colours a fighter wears when both players pick them, worked out from their own
 * palette rather than drawn by hand, so every fighter has a second outfit and so will any fighter
 * added later.
 *
 * Every colour is turned round the colour wheel by the same amount, keeping how light and how
 * strong it is. That matters: a palette's shade colours stay darker than the colours they shade,
 * so the figure still reads with the same shape and the same folds, only in another colour.
 *
 * Two kinds of colour are left alone, because changing them would break the drawing rather than
 * recolour it: the near-black of an outline or an eye, and the near-white of a highlight. A
 * colour that is almost grey has no hue worth turning, so it is given a little of the new one
 * instead, which is what keeps a fighter in white or grey from coming back looking the same.
 */
const HUE_SHIFT_DEGREES = 140;
/**
 * Skin is left out of it: an alternate outfit should not make a fighter a different person, and
 * a mint-green face reads as a mistake rather than a second costume. Every fighter's head sprite
 * paints the face with `s` and its shade with `S`, which is also what the body gives bare arms
 * and, for Knox, a bare chest, so leaving these two alone keeps all of it the right colour.
 */
const SKIN_SYMBOLS: readonly string[] = ['s', 'S'];
/** Below this much colour, a shade counts as grey and is tinted rather than turned. */
const GREY_SATURATION = 0.15;
/** How much colour a tinted grey is given. */
const TINT_SATURATION = 0.22;
/** Darker than this, or lighter than this, a colour is left exactly as it was. */
const KEEP_BELOW_LIGHTNESS = 0.12;
const KEEP_ABOVE_LIGHTNESS = 0.92;

export function altPalette(palette: Palette): Palette {
  return Object.fromEntries(
    Object.entries(palette).map(([symbol, color]) => [symbol, SKIN_SYMBOLS.includes(symbol) ? color : shiftColor(color)]),
  );
}

function shiftColor(color: string): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  const [hue, saturation, lightness] = rgbToHsl(rgb);
  if (lightness <= KEEP_BELOW_LIGHTNESS || lightness >= KEEP_ABOVE_LIGHTNESS) return color;
  const turned = (hue + HUE_SHIFT_DEGREES / 360) % 1;
  const grey = saturation < GREY_SATURATION;
  return rgbToHex(hslToRgb([turned, grey ? TINT_SATURATION : saturation, lightness]));
}

type Rgb = readonly [number, number, number];
/** Hue, saturation and lightness, each from 0 to 1. */
type Hsl = readonly [number, number, number];

function hexToRgb(color: string): Rgb | null {
  const match = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (!match?.[1]) return null;
  const value = Number.parseInt(match[1], 16);
  return [((value >> 16) & 0xff) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255];
}

function rgbToHex([red, green, blue]: Rgb): string {
  const channel = (value: number): string =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(red)}${channel(green)}${channel(blue)}`;
}

function rgbToHsl([red, green, blue]: Rgb): Hsl {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const span = max - min;
  if (span === 0) return [0, 0, lightness];

  const saturation = span / (1 - Math.abs(2 * lightness - 1));
  const hue =
    max === red
      ? ((green - blue) / span + (green < blue ? 6 : 0)) / 6
      : max === green
        ? ((blue - red) / span + 2) / 6
        : ((red - green) / span + 4) / 6;
  return [hue, saturation, lightness];
}

function hslToRgb([hue, saturation, lightness]: Hsl): Rgb {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs(((hue * 6) % 2) - 1));
  const lift = lightness - chroma / 2;
  const sixth = Math.floor(hue * 6) % 6;
  const parts: readonly Rgb[] = [
    [chroma, second, 0],
    [second, chroma, 0],
    [0, chroma, second],
    [0, second, chroma],
    [second, 0, chroma],
    [chroma, 0, second],
  ];
  const [red, green, blue] = parts[sixth] ?? [0, 0, 0];
  return [red + lift, green + lift, blue + lift];
}
