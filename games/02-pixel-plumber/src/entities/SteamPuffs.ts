import * as Phaser from 'phaser';

import { STEAM } from '../config';
import { STEAM_PUFF_ANIMATIONS, STEAM_PUFF_SHEET } from '../content/sprites/powerUps';

class SteamPuff extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    readonly direction: 1 | -1,
  ) {
    super(scene, x, y, STEAM_PUFF_SHEET.key);
    scene.add.existing(this);
    this.play(STEAM_PUFF_ANIMATIONS.fly.key);
  }
}

/** Steam Rusty's puffs: they fly straight ahead, bounce along the ground and burst against walls. */
export class SteamPuffs {
  private readonly group: Phaser.Physics.Arcade.Group;

  constructor(
    private readonly scene: Phaser.Scene,
    layer: Phaser.Tilemaps.TilemapLayer,
  ) {
    this.group = scene.physics.add.group();
    scene.physics.add.collider(this.group, layer);
  }

  /** Fires a puff from Rusty's feet at (`feetX`, `feetY`), unless too many are already out. True if it fired. */
  fire(feetX: number, feetY: number, direction: 1 | -1): boolean {
    if (this.group.countActive() >= STEAM.maxPuffs) return false;
    const puff = new SteamPuff(this.scene, feetX + direction * STEAM.spawnAhead, feetY - STEAM.spawnHeight, direction);
    // Adding to the group creates the body and applies the group's defaults, so movement is set afterwards.
    this.group.add(puff);
    puff.body.setSize(STEAM.bodySize, STEAM.bodySize, true);
    puff.body.setVelocityX(direction * STEAM.speed);
    return true;
  }

  /** Puffs burst against anything in `targets`, and `onHit` says what that does to it. */
  burstAgainst(targets: Phaser.Physics.Arcade.Group, onHit: (target: Phaser.GameObjects.GameObject) => void): void {
    this.scene.physics.add.overlap(this.group, targets, (puff, target) => {
      if (!(puff instanceof SteamPuff)) return;
      this.burst(puff);
      onHit(target as Phaser.GameObjects.GameObject);
    });
  }

  /** Call once per frame after physics. Puffs that leave the screen are removed. */
  update(camera: Phaser.Cameras.Scene2D.Camera): void {
    for (const child of this.group.getChildren()) {
      if (!(child instanceof SteamPuff)) continue;
      const { blocked, velocity } = child.body;
      if (blocked.left || blocked.right) {
        this.burst(child);
      } else if (!Phaser.Geom.Rectangle.Overlaps(camera.worldView, child.getBounds())) {
        child.destroy();
      } else {
        // Landing stops the body, so the puff gets its speed back and bounces.
        velocity.x = child.direction * STEAM.speed;
        if (blocked.down) velocity.y = -STEAM.bounceSpeed;
      }
    }
  }

  private burst(puff: SteamPuff): void {
    const burst = this.scene.add.sprite(puff.x, puff.y, STEAM_PUFF_SHEET.key).play(STEAM_PUFF_ANIMATIONS.burst.key);
    this.scene.time.delayedCall(STEAM.burstMs, () => burst.destroy());
    puff.destroy();
  }
}
