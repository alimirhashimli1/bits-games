import { SCENERY_SPRITES, type SceneryKind } from '../../content/sprites/scenery';
import { mirrorPixelMap, renderPixelSprite } from './pixelSprites';

export type SceneryImages = Readonly<Record<SceneryKind, HTMLCanvasElement>>;

/** Draws every kind of scenery once, ready to be scaled onto the road each frame. */
export function createSceneryImages(): SceneryImages {
  const draw = (kind: SceneryKind): HTMLCanvasElement => {
    const { map, palette, mirrored } = SCENERY_SPRITES[kind];
    return renderPixelSprite(mirrored ? mirrorPixelMap(map) : map, palette, kind);
  };
  return {
    palm: draw('palm'),
    rock: draw('rock'),
    bush: draw('bush'),
    hut: draw('hut'),
    signLeft: draw('signLeft'),
    signRight: draw('signRight'),
    scrub: draw('scrub'),
    redRock: draw('redRock'),
    cliff: draw('cliff'),
    cactus: draw('cactus'),
    pine: draw('pine'),
    cabin: draw('cabin'),
    lamp: draw('lamp'),
    neonLamp: draw('neonLamp'),
    bollard: draw('bollard'),
    crates: draw('crates'),
    warehouse: draw('warehouse'),
    tower: draw('tower'),
    neonSign: draw('neonSign'),
    hedge: draw('hedge'),
    forkSign: draw('forkSign'),
  };
}
