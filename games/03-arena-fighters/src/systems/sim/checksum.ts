import { ATTACK_NAMES, SPECIAL_NAMES } from '../../content/fighters/specials';
import { ALL_FIGHTER_IDS } from '../../content/roster';
import type {
  Contact,
  FighterState,
  FightState,
  KnockdownPhase,
  Posture,
  ProjectileState,
  RoundPhase,
  Status,
  Winner,
} from './fightState';

/** 32-bit FNV-1a, applied to whole numbers instead of bytes. */
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

const POSTURE_CODES: Readonly<Record<Posture, number>> = { standing: 0, crouching: 1, airborne: 2 };
const STATUS_CODES: Readonly<Record<Status['kind'], number>> = {
  free: 0,
  hitstun: 1,
  blockstun: 2,
  knockdown: 3,
  throwing: 4,
  thrown: 5,
};
const PHASE_CODES: Readonly<Record<KnockdownPhase, number>> = { falling: 0, lying: 1, rising: 2 };
const CONTACT_CODES: Readonly<Record<Contact, number>> = { none: 0, hit: 1, block: 2 };
const ROUND_PHASE_CODES: Readonly<Record<RoundPhase, number>> = { intro: 0, fight: 1, ko: 2, timeUp: 3, result: 4, matchOver: 5 };

/**
 * A fingerprint of the whole fight state. Two states with the same checksum are, for all
 * practical purposes, the same. Used by the replay check and to catch online desyncs.
 */
export function checksum(state: FightState): number {
  const values = [
    state.frame,
    state.hitstop,
    ...state.buffered,
    ...state.fighters.flatMap(fighterValues),
    state.projectiles.length,
    ...state.projectiles.flatMap(projectileValues),
    state.rules.roundSteps,
    state.rules.roundsToWin,
    state.round.number,
    ROUND_PHASE_CODES[state.round.phase],
    state.round.phaseSteps,
    state.round.timer,
    winnerCode(state.round.winner),
    ...state.wins,
    winnerCode(state.matchWinner),
  ];
  return values.reduce((hash, value) => Math.imul(hash ^ (value | 0), FNV_PRIME) >>> 0, FNV_OFFSET);
}

function fighterValues(fighter: FighterState): number[] {
  const { attack, status } = fighter;
  return [
    ALL_FIGHTER_IDS.indexOf(fighter.character),
    fighter.x,
    fighter.y,
    fighter.vx,
    fighter.vy,
    fighter.slide,
    fighter.facing,
    POSTURE_CODES[fighter.posture],
    fighter.health,
    fighter.comboHits,
    fighter.airAttackUsed ? 1 : 0,
    fighter.healUsed ? 1 : 0,
    attack ? ATTACK_NAMES.indexOf(attack.move) : -1,
    attack?.step ?? -1,
    attack ? CONTACT_CODES[attack.contact] : -1,
    attack?.heavy ? 1 : 0,
    ...statusValues(status),
  ];
}

function projectileValues(projectile: ProjectileState): number[] {
  const { owner, special, heavy, x, y, vx, vy, burstSteps } = projectile;
  return [owner, SPECIAL_NAMES.indexOf(special), heavy ? 1 : 0, x, y, vx, vy, burstSteps];
}

/** 0 or 1 for a player, 2 for a draw, -1 while undecided. */
function winnerCode(winner: Winner | null): number {
  if (winner === null) return -1;
  return winner === 'draw' ? 2 : winner;
}

function statusValues(status: Status): number[] {
  const code = STATUS_CODES[status.kind];
  if (status.kind === 'free') return [code];
  if (status.kind === 'knockdown') return [code, status.steps, PHASE_CODES[status.phase], status.ko ? 1 : 0];
  if (status.kind === 'throwing') {
    return [code, status.steps, status.special ? SPECIAL_NAMES.indexOf(status.special) : -1, status.heavy ? 1 : 0];
  }
  return [code, status.steps];
}
