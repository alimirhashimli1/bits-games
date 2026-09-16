import type * as Phaser from 'phaser';

import { createPixelCanvas, drawPixelMap, measurePixelMap, type Palette, type PixelMap } from '@shared/pixel-art/pixelMap';

export interface SpriteSheetDefinition {
  /** Texture key, e.g. 'torch'. */
  readonly key: string;
  readonly palette: Palette;
  /** Frames by name. All frames in one sheet must be the same size. */
  readonly frames: Readonly<Record<string, PixelMap>>;
}

export interface PixelAnimationDefinition {
  /** Animation key, e.g. 'torch-burn'. Animation keys are shared by the whole game. */
  readonly key: string;
  /** Frame names from the sprite sheet, in playback order. */
  readonly frames: readonly string[];
  readonly frameRate: number;
  /** How many extra times to play. -1 loops forever. */
  readonly repeat?: number;
}

export interface SpriteAssets {
  readonly sheet: SpriteSheetDefinition;
  readonly animations: readonly PixelAnimationDefinition[];
}

/** Turns pixel-map sprite sheets into Phaser textures and animations. Safe to call more than once. */
export function registerSprites(scene: Phaser.Scene, sprites: readonly SpriteAssets[]): void {
  for (const { sheet, animations } of sprites) {
    registerSpriteSheet(scene, sheet);
    registerAnimations(scene, sheet.key, animations);
  }
}

/** Draws all frames side by side into one texture and names each frame. */
function registerSpriteSheet(scene: Phaser.Scene, { key, palette, frames }: SpriteSheetDefinition): void {
  if (scene.textures.exists(key)) return;

  const entries = Object.entries(frames);
  const [firstName, firstMap] = entries[0] ?? [];
  if (!firstName || !firstMap) throw new Error(`Sprite sheet "${key}" has no frames.`);
  const { width, height } = measurePixelMap(firstMap, `${key}.${firstName}`);

  const context = createPixelCanvas(width * entries.length, height);
  entries.forEach(([name, map], index) => {
    const size = measurePixelMap(map, `${key}.${name}`);
    if (size.width !== width || size.height !== height) {
      throw new Error(`Frame "${key}.${name}" is ${size.width}x${size.height}, expected ${width}x${height}.`);
    }
    drawPixelMap(context, map, palette, index * width, 0);
  });

  const texture = scene.textures.addCanvas(key, context.canvas);
  if (!texture) throw new Error(`Could not create texture "${key}".`);
  entries.forEach(([name], index) => texture.add(name, 0, index * width, 0, width, height));
}

function registerAnimations(
  scene: Phaser.Scene,
  textureKey: string,
  animations: readonly PixelAnimationDefinition[],
): void {
  const texture = scene.textures.get(textureKey);

  for (const { key, frames, frameRate, repeat = 0 } of animations) {
    if (scene.anims.exists(key)) continue;

    const missingFrame = frames.find((frame) => !texture.has(frame));
    if (missingFrame) throw new Error(`Animation "${key}" uses unknown frame "${textureKey}.${missingFrame}".`);

    scene.anims.create({
      key,
      frameRate,
      repeat,
      frames: frames.map((frame) => ({ key: textureKey, frame })),
    });
  }
}
