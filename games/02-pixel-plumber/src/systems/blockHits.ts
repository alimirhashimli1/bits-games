import * as Phaser from 'phaser';

import { BLOCKS, LEVEL } from '../config';
import type { BlockKind } from '../content/levels/tileLegend';
import { bumpTile } from '../entities/effects/blockBump';
import { burstBrick } from '../entities/effects/brickDebris';
import { popCoin } from '../entities/effects/coinPop';
import { cellKey, tileIndex, type HiddenBlock, type LoadedLevel } from './levelLoader';

/** The parts of Rusty's body that hitting blocks needs. */
export interface HeadBody {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly center: { readonly x: number };
  readonly velocity: { y: number };
}

/** What a block can give besides coins. A power-up turns into a Gear or a Steam Valve depending on Rusty's size. */
export type BlockItem = 'powerUp' | 'goldenGasket' | 'wrench';

/** What the level does when a block pays out. `tile` is the block the reward comes out of. */
export interface BlockRewards {
  coin(): void;
  item(item: BlockItem, tile: Phaser.Tilemaps.Tile): void;
  /** Big Rusty broke a brick: worth a few points. */
  brokeBrick(): void;
}

interface MultiCoinState {
  coinsGiven: number;
  firstHitMs: number;
}

const USED_TILE = tileIndex('used');

/**
 * Everything that happens when Rusty's head hits a block from below: coins, bumps,
 * breaking bricks and revealing hidden blocks.
 */
export class BlockHits {
  private readonly blocks: Map<string, BlockKind>;
  private readonly hiddenBlocks: Map<string, HiddenBlock>;
  private readonly multiCoin = new Map<string, MultiCoinState>();
  /** Tiles Rusty's head was pushed back by during this frame's physics. */
  private headHits: Phaser.Tilemaps.Tile[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly level: LoadedLevel,
    private readonly rewards: BlockRewards,
  ) {
    this.blocks = new Map(level.blocks);
    this.hiddenBlocks = new Map(level.hiddenBlocks.map((cell) => [cellKey(cell.column, cell.row), cell]));
  }

  /** Collider callback: remembers solid tiles that stopped Rusty from moving up. */
  recordCollision(body: HeadBody, blockedUp: boolean, tile: Phaser.Tilemaps.Tile): void {
    if (blockedUp && tile.pixelY + tile.height <= body.top + 1) this.headHits.push(tile);
  }

  /**
   * Call once per frame after physics. Hidden blocks are checked first: they are not solid, so
   * physics lets Rusty straight into them, and they have to push him back out themselves.
   * `previousTop` is where the top of his body was on the previous frame.
   */
  update(body: HeadBody, previousTop: number, isBig: boolean, onPushedDown: (distance: number) => void): void {
    const hidden = this.hiddenBlockHit(body, previousTop);
    if (hidden) {
      const blockBottom = (hidden.row + 1) * LEVEL.tileSize;
      onPushedDown(blockBottom - body.top);
      body.velocity.y = 0;
      this.hiddenBlocks.delete(cellKey(hidden.column, hidden.row));
      const tile = this.putUsedBlock(hidden.column, hidden.row);
      if (hidden.reward === 'coin') this.payCoin(tile);
      else this.rewards.item(hidden.reward, tile);
      bumpTile(this.scene, tile);
      this.headHits = [];
      return;
    }

    // When his head touches two blocks at once, only the one nearest his middle counts.
    const nearest = this.headHits.reduce<Phaser.Tilemaps.Tile | undefined>(
      (best, tile) =>
        !best || Math.abs(tile.getCenterX() - body.center.x) < Math.abs(best.getCenterX() - body.center.x)
          ? tile
          : best,
      undefined,
    );
    this.headHits = [];
    if (nearest) this.hitBlock(nearest, isBig);
  }

  private hiddenBlockHit(body: HeadBody, previousTop: number): HiddenBlock | undefined {
    for (const cell of this.hiddenBlocks.values()) {
      const left = cell.column * LEVEL.tileSize;
      const bottom = (cell.row + 1) * LEVEL.tileSize;
      const overlapsSideways = body.right > left && body.left < left + LEVEL.tileSize;
      // Only from below: the top of his head has to have crossed the block's bottom edge this frame.
      if (overlapsSideways && previousTop >= bottom && body.top < bottom) return cell;
    }
    return undefined;
  }

  private hitBlock(tile: Phaser.Tilemaps.Tile, isBig: boolean): void {
    const key = cellKey(tile.x, tile.y);
    const kind = this.blocks.get(key);
    if (!kind) return;

    switch (kind) {
      case 'coinBlock':
        this.payCoin(this.useUp(key, tile));
        return;
      case 'powerUpBlock':
        this.rewards.item('powerUp', this.useUp(key, tile));
        return;
      case 'gasketBrick':
        this.rewards.item('goldenGasket', this.useUp(key, tile));
        return;
      case 'brick':
        if (isBig) {
          this.blocks.delete(key);
          this.level.layer.removeTileAt(tile.x, tile.y);
          burstBrick(this.scene, tile.getCenterX(), tile.getCenterY());
          this.rewards.brokeBrick();
        } else {
          bumpTile(this.scene, tile);
        }
        return;
      case 'multiCoinBrick':
        this.hitMultiCoinBrick(key, tile);
        return;
    }
  }

  /** Turns a block into a used block and bumps it. Returns the used tile. */
  private useUp(key: string, tile: Phaser.Tilemaps.Tile): Phaser.Tilemaps.Tile {
    this.blocks.delete(key);
    const used = this.putUsedBlock(tile.x, tile.y);
    bumpTile(this.scene, used);
    return used;
  }

  /** Pays a coin on every hit, until it has paid the most it can or its time window has closed. */
  private hitMultiCoinBrick(key: string, tile: Phaser.Tilemaps.Tile): void {
    const now = this.scene.time.now;
    const state = this.multiCoin.get(key) ?? { coinsGiven: 0, firstHitMs: now };
    state.coinsGiven += 1;
    this.multiCoin.set(key, state);

    const lastCoin = state.coinsGiven >= BLOCKS.multiCoinMax || now - state.firstHitMs >= BLOCKS.multiCoinWindowMs;
    let bumped = tile;
    if (lastCoin) {
      this.blocks.delete(key);
      this.multiCoin.delete(key);
      bumped = this.putUsedBlock(tile.x, tile.y);
    }
    this.payCoin(bumped);
    bumpTile(this.scene, bumped);
  }

  /**
   * Puts a used block in a cell. A placed tile comes with collision faces on every side, which
   * would stop Rusty walking across a row of blocks at its edge, so the faces are worked out again.
   */
  private putUsedBlock(column: number, row: number): Phaser.Tilemaps.Tile {
    const tile = this.level.layer.putTileAt(USED_TILE, column, row);
    this.level.tilemap.calculateFacesAt(column, row, this.level.layer);
    return tile;
  }

  private payCoin(tile: Phaser.Tilemaps.Tile): void {
    popCoin(this.scene, tile.getCenterX(), tile.pixelY);
    this.rewards.coin();
  }
}
