import { playSound, type SoundSpec } from '@shared/audio/audioEngine';

import { AUDIO } from '../config';
import { fighterData } from '../content/fighters/fighterData';
import type { AttackName, SpecialBehaviour, SpecialName } from '../content/fighters/specials';
import { SPECIAL_NAMES } from '../content/fighters/specials';
import { SOUNDS } from '../content/sounds';
import type { PlayerIndex } from './matchSetup';
import type { FighterId } from '../content/roster';
import type { FighterState, FightState, ProjectileState } from './sim/fightState';

const PLAYERS: readonly PlayerIndex[] = [0, 1];

/** What each kind of special sounds like as it starts. */
const SPECIAL_SOUNDS: Readonly<Record<SpecialBehaviour['kind'], SoundSpec>> = {
  // A throw and a command throw both open with a swing; what they sound like next depends on
  // whether they catch anything, which the status says a few steps later.
  projectile: SOUNDS.punchHeavy,
  commandThrow: SOUNDS.punchHeavy,
  rising: SOUNDS.rising,
  dive: SOUNDS.dive,
  dash: SOUNDS.dash,
  wallLeap: SOUNDS.wallLeap,
  teleport: SOUNDS.teleport,
  counter: SOUNDS.counter,
  heal: SOUNDS.heal,
};

/**
 * The fight's voice.
 *
 * The simulation is pure and makes no noise: it takes a state and some inputs and returns the
 * next state, and nothing else. So the sounds are not played by the fight but heard in it —
 * every state is compared with the one before, and what changed between them is what is played.
 *
 * That keeps the simulation exactly as testable as it was, lets the replay check re-run a whole
 * fight in silence, and means an online match sounds the same in both browsers without a single
 * sound being sent: each side is watching the same states go by.
 */
export class FightSounds {
  private previous: FightState | null = null;

  /**
   * Called with every state the fight passes through, starting with the one it opens on, which
   * is where the first round is called.
   */
  observe(state: FightState): void {
    const previous = this.previous;
    this.previous = state;
    if (previous === null || state.round.number !== previous.round.number) {
      playSound(SOUNDS.roundCall);
      // A new round puts both fighters back in their corners at full health. Nothing about that
      // is something that happened, so none of it is worth a sound.
      return;
    }
    this.announce(previous, state);
    this.watchProjectiles(previous.projectiles, state.projectiles);
    for (const player of PLAYERS) this.watchFighter(previous.fighters[player], state.fighters[player]);
  }

  /** The announcer, who calls the fight on, the knockout, the clock and the winner. */
  private announce(previous: FightState, state: FightState): void {
    const { phase, winner } = state.round;
    if (phase === previous.round.phase) return;
    if (phase === 'fight') playSound(SOUNDS.fightCall);
    if (phase === 'ko') playSound(SOUNDS.koCall);
    if (phase === 'timeUp') playSound(SOUNDS.timeUpCall);
    if (phase === 'result') playSound(winner === 'draw' ? SOUNDS.drawCall : SOUNDS.roundWinCall);
    if (phase === 'matchOver') playSound(state.matchWinner === 'draw' ? SOUNDS.drawCall : SOUNDS.matchWinCall);
  }

  private watchFighter(before: FighterState, after: FighterState): void {
    this.watchSwing(before, after);
    this.watchHealth(before, after);
    this.watchStatus(before, after);
    this.watchFeet(before, after);
  }

  /**
   * A move going out, whether or not it finds anything. A move counts as fresh when there was
   * none before, when one move is cancelled into another, or when the same move starts again.
   */
  private watchSwing(before: FighterState, after: FighterState): void {
    const attack = after.attack;
    if (attack === null) return;
    const previous = before.attack;
    const fresh = previous === null || previous.move !== attack.move || attack.step < previous.step;
    if (fresh) playSound(swingSound(after.character, attack.move));
  }

  /**
   * Health lost is a blow landing, and how much of it was lost decides which of the two impacts
   * is heard. A throw is left out: its damage arrives with the fighter hitting the floor, which
   * has a sound of its own and would otherwise be heard twice over.
   */
  private watchHealth(before: FighterState, after: FighterState): void {
    const lost = before.health - after.health;
    if (lost < 0) {
      playSound(SOUNDS.heal);
      return;
    }
    if (lost === 0 || before.status.kind === 'thrown') return;
    playSound(lost >= AUDIO.heavyHitDamage ? SOUNDS.hitHeavy : SOUNDS.hitLight);
  }

  /** Guards raised, throws caught and broken, and the long way down to the floor. */
  private watchStatus(before: FighterState, after: FighterState): void {
    const from = before.status;
    const to = after.status;
    if (to.kind === 'blockstun' && from.kind !== 'blockstun') {
      // Both fighters let go of a broken throw and hold their guard, so a guard raised straight
      // out of a throw is the break rather than a blow being caught on it.
      playSound(from.kind === 'thrown' ? SOUNDS.throwBreak : SOUNDS.block);
    }
    if (to.kind === 'throwing' && from.kind !== 'throwing') {
      playSound(to.special === null ? SOUNDS.throwGrab : SOUNDS.commandThrow);
    }
    if (to.kind === 'knockdown' && from.kind !== 'knockdown') playSound(SOUNDS.knockdown);
    if (to.kind === 'knockdown' && from.kind === 'knockdown' && from.phase === 'falling' && to.phase === 'lying') {
      playSound(SOUNDS.bodyDrop);
    }
  }

  /** Leaving the floor, and coming back to it on your feet. */
  private watchFeet(before: FighterState, after: FighterState): void {
    const left = before.posture !== 'airborne' && after.posture === 'airborne';
    const landed = before.posture === 'airborne' && after.posture !== 'airborne';
    if (left) playSound(SOUNDS.jump);
    // Anyone coming down knocked over has the fall and the floor to themselves.
    if (landed && after.status.kind !== 'knockdown') playSound(SOUNDS.land);
  }

  /** Something leaving a hand, and something landing. */
  private watchProjectiles(before: readonly ProjectileState[], after: readonly ProjectileState[]): void {
    if (after.length > before.length) playSound(SOUNDS.projectileFire);
    if (bursting(after) > bursting(before)) playSound(SOUNDS.projectileBurst);
  }
}

/** How many of these have landed and are going off, which is one more each time one lands. */
function bursting(projectiles: readonly ProjectileState[]): number {
  return projectiles.filter((projectile) => projectile.burstSteps > 0).length;
}

/** What a move sounds like as it goes out: a special has its own, a normal has its button's. */
function swingSound(character: FighterId, move: AttackName): SoundSpec {
  const behaviour = specialKind(character, move);
  if (behaviour !== null) return SPECIAL_SOUNDS[behaviour];
  // A normal's name ends in the button that threw it: LP, HP, LK or HK.
  const button = move.slice(-2);
  if (button === 'LP') return SOUNDS.punchLight;
  if (button === 'HP') return SOUNDS.punchHeavy;
  if (button === 'LK') return SOUNDS.kickLight;
  return SOUNDS.kickHeavy;
}

/** What a special does, for a move that is one. Normals are not in the list and come back null. */
function specialKind(character: FighterId, move: AttackName): SpecialBehaviour['kind'] | null {
  if (!isSpecialName(move)) return null;
  const special = fighterData(character).specials.find((candidate) => candidate.name === move);
  return special?.behaviour.kind ?? null;
}

function isSpecialName(move: AttackName): move is SpecialName {
  return SPECIAL_NAMES.some((name) => name === move);
}
