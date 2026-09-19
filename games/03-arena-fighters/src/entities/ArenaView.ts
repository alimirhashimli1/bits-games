import type * as Phaser from 'phaser';

import { SCREEN } from '../config';
import type { ArenaDefinition, ArenaLayer } from '../content/arenas/arenaTypes';
import {
  arenaLayerAnimationKey,
  arenaLayerKey,
  crowdAnimationKey,
  crowdSheetKey,
  type CrowdMood,
} from '../content/sprites/arenaSprites';
import type { FightState } from '../systems/sim/fightState';

/** Everything in the arena is drawn behind the fighters, back to front from this depth up. */
const BACK_DEPTH = -100;
/** People in the crowd start their idle loop at different moments, so they do not bob in step. */
const IDLE_STAGGER_MS = 137;
const IDLE_STAGGER_SPREAD_MS = 1000;

/**
 * Draws an arena behind the fight: the sky, the scrolling layers (Phaser's scroll factor gives
 * each its own depth), and the crowd, who cheer when a round is won.
 */
export class ArenaView {
  private readonly arena: ArenaDefinition;
  private readonly crowd: Phaser.GameObjects.Sprite[] = [];
  private mood: CrowdMood = 'idle';
  private depth = BACK_DEPTH;

  constructor(scene: Phaser.Scene, arena: ArenaDefinition) {
    this.arena = arena;
    this.drawSky(scene);
    arena.layers.filter((layer) => !layer.inFrontOfCrowd).forEach((layer) => this.addLayer(scene, layer));
    this.addCrowd(scene);
    arena.layers.filter((layer) => layer.inFrontOfCrowd).forEach((layer) => this.addLayer(scene, layer));
  }

  /** Call once per frame. The crowd cheers from the KO (or the bell) until the next round starts. */
  update(state: FightState): void {
    const { phase } = state.round;
    const mood: CrowdMood = phase === 'ko' || phase === 'timeUp' || phase === 'result' || phase === 'matchOver' ? 'cheer' : 'idle';
    if (mood === this.mood) return;
    this.mood = mood;
    this.crowd.forEach((sprite, index) => this.playCrowd(sprite, index));
  }

  /** Flat bands of colour from the top of the screen down to the horizon, fixed in place. */
  private drawSky(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics().setScrollFactor(0).setDepth(this.nextDepth());
    const { sky, horizonY } = this.arena;
    sky.forEach((color, index) => {
      const top = Math.round((horizonY * index) / sky.length);
      const bottom = Math.round((horizonY * (index + 1)) / sky.length);
      graphics.fillStyle(Number.parseInt(color.slice(1), 16)).fillRect(0, top, SCREEN.width, bottom - top);
    });
  }

  private addLayer(scene: Phaser.Scene, layer: ArenaLayer): void {
    const sprite = scene.add
      .sprite(0, layer.top, arenaLayerKey(this.arena, layer), 'frame0')
      .setOrigin(0, 0)
      .setScrollFactor(layer.scroll, 0)
      .setDepth(this.nextDepth());
    if (layer.frames.length > 1) sprite.play(arenaLayerAnimationKey(this.arena, layer));
  }

  private addCrowd(scene: Phaser.Scene): void {
    const { crowd } = this.arena;
    const depth = this.nextDepth();
    crowd.spots.forEach((x, index) => {
      const sprite = scene.add
        .sprite(x, crowd.footY, crowdSheetKey(this.arena), '0-idle0')
        .setOrigin(0.5, 1)
        .setScrollFactor(crowd.scroll, 0)
        .setDepth(depth);
      this.crowd.push(sprite);
      this.playCrowd(sprite, index);
    });
  }

  private playCrowd(sprite: Phaser.GameObjects.Sprite, index: number): void {
    const person = index % this.arena.crowd.people.length;
    sprite.play({
      key: crowdAnimationKey(this.arena, person, this.mood),
      startFrame: index % 2,
      delay: this.mood === 'idle' ? (index * IDLE_STAGGER_MS) % IDLE_STAGGER_SPREAD_MS : 0,
    });
  }

  private nextDepth(): number {
    this.depth += 1;
    return this.depth;
  }
}
