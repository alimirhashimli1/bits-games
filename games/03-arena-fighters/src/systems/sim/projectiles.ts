import { STAGE } from '../../config';
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
 * Moves every projectile on and drops those that have left the arena, then adds any thrown this
 * step: a projectile special leaves the hand on its spawn step.
 */
export function advanceProjectiles(fighters: Pair, projectiles: readonly ProjectileState[]): readonly ProjectileState[] {
  const moved = projectiles
    .map((projectile) => ({ ...projectile, x: projectile.x + projectile.vx }))
    .filter((projectile) => projectile.x > -OFFSTAGE_MARGIN && projectile.x < toSubpixels(STAGE.width) + OFFSTAGE_MARGIN);
  return [...moved, ...PLAYERS.flatMap((owner) => spawned(fighters[owner], owner))];
}

/**
 * Two projectiles from different players that touch cancel each other out. A projectile that
 * touches its target is blocked or lands like any other strike, and is used up either way.
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
    if (!hurtboxes(struck[target]).some((hurtbox) => overlaps(box, hurtbox))) return true;

    const behaviour = behaviourOf(fighters[projectile.owner].character, projectile.special);
    const from: Facing = projectile.vx > 0 ? 1 : -1;
    const strike = { ...behaviour.strike, limb: 'nearHand', width: behaviour.width, height: behaviour.height } as const;
    struck[target] = landBlow(struck[target], inputs[target], strike, from).defender;
    hitstop = Math.max(hitstop, hitstopFor(struck[target]));
    return false;
  });
  return { fighters: struck, projectiles: remaining, hitstop };
}

/** The projectile a fighter throws this step, if they are on their special's spawn step. */
function spawned(fighter: FighterState, owner: PlayerIndex): ProjectileState[] {
  const special = specialOf(fighter);
  if (!special || !fighter.attack || special.behaviour.kind !== 'projectile') return [];
  const behaviour = special.behaviour;
  if (fighter.attack.step !== behaviour.spawnStep) return [];

  const hand = limbPosition(fighter, behaviour.fromLimb);
  const speed = behaviour.speed[fighter.attack.heavy ? 'heavy' : 'light'];
  return [
    {
      owner,
      special: special.name,
      heavy: fighter.attack.heavy,
      x: hand.x + fighter.facing * toSubpixels(behaviour.forwardPx),
      y: hand.y + toSubpixels(behaviour.upPx ?? 0),
      vx: speed * fighter.facing,
    },
  ];
}

/** The box a projectile hits with, centred on its position. Its size comes from its owner's special. */
export function projectileBox(projectile: ProjectileState, fighters: Pair): Box {
  const behaviour = behaviourOf(fighters[projectile.owner].character, projectile.special);
  const width = toSubpixels(behaviour.width);
  const height = toSubpixels(behaviour.height);
  return { left: projectile.x - width / 2, bottom: projectile.y - height / 2, width, height };
}

function behaviourOf(character: FighterId, name: SpecialName): ProjectileBehaviour {
  const behaviour = fighterData(character).specials.find((special) => special.name === name)?.behaviour;
  if (behaviour?.kind !== 'projectile') throw new Error(`"${name}" is not a projectile special.`);
  return behaviour;
}
