import type * as Phaser from 'phaser';

import { Gate } from './Gate';
import type { Hazard, HazardPlacement } from './Hazard';
import { Hawk } from './Hawk';

/** Builds the hazard an area asks for, the way the area scene builds a guard from its rank. */
export function createHazard(scene: Phaser.Scene, placement: HazardPlacement): Hazard {
  switch (placement.kind) {
    case 'hawk':
      return new Hawk(scene);
    case 'gate':
      return new Gate(scene, placement);
  }
}
