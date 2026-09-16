import { playSound } from '@shared/audio/audioEngine';

import { SOUNDS } from '../content/sounds';
import { FIGHTER_EVENT, type Fighter } from '../entities/Fighter';
import type { AttackKind } from '../entities/fighterMoves';

/**
 * Gives a fighter its voice. The Fighter itself stays silent and only announces what it did,
 * so the same entity can be used by scenes that want different sounds, or none.
 */
export function addFighterSounds(fighter: Fighter): void {
  fighter.on(FIGHTER_EVENT.attack, (kind: AttackKind) => {
    playSound(kind === 'kick' ? SOUNDS.swingKick : SOUNDS.swingPunch);
  });
  fighter.on(FIGHTER_EVENT.stanceChange, () => playSound(SOUNDS.stance));
  fighter.on(FIGHTER_EVENT.footstep, () => playSound(SOUNDS.footstep));
}
