import { COMBAT, MOVEMENT } from '../../config';
import { horizontalIntent, INPUT, isHeld, type InputBits } from '../input/inputBits';
import { fighterData } from '../../content/fighters/fighterData';
import { dashSpeed, landedAttack } from './attacks';
import type { FighterState } from './fightState';

/**
 * Moves one fighter by one step, ignoring the other fighter and the walls. Only a free fighter
 * follows their input: walking, crouching, and jumps whose direction is fixed at take-off.
 * A knocked-down fighter falls, and any pushback slide carries a fighter along the floor.
 */
export function moveFighter(fighter: FighterState, input: InputBits): FighterState {
  return slide(moveByStatus(fighter, input));
}

function moveByStatus(fighter: FighterState, input: InputBits): FighterState {
  const { status } = fighter;
  if (status.kind === 'knockdown') return status.phase === 'falling' ? fall(fighter) : fighter;
  if (status.kind !== 'free') return fighter;
  if (fighter.posture === 'airborne') return fly(fighter);
  // A fighter attacking on the ground stands their ground until the move is over, unless it is a dash.
  if (fighter.attack) {
    const vx = dashSpeed(fighter) * fighter.facing;
    return vx === 0 && fighter.vx === 0 ? fighter : { ...fighter, x: fighter.x + vx, vx };
  }
  return walk(fighter, input);
}

function walk(fighter: FighterState, input: InputBits): FighterState {
  const moves = fighterData(fighter.character).movement;
  const intent = horizontalIntent(input, fighter.facing);
  if (isHeld(input, INPUT.up)) {
    const drift = intent === 1 ? moves.jumpForward : intent === -1 ? -moves.jumpBack : 0;
    return { ...fighter, posture: 'airborne', vx: drift * fighter.facing, vy: moves.jumpVelocity };
  }
  if (isHeld(input, INPUT.down)) return { ...fighter, posture: 'crouching', vx: 0 };

  const speed = intent === 1 ? moves.walkForward : intent === -1 ? -moves.walkBack : 0;
  const vx = speed * fighter.facing;
  return { ...fighter, posture: 'standing', x: fighter.x + vx, vx };
}

/**
 * One step of a jump: drift sideways, rise and fall under gravity, and land. Landing ends a
 * jumping attack, and puts a rising special into its recovery.
 */
function fly(fighter: FighterState): FighterState {
  const next = arc(fighter);
  if (next.y > 0) return next;
  return { ...next, y: 0, vx: 0, vy: 0, posture: 'standing', attack: landedAttack(fighter), airAttackUsed: false };
}

/** Knocked off their feet: the same arc as a jump, ending on the floor. */
function fall(fighter: FighterState): FighterState {
  const next = arc(fighter);
  if (next.y > 0 || fighter.status.kind !== 'knockdown') return next;
  const status = { ...fighter.status, phase: 'lying', steps: COMBAT.knockdown.lyingSteps } as const;
  return { ...next, y: 0, vx: 0, vy: 0, posture: 'crouching', airAttackUsed: false, status };
}

function arc(fighter: FighterState): FighterState {
  const vy = fighter.vy - MOVEMENT.gravity;
  return { ...fighter, x: fighter.x + fighter.vx, y: fighter.y + vy, vy };
}

/** Pushback carries a fighter along the floor, slowing a little every step. */
function slide(fighter: FighterState): FighterState {
  if (fighter.slide === 0 || fighter.posture === 'airborne') return fighter;
  const slower = Math.max(0, Math.abs(fighter.slide) - COMBAT.slideFriction) * Math.sign(fighter.slide);
  return { ...fighter, x: fighter.x + fighter.slide, slide: slower };
}
