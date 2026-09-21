import { COMBAT } from '../../config';
import { fighterData } from '../../content/fighters/fighterData';
import { moveLength, phaseAt, type Move, type MoveName } from '../../content/fighters/moves';
import type {
  AttackName,
  CommandThrowBehaviour,
  DashBehaviour,
  SpecialMove,
  SpecialName,
} from '../../content/fighters/specials';
import type { FighterId } from '../../content/roster';
import { INPUT, isHeld, type Button, type InputBits } from '../input/inputBits';
import { completedMotions, motionLength } from '../input/motions';
import type { AttackState, Facing, FighterState } from './fightState';

/** When several buttons are pressed on the same step, the heaviest wins. */
const BUTTON_PRIORITY: readonly Button[] = ['heavyKick', 'heavyPunch', 'lightKick', 'lightPunch'];
const LIGHT_BUTTONS: readonly Button[] = ['lightKick', 'lightPunch'];

const BUTTON_SUFFIX = {
  lightPunch: 'LP',
  heavyPunch: 'HP',
  lightKick: 'LK',
  heavyKick: 'HK',
} as const satisfies Readonly<Record<Button, string>>;

/** Special moves are started with a punch: the light or the heavy version. */
const SPECIAL_BUTTONS = { light: INPUT.lightPunch, heavy: INPUT.heavyPunch } as const;

/** What a fighter's controls did on this step, and what they need to know to act on it. */
export interface AttackInput {
  readonly input: InputBits;
  /** Buttons pressed this step, or during the hitstop just ended. */
  readonly pressed: InputBits;
  /** Inputs before this step, oldest first, for reading motions. */
  readonly history: readonly InputBits[];
  /** The side this player's motions are read from, which never changes (see MOTION_FACING). */
  readonly motionFacing: Facing;
  /** A fighter may only have one projectile out at a time. */
  readonly projectileOut: boolean;
}

/** The light normals, which are the ones a `chain` cancel can go into. */
export function isLightMove(move: AttackName): boolean {
  return move.endsWith('LP') || move.endsWith('LK');
}

export function specialOf(fighter: FighterState): SpecialMove | null {
  const name = fighter.attack?.move;
  return fighterData(fighter.character).specials.find((special) => special.name === name) ?? null;
}

/** A fighter's command throw of this name, which a throw under way looks up for its numbers and poses. */
export function commandThrowOf(character: FighterId, name: SpecialName): CommandThrowBehaviour | null {
  const behaviour = fighterData(character).specials.find((special) => special.name === name)?.behaviour;
  return behaviour?.kind === 'commandThrow' ? behaviour : null;
}

export function moveOf(fighter: FighterState): Move | null {
  if (!fighter.attack) return null;
  const special = specialOf(fighter);
  if (special) return special.move;
  return fighterData(fighter.character).moves[fighter.attack.move as MoveName];
}

/**
 * A free fighter's attacks. A move under way steps on, or is cancelled into a special move (or,
 * for light normals, another light) once it has connected. A free fighter starts a special
 * move if the button completes one of their motions, and otherwise a normal: standing,
 * crouching (↓ held) or in the air, once per jump.
 */
export function updateAttack(fighter: FighterState, controls: AttackInput): FighterState {
  if (fighter.status.kind !== 'free') return fighter;
  if (!fighter.attack) return startSpecial(fighter, controls) ?? startNormal(fighter, controls, BUTTON_PRIORITY);
  return cancel(fighter, controls) ?? continueAttack(fighter);
}

/**
 * When a punch was just pressed, the special of the fighter's whose motion was just finished.
 * ↓ → finishes → as well, so the longer motion wins and only falls back to the shorter one when
 * that special cannot be used now. Special moves start from the ground only.
 */
function startSpecial(fighter: FighterState, { input, pressed, history, motionFacing, projectileOut }: AttackInput): FighterState | null {
  if (fighter.posture === 'airborne') return null;
  const heavy = isHeld(pressed, SPECIAL_BUTTONS.heavy);
  if (!heavy && !isHeld(pressed, SPECIAL_BUTTONS.light)) return null;

  const motions = completedMotions([...history, input], motionFacing);
  let chosen: SpecialMove | null = null;
  for (const special of fighterData(fighter.character).specials) {
    if (!motions.includes(special.motion)) continue;
    if (special.behaviour.kind === 'projectile' && projectileOut) continue;
    if (special.behaviour.kind === 'heal' && fighter.healUsed) continue;
    if (!chosen || motionLength(special.motion) > motionLength(chosen.motion)) chosen = special;
  }
  if (!chosen) return null;

  const heal = chosen.behaviour.kind === 'heal';
  const attack: AttackState = { move: chosen.name, step: 0, contact: 'none', heavy };
  return { ...fighter, posture: 'standing', vx: 0, attack, healUsed: fighter.healUsed || heal };
}

function startNormal(fighter: FighterState, { input, pressed }: AttackInput, buttons: readonly Button[]): FighterState {
  const button = buttons.find((candidate) => isHeld(pressed, INPUT[candidate]));
  if (!button) return fighter;

  const suffix = BUTTON_SUFFIX[button];
  const heavy = button === 'heavyPunch' || button === 'heavyKick';
  if (fighter.posture === 'airborne') {
    if (fighter.airAttackUsed) return fighter;
    const move: MoveName = `jump${suffix}`;
    return { ...fighter, attack: { move, step: 0, contact: 'none', heavy }, airAttackUsed: true };
  }
  const crouching = isHeld(input, INPUT.down);
  const move: MoveName = crouching ? `crouch${suffix}` : `stand${suffix}`;
  return { ...fighter, posture: crouching ? 'crouching' : 'standing', vx: 0, attack: { move, step: 0, contact: 'none', heavy } };
}

