import type { SpriteAssets } from '@shared/phaser/pixelSprites';

import type { ArenaDefinition, ArenaLayer } from '../arenas/arenaTypes';

export type CrowdMood = 'idle' | 'cheer';

/** Standing about is slow and easy; cheering is quick. Frames per second. */
const CROWD_FRAME_RATES: Readonly<Record<CrowdMood, number>> = { idle: 2, cheer: 6 };
const DEFAULT_LAYER_FRAME_RATE = 4;

export function arenaLayerKey(arena: ArenaDefinition, layer: ArenaLayer): string {
  return `${arena.id}-${layer.name}`;
}

export function arenaLayerAnimationKey(arena: ArenaDefinition, layer: ArenaLayer): string {
  return `${arenaLayerKey(arena, layer)}-loop`;
}

export function crowdSheetKey(arena: ArenaDefinition): string {
  return `${arena.id}-crowd`;
}

export function crowdAnimationKey(arena: ArenaDefinition, person: number, mood: CrowdMood): string {
  return `${crowdSheetKey(arena)}-${person}-${mood}`;
}

/**
 * An arena's sprite sheets: one per layer (its frames loop if it has several), and one for the
 * crowd, with an idle and a cheering animation for each kind of person.
 */
export function createArenaSprites(arena: ArenaDefinition): SpriteAssets[] {
  const layers = arena.layers.map((layer): SpriteAssets => {
    const key = arenaLayerKey(arena, layer);
    const frames = layer.frames.map((_, index) => `frame${index}`);
    return {
      sheet: { key, palette: arena.palette, frames: Object.fromEntries(layer.frames.map((map, index) => [`frame${index}`, map])) },
      animations:
        frames.length > 1
          ? [{ key: arenaLayerAnimationKey(arena, layer), frames, frameRate: layer.frameRate ?? DEFAULT_LAYER_FRAME_RATE, repeat: -1 }]
          : [],
    };
  });

  const crowdFrames = arena.crowd.people.flatMap((person, index) => [
    [`${index}-idle0`, person.idle[0]],
    [`${index}-idle1`, person.idle[1]],
    [`${index}-cheer0`, person.cheer[0]],
    [`${index}-cheer1`, person.cheer[1]],
  ]);
  const moods: readonly CrowdMood[] = ['idle', 'cheer'];
  const crowd: SpriteAssets = {
    sheet: { key: crowdSheetKey(arena), palette: arena.palette, frames: Object.fromEntries(crowdFrames) },
    animations: arena.crowd.people.flatMap((_, index) =>
      moods.map((mood) => ({
        key: crowdAnimationKey(arena, index, mood),
        frames: [`${index}-${mood}0`, `${index}-${mood}1`],
        frameRate: CROWD_FRAME_RATES[mood],
        repeat: -1,
      })),
    ),
  };
  return [...layers, crowd];
}
