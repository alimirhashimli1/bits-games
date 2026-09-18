import type * as Phaser from 'phaser';

import { LEVEL, PLATFORMS } from '../config';
import { PLATFORM_SHEET } from '../content/sprites/platforms';
import type { PlatformTrack } from '../systems/platformTracks';
import type { Rusty } from './Rusty';

const MS_PER_SECOND = 1000;
const WIDTH = PLATFORMS.widthTiles * LEVEL.tileSize;

/** One girder riding back and forth along its track at a steady speed, waiting a moment at each end. */
class MovingPlatform {
  private readonly image: Phaser.GameObjects.Image;
  private readonly startLeft: number;
  private readonly startTop: number;
  /** How far it rides, in pixels, and which way. */
  private readonly span: number;
  private readonly stepX: number;
  private readonly stepY: number;
  /** How far along the track it is, which way it is going, and how long it still waits at an end. */
  private along = 0;
  private direction: 1 | -1 = 1;
  private restMs = PLATFORMS.restMs;
  left: number;
  top: number;
  previousLeft: number;
  previousTop: number;

  constructor(scene: Phaser.Scene, { motion, start, travel }: PlatformTrack) {
    this.startLeft = start.column * LEVEL.tileSize;
    this.startTop = start.row * LEVEL.tileSize;
    this.span = travel * LEVEL.tileSize;
    [this.stepX, this.stepY] = motion === 'sideways' ? [1, 0] : [0, 1];
    this.left = this.previousLeft = this.startLeft;
    this.top = this.previousTop = this.startTop;
    this.image = scene.add.image(this.left, this.top, PLATFORM_SHEET.key).setOrigin(0, 0);
  }

  update(deltaMs: number): void {
    this.previousLeft = this.left;
    this.previousTop = this.top;
    if (this.restMs > 0) {
      this.restMs -= deltaMs;
      return;
    }
    this.along += (this.direction * PLATFORMS.speed * deltaMs) / MS_PER_SECOND;
    // At either end it stops, waits, and comes back the other way.
    if (this.along >= this.span || this.along <= 0) {
      this.along = Math.min(Math.max(this.along, 0), this.span);
      this.direction = this.direction === 1 ? -1 : 1;
      this.restMs = PLATFORMS.restMs;
    }
    this.left = this.startLeft + this.along * this.stepX;
    this.top = this.startTop + this.along * this.stepY;
    this.image.setPosition(this.left, this.top);
  }

  /**
   * True when feet that were on or above the platform last frame are on it now or have just
   * come down through its top. Only from above: Rusty can jump up through one from below.
   */
  holds(body: Phaser.Physics.Arcade.Body, previousFeetY: number): boolean {
    if (body.velocity.y < 0) return false;
    if (body.right <= this.left || body.left >= this.left + WIDTH) return false;
    return previousFeetY <= this.previousTop + PLATFORMS.footing && body.bottom >= this.top - PLATFORMS.footing;
  }
}

/**
 * The level's moving platforms. They are not physics bodies: each frame they move along their
 * tracks, and Rusty, when he stands on one, is carried along by hand, which keeps his feet
 * exactly on the girder whichever way it is going.
 */
export class MovingPlatforms {
  private readonly platforms: MovingPlatform[];

  constructor(scene: Phaser.Scene, tracks: readonly PlatformTrack[]) {
    this.platforms = tracks.map((track) => new MovingPlatform(scene, track));
  }

  update(deltaMs: number): void {
    for (const platform of this.platforms) platform.update(deltaMs);
  }

  /**
   * Puts Rusty's feet on the platform he is standing on, and moves him the way it moved.
   * `previousFeetY` is where his feet were last frame. True while he stands on one, so that
   * he counts as being on the ground.
   *
   * Call before the physics step, together with `update`. The sprite is moved and the body
   * follows it, which is how Arcade expects a position to be set between steps.
   */
  carry(rusty: Rusty, previousFeetY: number): boolean {
    const platform = this.platforms.find((each) => each.holds(rusty.body, previousFeetY));
    if (!platform) return false;
    // His origin is at his feet.
    rusty.x += platform.left - platform.previousLeft;
    rusty.y = platform.top;
    rusty.body.velocity.y = 0;
    rusty.body.updateFromGameObject();
    return true;
  }
}
