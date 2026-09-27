import type * as Phaser from 'phaser';

import type { EnemyKind } from '../../systems/enemyKinds';
import { Blub } from './Blub';
import type { Enemy } from './Enemy';
import { Flitter } from './Flitter';
import { Pebblenose } from './Pebblenose';
import { Thornback } from './Thornback';
import { TrainingDummy } from './TrainingDummy';

/** Makes an enemy of this kind standing at (x, y). */
export function createEnemy(kind: EnemyKind, scene: Phaser.Scene, x: number, y: number): Enemy {
  switch (kind) {
    case 'blub':
      return new Blub(scene, x, y);
    case 'pebblenose':
      return new Pebblenose(scene, x, y);
    case 'flitter':
      return new Flitter(scene, x, y);
    case 'thornback':
      return new Thornback(scene, x, y);
    case 'dummy':
      return new TrainingDummy(scene, x, y);
  }
}
