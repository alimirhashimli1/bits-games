import * as Phaser from 'phaser';

import { createPixelCanvas, drawPixelMap, type Palette } from '@shared/pixel-art/pixelMap';
import { GLYPH_HEIGHT, GLYPH_WIDTH, GLYPHS } from '@shared/pixel-font/glyphs';

const PIXEL_FONT_KEY = 'pixel-font';

/** Each character cell has one empty column and row after the glyph, for spacing. */
const CELL_WIDTH = GLYPH_WIDTH + 1;
const CELL_HEIGHT = GLYPH_HEIGHT + 1;
const CHARS_PER_ROW = 16;

/** Glyphs are drawn white, so text can be tinted to any colour. */
const FONT_PALETTE: Palette = { '#': '#ffffff' };

/** Every character the font can draw. Lowercase letters reuse the uppercase shapes. */
const FONT_CHARACTERS = [
  ...Object.keys(GLYPHS),
  ...Object.keys(GLYPHS)
    .filter((character) => /[A-Z]/.test(character))
    .map((letter) => letter.toLowerCase()),
];

export interface PixelTextOptions {
  readonly color?: number;
  /** Whole-number size multiplier, so letters stay on the pixel grid. */
  readonly scale?: number;
}

/** Adds sharp pixel-font text. Always use this instead of `scene.add.text`. */
export function addPixelText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  { color = 0xffffff, scale = 1 }: PixelTextOptions = {},
): Phaser.GameObjects.BitmapText {
  registerPixelFont(scene);
  // RetroFont measures font size by cell *width*, so this gives an exact whole-number scale.
  return scene.add.bitmapText(x, y, PIXEL_FONT_KEY, text, CELL_WIDTH * scale).setTint(color);
}

/** Adds pixel text centred horizontally on the screen, snapped to a whole pixel. */
export function addCenteredPixelText(
  scene: Phaser.Scene,
  y: number,
  text: string,
  options: PixelTextOptions = {},
): Phaser.GameObjects.BitmapText {
  const label = addPixelText(scene, 0, y, text, options);
  return label.setX(Math.round((scene.scale.width - label.width) / 2));
}

/** Changes the text of a centred label and centres it again. */
export function setCenteredPixelText(label: Phaser.GameObjects.BitmapText, text: string): void {
  label.setText(text);
  label.setX(Math.round((label.scene.scale.width - label.width) / 2));
}

/** Draws the glyph data onto a grid texture and registers it as a bitmap font, once per game. */
function registerPixelFont(scene: Phaser.Scene): void {
  if (scene.cache.bitmapFont.exists(PIXEL_FONT_KEY)) return;

  scene.textures.addCanvas(PIXEL_FONT_KEY, drawFontSheet());
  scene.cache.bitmapFont.add(
    PIXEL_FONT_KEY,
    Phaser.GameObjects.RetroFont.Parse(scene, {
      image: PIXEL_FONT_KEY,
      width: CELL_WIDTH,
      height: CELL_HEIGHT,
      chars: FONT_CHARACTERS.join(''),
      charsPerRow: CHARS_PER_ROW,
      'spacing.x': 0,
      'spacing.y': 0,
      'offset.x': 0,
      'offset.y': 0,
      lineSpacing: 0,
    }),
  );
}

function drawFontSheet(): HTMLCanvasElement {
  const rows = Math.ceil(FONT_CHARACTERS.length / CHARS_PER_ROW);
  const context = createPixelCanvas(CHARS_PER_ROW * CELL_WIDTH, rows * CELL_HEIGHT);

  FONT_CHARACTERS.forEach((character, index) => {
    const glyph = GLYPHS[character.toUpperCase()];
    if (!glyph) return;

    const cellX = (index % CHARS_PER_ROW) * CELL_WIDTH;
    const cellY = Math.floor(index / CHARS_PER_ROW) * CELL_HEIGHT;
    drawPixelMap(context, glyph, FONT_PALETTE, cellX, cellY);
  });

  return context.canvas;
}
