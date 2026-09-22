import { MOVEMENT, STAGE } from '../../config';
import { fighterData } from '../../content/fighters/fighterData';
import type { ProjectileBehaviour, SpecialName } from '../../content/fighters/specials';
import type { FighterId } from '../../content/roster';
import type { InputBits } from '../input/inputBits';
import type { PlayerIndex } from '../matchSetup';
import { isProjectileProof, specialOf } from './attacks';
import { hurtboxes, limbPosition, overlaps, type Box } from './boxes';
import { toSubpixels, type Facing, type FighterState, type ProjectileState } from './fightState';
import { hitstopFor, landBlow } from './hits';

type Pair = readonly [FighterState, FighterState];

const PLAYERS: readonly PlayerIndex[] = [0, 1];
/** Projectiles are gone once they are this far past either end of the arena, in sub-pixels. */
const OFFSTAGE_MARGIN = toSubpixels(64);

export interface ProjectileResult {
  readonly fighters: Pair;
  readonly projectiles: readonly ProjectileState[];
  readonly hitstop: number;
}

/** True when this player already has a projectile out, which stops them throwing another. */
export function hasProjectile(projectiles: readonly ProjectileState[], owner: PlayerIndex): boolean {
  return projectiles.some((projectile) => projectile.owner === owner);
}

/**
 * Moves every projectile on and drops those that have left the arena, burnt out or hit the
 * floor, then adds any thrown this step: a projectile special leaves the hand on its spawn step.
 */
export function advanceProjectiles(fighters: Pair, projectiles: readonly ProjectileState[]): readonly ProjectileState[] {
  const moved = projectiles.flatMap((projectile) => {
    const next = advanceOne(projectile, behaviourOf(fighters[projectile.owner].character, projectile.special));
    if (!next) return [];
    return next.x > -OFFSTAGE_MARGIN && next.x < toSubpixels(STAGE.width) + OFFSTAGE_MARGIN ? [next] : [];
  });
  return [...moved, ...PLAYERS.flatMap((owner) => spawned(fighters[owner], owner))];
}

/**
 * One projectile, one step on. A blast counts down where it went off; anything else travels,
 * falling as it goes if it was lobbed. A lobbed throw that reaches the floor bursts there if its
 * special says so, and is otherwise gone. Null means it is finished.
 */
function advanceOne(projectile: ProjectileState, behaviour: ProjectileBehaviour): ProjectileState | null {
  if (projectile.burstSteps >= 0) {
    return projectile.burstSteps > 0 ? { ...projectile, burstSteps: projectile.burstSteps - 1 } : null;
  }
  const flying = {
    ...projectile,
    x: projectile.x + projectile.vx,
    y: projectile.y + projectile.vy,
    vy: behaviour.arc ? projectile.vy - MOVEMENT.gravity : 0,
  };
  if (!behaviour.arc || flying.y > 0) return flying;
  if (!behaviour.burst) return null;
  // It goes off where it landed, sitting on the floor: no longer moving, and hitting much wider.
  return { ...flying, y: toSubpixels(Math.floor(behaviour.burst.height / 2)), vx: 0, vy: 0, burstSteps: behaviour.burst.steps };
}

/**
 * Two projectiles from different players that touch cancel each other out. A projectile that
 * touches its target is blocked or lands like any other strike, and is used up either way. A crouching
 * fighter ducks under any projectile flying level at chest height (`passesOver`).
 */
export function resolveProjectiles(
  fighters: Pair,
  projectiles: readonly ProjectileState[],
  inputs: readonly [InputBits, InputBits],
): ProjectileResult {
  const survivors = projectiles.filter(
    (projectile) =>
      !projectiles.some(
        (other) => other.owner !== projectile.owner && overlaps(projectileBox(projectile, fighters), projectileBox(other, fighters)),
      ),
  );

  const struck: [FighterState, FighterState] = [fighters[0], fighters[1]];
  let hitstop = 0;
  const remaining = survivors.filter((projectile) => {
    const target: PlayerIndex = projectile.owner === 0 ? 1 : 0;
    const box = projectileBox(projectile, fighters);
    if (isProjectileProof(struck[target])) return true;
    const behaviour = behaviourOf(fighters[projectile.owner].character, projectile.special);
    if (passesOver(behaviour, struck[target])) return true;
    if (!hurtboxes(struck[target]).some((hurtbox) => overlaps(box, hurtbox))) return true;

    const size = projectile.burstSteps >= 0 && behaviour.burst ? behaviour.burst : behaviour;
    // A blast sits still, so which way it pushes comes from the side the one caught in it stands.
    const from: Facing = projectile.vx !== 0 ? (projectile.vx > 0 ? 1 : -1) : struck[target].x >= projectile.x ? 1 : -1;
    const strike = { ...behaviour.strike, limb: 'nearHand', width: size.width, height: size.height } as const;
    struck[target] = landBlow(struck[target], inputs[target], strike, from).defender;
    hitstop = Math.max(hitstop, hitstopFor(struck[target]));
    return false;
  });
  return { fighters: struck, projectiles: remaining, hitstop };
}

/** A projectile thrown flat sails over a crouching fighter; one that hits low, or is lobbed, still catches them. */
function passesOver(behaviour: ProjectileBehaviour, target: FighterState): boolean {
  return target.posture === 'crouching' && !behaviour.arc && behaviour.strike.guard !== 'low';
}

/** The projectile a fighter throws this step, if they are on their special's spawn step. */
function spawned(fighter: FighterState, owner: PlayerIndex): ProjectileState[] {
  const special = specialOf(fighter);
  if (!special || !fighter.attack || special.behaviour.kind !== 'projectile') return [];
  const behaviour = special.behaviour;
  if (fighter.attack.step !== behaviour.spawnStep) return [];

  const hand = limbPosition(fighter, behaviour.fromLimb);
  const strength = fighter.attack.heavy ? 'heavy' : 'light';
  return [
    {
      owner,
      special: special.name,
      heavy: fighter.attack.heavy,
      x: hand.x + fighter.facing * toSubpixels(behaviour.forwardPx),
      y: hand.y + toSubpixels(behaviour.upPx ?? 0),
      vx: behaviour.speed[strength] * fighter.facing,
      vy: behaviour.arc ? behaviour.arc[strength] : 0,
      burstSteps: -1,
    },
  ];
}

/**
 * The box a projectile hits with, centred on its position. Its size comes from its owner's
 * special: the blast of one that has gone off is far wider than the thing that was thrown.
 */
export function projectileBox(projectile: ProjectileState, fighters: Pair): Box {
  const behaviour = behaviourOf(fighters[projectile.owner].character, projectile.special);
  const size = projectile.burstSteps >= 0 && behaviour.burst ? behaviour.burst : behaviour;
  const width = toSubpixels(size.width);
  const height = toSubpixels(size.height);
  return { left: projectile.x - width / 2, bottom: projectile.y - height / 2, width, height };
}

function behaviourOf(character: FighterId, name: SpecialName): ProjectileBehaviour {
  const behaviour = fighterData(character).specials.find((special) => special.name === name)?.behaviour;
  if (behaviour?.kind !== 'projectile') throw new Error(`"${name}" is not a projectile special.`);
  return behaviour;
}
