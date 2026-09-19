import { COMBAT } from '../../config';
import { moveLength, segmentAt } from '../../content/fighters/moves';
import type { CommandThrowBehaviour, SpecialName } from '../../content/fighters/specials';
import { INPUT, isHeld, newlyPressed, type InputBits } from '../input/inputBits';
import { commandThrowOf, isIntangible, isInvulnerable, isLightMove, specialOf } from './attacks';
import { FREE, toSubpixels, type FighterState, type Status } from './fightState';
import { knockDown } from './hits';

type Pair = readonly [FighterState, FighterState];
type Histories = readonly [readonly InputBits[], readonly InputBits[]];
type ThrowingStatus = Extract<Status, { kind: 'throwing' }>;
type Lift = NonNullable<CommandThrowBehaviour['lift']>;

const THROW_BUTTONS = INPUT.lightPunch | INPUT.lightKick;

/** How a throw plays out once it has caught someone: the ordinary throw's numbers, or a command throw's. */
interface ThrowRules {
  readonly durationSteps: number;
  readonly damage: number;
  /** The one thrown can break free during this many steps; 0 for a throw that cannot be broken. */
  readonly techSteps: number;
  readonly tossSpeed: number;
  readonly tossPop: number;
  /** Lifted overhead part-way through, or left standing where they were caught. */
  readonly lift: Lift | null;
}

const ORDINARY_THROW: ThrowRules = {
  durationSteps: COMBAT.throw.durationSteps,
  damage: COMBAT.throw.damage,
  techSteps: COMBAT.throw.techSteps,
  tossSpeed: COMBAT.throw.tossSpeed,
  tossPop: COMBAT.throw.tossPop,
  lift: null,
};

/**
 * Throws: light punch + light kick together, close to an opponent standing on the ground.
 * A throw under way either finishes, or is broken if the one being thrown answers with the
 * same buttons in time (which a command throw does not allow). Two fighters grabbing at once
 * push each other apart.
 */
export function resolveThrows(pair: Pair, inputs: readonly [InputBits, InputBits], histories: Histories): Pair {
  const [a, b] = pair;
  if (a.status.kind === 'throwing') return progressThrow(a, b, inputs[1], histories[1]);
  if (b.status.kind === 'throwing') return swap(progressThrow(b, a, inputs[0], histories[0]));

  const aGrabs = attemptsThrow(a, b, inputs[0], histories[0]);
  const bGrabs = attemptsThrow(b, a, inputs[1], histories[1]);
  if (aGrabs && bGrabs) return breakApart(a, b);
  if (aGrabs) return startThrow(a, b, null, false);
  if (bGrabs) return swap(startThrow(b, a, null, false));
  return pair;
}

/**
 * Command throws catch on their grab steps: an opponent in reach who can be thrown is caught,
 * whatever they are pressing. Checked once both fighters have moved, so the reach is measured
 * where they really stand. Two catching each other at once push apart, as two throws do.
 */
export function resolveCommandThrows(pair: Pair): Pair {
  const [a, b] = pair;
  const aCatches = catches(a, b);
  const bCatches = catches(b, a);
  if (aCatches && bCatches) return breakApart(a, b);
  if (aCatches && a.attack) return startThrow(a, b, a.attack.move as SpecialName, a.attack.heavy);
  if (bCatches && b.attack) return swap(startThrow(b, a, b.attack.move as SpecialName, b.attack.heavy));
  return pair;
}

/**
 * Light punch and light kick both held, both pressed within the last few steps, and at least
 * one of them this very step, so holding them down does not throw again and again.
 */
function throwInput(history: readonly InputBits[], input: InputBits): boolean {
  const previous = history[history.length - 1] ?? 0;
  if ((input & THROW_BUTTONS) !== THROW_BUTTONS) return false;
  if ((newlyPressed(input, previous) & THROW_BUTTONS) === 0) return false;

  const all = [...history, input];
  const pressedRecently = (flag: number): boolean => {
    for (let index = all.length - 1; index >= Math.max(0, all.length - COMBAT.throw.inputSteps); index -= 1) {
      if (isHeld(all[index] ?? 0, flag) && !isHeld(all[index - 1] ?? 0, flag)) return true;
    }
    return false;
  };
  return pressedRecently(INPUT.lightPunch) && pressedRecently(INPUT.lightKick);
}

function attemptsThrow(thrower: FighterState, target: FighterState, input: InputBits, history: readonly InputBits[]): boolean {
  return (
    throwInput(history, input) && canGrab(thrower) && canBeThrown(target) && inReach(thrower, target, COMBAT.throw.rangePx)
  );
}

