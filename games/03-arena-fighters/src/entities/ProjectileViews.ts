import type * as Phaser from 'phaser';

import { STAGE } from '../config';
import { fighterData } from '../content/fighters/fighterData';
import { projectileAnimationKey } from '../content/sprites/projectiles';
import { toPixels, type FightState, type ProjectileState } from '../systems/sim/fightState';

/**
 * Draws the projectiles in flight. Sprites are kept and reused rather than made for each throw,
 * and any not needed this frame are hidden.
 */
export class ProjectileViews {
  private readonly scene: Phaser.Scene;
  private readonly sprites: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  draw(state: FightState): void {
    state.projectiles.forEach((projectile, index) => {
      const key = spriteKey(state, projectile);
      const sprite = this.sprites[index] ?? this.addSprite(key);
      sprite
        .setVisible(true)
        .setPosition(toPixels(projectile.x), STAGE.floorY - toPixels(projectile.y))
        .setFlipX(projectile.vx < 0)
        .play(projectileAnimationKey(key), true);
    });
    this.sprites.slice(state.projectiles.length).forEach((sprite) => sprite.setVisible(false));
  }

  private addSprite(key: string): Phaser.GameObjects.Sprite {
    const sprite = this.scene.add.sprite(0, 0, key);
    this.sprites.push(sprite);
    return sprite;
  }
}

/** The sprite sheet of a projectile, from its owner's special move. */
function spriteKey(state: FightState, projectile: ProjectileState): string {
  const owner = state.fighters[projectile.owner];
  const special = fighterData(owner.character).specials.find((candidate) => candidate.name === projectile.special);
  return special?.behaviour.kind === 'projectile' ? special.behaviour.sprite : '';
}
