import type * as Phaser from 'phaser';

import { BLOCKS } from '../../config';
import { COIN_ANIMATIONS, COIN_SHEET } from '../../content/sprites/items';

/** A coin knocked out of a block: it flies up spinning, drops back a little and vanishes. */
export function popCoin(scene: Phaser.Scene, centerX: number, blockTopY: number): void {
  const coin = scene.add.sprite(centerX, blockTopY, COIN_SHEET.key).setOrigin(0.5, 1).play(COIN_ANIMATIONS.popSpin.key);
  scene.tweens.chain({
    targets: coin,
    tweens: [
      { y: blockTopY - BLOCKS.coinPopHeight, duration: BLOCKS.coinPopRiseMs, ease: 'Quad.easeOut' },
      {
        y: blockTopY - BLOCKS.coinPopHeight + BLOCKS.coinPopFallDistance,
        duration: BLOCKS.coinPopFallMs,
        ease: 'Quad.easeIn',
      },
    ],
    onComplete: () => coin.destroy(),
  });
}
