import * as Phaser from 'phaser';

export interface TileLayerOptions {
  /** Rows of tile indices, as positions in the tile sheet. -1 leaves a cell empty. */
  readonly data: number[][];
  /** The tile sheet's texture: square tiles side by side, in index order. */
  readonly textureKey: string;
  readonly tileSize: number;
  /** Tile indices that collide. */
  readonly solidIndices: readonly number[];
}

export interface TileLayer {
  readonly tilemap: Phaser.Tilemaps.Tilemap;
  readonly layer: Phaser.Tilemaps.TilemapLayer;
}

/** Builds a one-layer tilemap from rows of tile indices, with collision on the solid ones. */
export function createTileLayer(scene: Phaser.Scene, { data, textureKey, tileSize, solidIndices }: TileLayerOptions): TileLayer {
  const tilemap = scene.make.tilemap({ data, tileWidth: tileSize, tileHeight: tileSize });
  const tileset = tilemap.addTilesetImage(textureKey, textureKey, tileSize, tileSize, 0, 0);
  if (!tileset) throw new Error(`Could not create the "${textureKey}" tileset.`);

  const layer = tilemap.createLayer(0, tileset, 0, 0);
  // Only a GPU layer is created when asked for, but the return type allows either.
  if (!(layer instanceof Phaser.Tilemaps.TilemapLayer)) throw new Error('Could not create the tile layer.');
  layer.setCollision([...solidIndices]);

  return { tilemap, layer };
}
