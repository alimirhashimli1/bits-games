import { COMBAT } from '../../config';
import { segmentAt, type Strike } from '../../content/fighters/moves';
import { horizontalIntent, INPUT, isHeld, type InputBits } from '../input/inputBits';
import { isCatching, moveOf, specialOf } from './attacks';
import { hitbox, hurtboxes, overlaps } from './boxes';
import type { Facing, FighterState } from './fightState';
import { atWall } from './pushboxes';

type Pair = readonly [FighterState, FighterState];

export interface HitResult {
  readonly fighters: Pair;
  /** How long to freeze the fight for: the longest freeze of whatever landed, or 0. */
  readonly hitstop: number;
}

/** What a strike does to the one it lands on: hit or blocked, and whether a wall kept them from sliding. */
export interface Blow {
  readonly defender: FighterState;
  readonly blocked: boolean;
  readonly cornered: boolean;
}

/**
 * Checks both fighters' strikes against each other on the same step, so two blows landing
 * together both count (a trade), then applies them: a hit, a block, or nothing.
 */
export function resolveHits([first, second]: Pair, inputs: readonly [InputBits, InputBits]): HitResult {
  const firstLands = landingStrike(first, second);
  const secondLands = landingStrike(second, first);
  let a = first;
  let b = second;
  let hitstop = 0;
  if (firstLands && isCatching(b)) {
    [b, a] = answerWith(b, a, inputs[0]);
    hitstop = Math.max(hitstop, hitstopFor(a));
  } else if (firstLands) {
    [a, b] = strikeWith(a, b, inputs[1], firstLands);
    hitstop = Math.max(hitstop, hitstopFor(b));
  }
  if (secondLands && isCatching(a)) {
    [a, b] = answerWith(a, b, inputs[1]);
    hitstop = Math.max(hitstop, hitstopFor(b));
  } else if (secondLands) {
    [b, a] = strikeWith(b, a, inputs[0], secondLands);
    hitstop = Math.max(hitstop, hitstopFor(a));
  }
  return { fighters: [a, b], hitstop };
}

/**
 * A counter catching a blow: the one who threw it takes the counter's answer at once (in the
 * middle of their move, they cannot block it), and the counter jumps to its answering poses.
 */
function answerWith(counterer: FighterState, attacker: FighterState, attackerInput: InputBits): Pair {
  const behaviour = specialOf(counterer)?.behaviour;
  if (behaviour?.kind !== 'counter' || !counterer.attack) return [counterer, attacker];
  const strike: Strike = { ...behaviour.answer, limb: 'nearHand', width: 0, height: 0 };
  const blow = landBlow(attacker, attackerInput, strike, counterer.facing);
  const answering: FighterState = { ...counterer, attack: { ...counterer.attack, step: behaviour.answerStep, contact: 'hit' } };
  return [blow.cornered ? { ...answering, slide: -counterer.facing * strike.push } : answering, blow.defender];
}

/**
 * A strike landing on a defender who was holding `input`, coming from the `from` side (the way
 * the attacker faces): they block it or take it, and slide away unless a wall is behind them.
 */
export function landBlow(defender: FighterState, input: InputBits, strike: Strike, from: Facing): Blow {
  const blocked = blocks(defender, input, strike);
  const struck = blocked ? block(defender, input, strike, from) : takeHit(defender, strike, from);
  if (struck.posture === 'airborne') return { defender: struck, blocked, cornered: false };
  if (atWall(struck, from)) return { defender: struck, blocked, cornered: true };
  return { defender: { ...struck, slide: from * strike.push }, blocked, cornered: false };
}

/** The freeze a blow causes, judged by how the defender took it. */
export function hitstopFor(defender: FighterState): number {
  return defender.status.kind === 'blockstun' ? COMBAT.hitstopSteps.block : COMBAT.hitstopSteps.hit;
}

/** The strike that touches the defender this step, if the attacker's move has not connected yet. */
function landingStrike(attacker: FighterState, defender: FighterState): Strike | null {
  const move = moveOf(attacker);
  if (!move || !attacker.attack || attacker.attack.contact !== 'none') return null;
  const strike = segmentAt(move, attacker.attack.step)?.strike;
  const box = hitbox(attacker);
  if (!strike || !box) return null;
  return hurtboxes(defender).some((hurtbox) => overlaps(box, hurtbox)) ? strike : null;
}

/** A hand-to-hand blow: the move is marked as connected, and a cornered defender pushes the attacker back instead. */
function strikeWith(attacker: FighterState, defender: FighterState, defenderInput: InputBits, strike: Strike): Pair {
  const blow = landBlow(defender, defenderInput, strike, attacker.facing);
  const contact = blow.blocked ? 'block' : 'hit';
  const connected: FighterState = attacker.attack ? { ...attacker, attack: { ...attacker.attack, contact } } : attacker;
  const pushed = blow.cornered ? { ...connected, slide: -attacker.facing * strike.push } : connected;
  return [pushed, blow.defender];
}

/**
 * Blocking is holding away from the attacker on the ground, while not attacking and not
 * reeling. Standing blocks mids and overheads, crouching blocks mids and lows.
 */
function blocks(defender: FighterState, input: InputBits, strike: Strike): boolean {
  const ready = defender.status.kind === 'blockstun' || (defender.status.kind === 'free' && !defender.attack);
  if (!ready || defender.posture === 'airborne') return false;
  if (horizontalIntent(input, defender.facing) !== -1) return false;
  const crouching = isHeld(input, INPUT.down);
  if (strike.guard === 'low') return crouching;
  if (strike.guard === 'overhead') return !crouching;
  return true;
}

function block(defender: FighterState, input: InputBits, strike: Strike, from: Facing): FighterState {
  const health = Math.max(0, defender.health - (strike.chip ?? 0));
  const blocking = { ...defender, posture: isHeld(input, INPUT.down) ? 'crouching' : 'standing', vx: 0, health } as const;
  // Chip damage can still finish a fighter off.
  if (health === 0) return knockDown(blocking, from, true);
  return { ...blocking, status: { kind: 'blockstun', steps: strike.blockstun } };
}

/**
 * A clean hit: health lost and the defender's own move cut short. They reel, or are knocked
 * down if the strike does that, if they were in the air, or if it was their last health.
 */
function takeHit(defender: FighterState, strike: Strike, from: Facing): FighterState {
  const health = Math.max(0, defender.health - strike.damage);
  const stillReeling =
    defender.status.kind === 'hitstun' || (defender.status.kind === 'knockdown' && defender.status.phase === 'falling');
  const hurt = { ...defender, health, attack: null, vx: 0, comboHits: stillReeling ? defender.comboHits + 1 : 1 };

  const ko = health === 0;
  if (strike.knockdown || ko || defender.posture === 'airborne') return knockDown(hurt, from, ko);
  return { ...hurt, status: { kind: 'hitstun', steps: strike.hitstun } };
}

/** Off their feet: up and back in an arc, with no way to be hit again until they are up. */
export function knockDown(fighter: FighterState, awayFrom: Facing, ko: boolean): FighterState {
  return {
    ...fighter,
    posture: 'airborne',
    attack: null,
    slide: 0,
    vx: awayFrom * COMBAT.knockdown.driftSpeed,
    vy: COMBAT.knockdown.popSpeed,
    status: { kind: 'knockdown', phase: 'falling', steps: 0, ko },
  };
}
