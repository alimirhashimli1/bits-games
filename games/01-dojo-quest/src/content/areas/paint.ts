import * as Phaser from 'phaser';

import { ARENA, SCREEN } from '../../config';

type Graphics = Phaser.GameObjects.Graphics;
export type Point = readonly [x: number, y: number];

/** Size of one brick in brick walls, in pixels. */
const BRICK_WIDTH = 16;
const BRICK_HEIGHT = 8;
const PILLAR_SHADE_WIDTH = 3;
const PILLAR_CAP_HEIGHT = 3;

export function rect(g: Graphics, color: number, x: number, y: number, width: number, height: number): void {
  g.fillStyle(color).fillRect(x, y, width, height);
}

/** Single pixels, e.g. stars. */
export function dots(g: Graphics, color: number, points: readonly Point[]): void {
  points.forEach(([x, y]) => rect(g, color, x, y, 1, 1));
}

export function circle(g: Graphics, color: number, [x, y]: Point, radius: number): void {
  g.fillStyle(color).fillCircle(x, y, radius);
}

/** A filled shape through the given corner points, e.g. a mountain range. */
export function polygon(g: Graphics, color: number, points: readonly Point[]): void {
  g.fillStyle(color).fillPoints(
    points.map(([x, y]) => new Phaser.Math.Vector2(x, y)),
    true,
  );
}

/** Full-width horizontal colour bands from `top` to `bottom`, e.g. a sky that lightens towards the horizon. */
export function bands(g: Graphics, colors: readonly number[], top: number, bottom: number): void {
  const bandHeight = Math.ceil((bottom - top) / colors.length);
  colors.forEach((color, index) => rect(g, color, 0, top + index * bandHeight, SCREEN.width, bandHeight));
}

export interface BrickWall {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly color: number;
  readonly mortar: number;
}

/** A wall of staggered bricks. */
export function brickWall(g: Graphics, { left, top, width, height, color, mortar }: BrickWall): void {
  rect(g, color, left, top, width, height);
  for (let row = 0; row * BRICK_HEIGHT < height; row++) {
    const rowTop = top + row * BRICK_HEIGHT;
    rect(g, mortar, left, rowTop, width, 1);
    const offset = row % 2 === 0 ? 0 : BRICK_WIDTH / 2;
    for (let x = left + offset; x < left + width; x += BRICK_WIDTH) {
      rect(g, mortar, x, rowTop, 1, Math.min(BRICK_HEIGHT, top + height - rowTop));
    }
  }
}

/** The square "teeth" along the top of a castle wall. */
export function battlements(g: Graphics, color: number, top: number, toothWidth: number, toothHeight: number): void {
  for (let x = 0; x < SCREEN.width; x += toothWidth * 2) {
    rect(g, color, x, top, toothWidth, toothHeight);
  }
}

export interface Pillar {
  readonly x: number;
  readonly width: number;
  readonly top: number;
  readonly bottom: number;
  readonly color: number;
  readonly shade: number;
}

/** A pillar with a shaded side and a slightly wider cap and base. */
export function pillar(g: Graphics, { x, width, top, bottom, color, shade }: Pillar): void {
  rect(g, color, x, top, width, bottom - top);
  rect(g, shade, x + width - PILLAR_SHADE_WIDTH, top, PILLAR_SHADE_WIDTH, bottom - top);
  rect(g, color, x - 2, top, width + 4, PILLAR_CAP_HEIGHT);
  rect(g, color, x - 2, bottom - PILLAR_CAP_HEIGHT, width + 4, PILLAR_CAP_HEIGHT);
}

export interface Banner {
  readonly x: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly color: number;
  readonly trim: number;
}

/** A hanging cloth banner with a coloured border. */
export function banner(g: Graphics, { x, top, width, height, color, trim }: Banner): void {
  rect(g, trim, x, top, width, height);
  rect(g, color, x + 1, top, width - 2, height - 1);
  rect(g, trim, x + Math.floor(width / 2) - 2, top + Math.floor(height / 3), 4, 4);
}

/**
 * The ground from the floor line down to the bottom of the screen. Scenes without
 * fighting (the opening scene) can pass a lower line to leave more room for the picture.
 */
export function floor(g: Graphics, color: number, edge: number, top: number = ARENA.groundY): void {
  rect(g, color, 0, top, SCREEN.width, SCREEN.height - top);
  rect(g, edge, 0, top, SCREEN.width, 1);
}