/** A command throw on one of its grab steps, with the opponent in its reach. */
function catches(thrower: FighterState, target: FighterState): boolean {
  const special = specialOf(thrower);
  if (special?.behaviour.kind !== 'commandThrow' || !thrower.attack || thrower.status.kind !== 'free') return false;
  if (!segmentAt(special.move, thrower.attack.step)?.grab) return false;
  const range = special.behaviour.rangePx[thrower.attack.heavy ? 'heavy' : 'light'];
  return canBeThrown(target) && inReach(thrower, target, range);
}

/**
 * Free and on the ground. The first press of the pair has usually started a light normal
 * already, so a throw may still take over during that move's first few steps.
 */
function canGrab(fighter: FighterState): boolean {
  if (fighter.status.kind !== 'free' || fighter.posture === 'airborne') return false;
  const { attack } = fighter;
  return !attack || (isLightMove(attack.move) && attack.step < COMBAT.throw.inputSteps);
}

/**
 * Only an opponent on the ground and not already reeling, blocking or down can be thrown, and
 * not one who cannot be touched: at the start of a rising special, or passing through in a dash.
 */
function canBeThrown(fighter: FighterState): boolean {
  if (fighter.status.kind !== 'free' || fighter.posture === 'airborne') return false;
  return !isInvulnerable(fighter) && !isIntangible(fighter);
}

/** Close enough, and in front of the thrower. */
function inReach(thrower: FighterState, target: FighterState, rangePx: number): boolean {
  const ahead = (target.x - thrower.x) * thrower.facing;
  return ahead >= 0 && ahead <= toSubpixels(rangePx);
}

function startThrow(thrower: FighterState, target: FighterState, special: SpecialName | null, heavy: boolean): Pair {
  const held = { attack: null, vx: 0, slide: 0, posture: 'standing' } as const;
  return [
    { ...thrower, ...held, status: { kind: 'throwing', steps: 0, special, heavy } },
    { ...target, ...held, status: { kind: 'thrown', steps: 0 } },
  ];
}

function progressThrow(thrower: FighterState, target: FighterState, targetInput: InputBits, targetHistory: readonly InputBits[]): Pair {
  const { status } = thrower;
  if (status.kind !== 'throwing') return [thrower, target];
  const rules = throwRules(thrower, status);
  const steps = status.steps + 1;

  if (steps <= rules.techSteps && throwInput(targetHistory, targetInput)) return breakApart(thrower, target);
  if (steps < rules.durationSteps) {
    const held: FighterState = { ...target, status: { kind: 'thrown', steps } };
    const lifted = rules.lift && steps >= rules.lift.step ? liftOverhead(thrower, held, rules.lift) : held;
    return [{ ...thrower, status: { ...status, steps } }, lifted];
  }

  // The toss: thrown forward off their feet.
  const health = Math.max(0, target.health - rules.damage);
  const tossed = knockDown({ ...target, health, comboHits: 1 }, thrower.facing, health === 0);
  return [
    { ...thrower, status: FREE },
    { ...tossed, vx: thrower.facing * rules.tossSpeed, vy: rules.tossPop },
  ];
}

function throwRules(thrower: FighterState, status: ThrowingStatus): ThrowRules {
  const command = status.special ? commandThrowOf(thrower.character, status.special) : null;
  if (!command) return ORDINARY_THROW;
  return {
    durationSteps: moveLength({ segments: command.hold }),
    damage: command.damage[status.heavy ? 'heavy' : 'light'],
    techSteps: 0,
    tossSpeed: command.tossSpeed,
    tossPop: command.tossPop,
    lift: command.lift ?? null,
  };
}

/**
 * Held up overhead, in front of the thrower. Off the floor, so the two bodies do not push each
 * other, and the toss starts from up there.
 */
function liftOverhead(thrower: FighterState, target: FighterState, lift: Lift): FighterState {
  const x = thrower.x + thrower.facing * toSubpixels(lift.forwardPx);
  return { ...target, x, y: toSubpixels(lift.heightPx), posture: 'airborne' };
}

/**
 * A broken throw, or two throws at once: both let go, are pushed apart and hold their guard for
 * a moment, so the buttons that broke the throw do not also start an attack.
 */
function breakApart(first: FighterState, second: FighterState): Pair {
  const away = first.x <= second.x ? -1 : 1;
  const released = { status: { kind: 'blockstun', steps: COMBAT.throw.techRecoverySteps }, attack: null } as const;
  return [
    { ...first, ...released, slide: away * COMBAT.throw.techPush },
    { ...second, ...released, slide: -away * COMBAT.throw.techPush },
  ];
}

function swap([first, second]: Pair): Pair {
  return [second, first];
}