/**
 * Once a normal has connected and is past its startup, it can be cut short: into a special
 * move if its cancel rule allows one, or with `chain` into a fresh light normal.
 */
function cancel(fighter: FighterState, controls: AttackInput): FighterState | null {
  const move = moveOf(fighter);
  if (!move?.cancel || !fighter.attack || fighter.posture === 'airborne') return null;
  if (fighter.attack.contact === 'none' || phaseAt(move, fighter.attack.step) === 'startup') return null;

  const free = { ...fighter, attack: null };
  const special = startSpecial(free, controls);
  if (special) return special;
  if (move.cancel !== 'chain') return null;
  const chained = startNormal(free, controls, LIGHT_BUTTONS);
  return chained.attack ? chained : null;
}

/**
 * Steps a move on, ending it when it is over. A rising special leaves the ground on its launch
 * step, and holds its last airborne pose until it lands; its last segment is the recovery on
 * landing (see `landedAttack`). A counter that caught nothing ends where its answer would
 * begin, and a heal wins back health on its heal step.
 */
function continueAttack(fighter: FighterState): FighterState {
  const move = moveOf(fighter);
  if (!move || !fighter.attack) return fighter;
  const step = fighter.attack.step + 1;
  const behaviour = specialOf(fighter)?.behaviour;

  if (behaviour?.kind === 'rising') {
    const strength = fighter.attack.heavy ? 'heavy' : 'light';
    if (step === behaviour.launchStep) {
      return {
        ...fighter,
        posture: 'airborne',
        vy: behaviour.rise[strength],
        vx: behaviour.drift[strength] * fighter.facing,
        airAttackUsed: true,
        attack: { ...fighter.attack, step },
      };
    }
    if (fighter.posture === 'airborne' && step >= landingStart(move)) return fighter;
  }
  // A counter that caught nothing ends before its answer.
  if (behaviour?.kind === 'counter' && fighter.attack.contact === 'none' && step >= behaviour.answerStep) return { ...fighter, attack: null };
  if (step >= moveLength(move)) return { ...fighter, attack: null };
  const attack = { ...fighter.attack, step };
  if (behaviour?.kind === 'heal' && step === behaviour.healStep) {
    const health = Math.min(COMBAT.maxHealth, fighter.health + behaviour.amount[attack.heavy ? 'heavy' : 'light']);
    return { ...fighter, health, attack };
  }
  return { ...fighter, attack };
}

/** A counter on the steps where it catches a blow, and has not caught one yet. */
export function isCatching(fighter: FighterState): boolean {
  const behaviour = specialOf(fighter)?.behaviour;
  if (behaviour?.kind !== 'counter' || !fighter.attack || fighter.attack.contact !== 'none') return false;
  return fighter.attack.step >= behaviour.catchStart && fighter.attack.step < behaviour.catchEnd;
}

/**
 * What landing does to the move under way: a jumping normal ends, and a rising special goes into
 * its recovery on landing.
 */
export function landedAttack(fighter: FighterState): AttackState | null {
  const move = moveOf(fighter);
  if (!move || !fighter.attack || specialOf(fighter)?.behaviour.kind !== 'rising') return null;
  return { ...fighter.attack, step: landingStart(move) };
}

/** A rising special cannot be hit during its first steps. */
export function isInvulnerable(fighter: FighterState): boolean {
  const behaviour = specialOf(fighter)?.behaviour;
  if (behaviour?.kind !== 'rising' || !fighter.attack) return false;
  return fighter.attack.step < behaviour.invulnerableSteps[fighter.attack.heavy ? 'heavy' : 'light'];
}

/**
 * The dash a fighter is in the middle of, if their special is travelling on this step. One that
 * stops on contact is over once it has hit or been blocked.
 */
function dashUnderWay(fighter: FighterState): DashBehaviour | null {
  const behaviour = specialOf(fighter)?.behaviour;
  if (behaviour?.kind !== 'dash' || !fighter.attack) return null;
  if (behaviour.stopsOnContact && fighter.attack.contact !== 'none') return null;
  const { step } = fighter.attack;
  return step >= behaviour.startStep && step < behaviour.endStep ? behaviour : null;
}

/** How fast a dash carries the fighter forward this step, in sub-pixels, or 0. */
export function dashSpeed(fighter: FighterState): number {
  const dash = dashUnderWay(fighter);
  return dash && fighter.attack ? dash.speed[fighter.attack.heavy ? 'heavy' : 'light'] : 0;
}

/** Projectiles pass through a fighter in a projectile-proof dash. */
export function isProjectileProof(fighter: FighterState): boolean {
  return dashUnderWay(fighter)?.projectileProof === true;
}

/** A fighter passing through the opponent in a dash does not push or get pushed. */
export function isIntangible(fighter: FighterState): boolean {
  return dashUnderWay(fighter)?.passThrough === true;
}

/** The step a move's last segment starts on: for a rising special, its recovery on landing. */
function landingStart(move: Move): number {
  const last = move.segments[move.segments.length - 1];
  return moveLength(move) - (last?.steps ?? 0);
}
