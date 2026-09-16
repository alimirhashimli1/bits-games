import type { ActionInput } from '@shared/phaser/actionInput';

import type { PlayerAction } from '../config';
import type { FighterIntent } from '../entities/Fighter';
import type { AttackHeight } from '../entities/fighterMoves';

type Controls = ActionInput<PlayerAction>;

/** Turns this frame's player input into what the hero should do. */
export function readPlayerIntent(controls: Controls): FighterIntent {
  const right = controls.isDown('right') ? 1 : 0;
  const left = controls.isDown('left') ? 1 : 0;

  return {
    move: right - left,
    toggleStance: controls.justPressed('stance'),
    attack: readAttack(controls),
    block: controls.isDown('block') ? (controls.isDown('down') ? 'low' : 'high') : null,
  };
}

function readAttack(controls: Controls): FighterIntent['attack'] {
  const height = aimedHeight(controls);
  if (controls.justPressed('punch')) return { kind: 'punch', height };
  if (controls.justPressed('kick')) return { kind: 'kick', height };
  return null;
}

/** Holding up aims high, holding down aims low, neither aims at the middle. */
function aimedHeight(controls: Controls): AttackHeight {
  if (controls.isDown('up')) return 'high';
  if (controls.isDown('down')) return 'low';
  return 'mid';
}
