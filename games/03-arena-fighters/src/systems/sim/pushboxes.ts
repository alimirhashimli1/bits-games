import { BODY, STAGE } from '../../config';
import { isIntangible } from './attacks';
import type { Box } from './boxes';
import { toSubpixels, type FighterState } from './fightState';

type Pair = readonly [FighterState, FighterState];

const HALF_WIDTH = toSubpixels(BODY.halfWidth);
const LEFT_WALL = HALF_WIDTH;
const RIGHT_WALL = toSubpixels(STAGE.width) - HALF_WIDTH;
const MAX_SEPARATION = toSubpixels(STAGE.maxSeparation);

/**
 * Keeps the two fighters apart, inside the arena and within one screen of each other,
 * after both have moved. `before` is where they stood at the start of the step.
 */
export function resolveBodies(moved: Pair, before: Pair): Pair {
  const pushed = pushApart(moved, before);
  const [a, b] = limitSeparation(pushed, before);
  const walled: Pair = [keepInsideWalls(a), keepInsideWalls(b)];
  // A fighter pinned against a wall cannot give way, so the other one takes the whole push.
  return pushApart(walled, before, true);
}

/** Shares out any overlap between the two push boxes, half each, or all to the one not at a wall. */
function pushApart([a, b]: Pair, before: Pair, afterWalls = false): Pair {
  if (isIntangible(a) || isIntangible(b)) return [a, b];
  const overlap = horizontalOverlap(a, b);
  if (overlap <= 0 || !overlapVertically(a, b)) return [a, b];

  const aIsLeft = a.x !== b.x ? a.x < b.x : before[0].x <= before[1].x;
  const direction = aIsLeft ? -1 : 1;
  if (afterWalls) {
    const aAtWall = a.x <= LEFT_WALL || a.x >= RIGHT_WALL;
    return aAtWall ? [a, { ...b, x: b.x - direction * overlap }] : [{ ...a, x: a.x + direction * overlap }, b];
  }
  const aShare = Math.trunc(overlap / 2);
  const bShare = overlap - aShare;
  return [
    { ...a, x: a.x + direction * aShare },
    { ...b, x: b.x - direction * bShare },
  ];
}

/**
 * Pulls the fighters back together when they end a step too far apart, taking the excess
 * from whoever walked or jumped away, in proportion to how far each of them moved away.
 */
function limitSeparation([a, b]: Pair, before: Pair): Pair {
  const excess = Math.abs(a.x - b.x) - MAX_SEPARATION;
  if (excess <= 0) return [a, b];

  const aAway = a.x < b.x ? -1 : 1;
  const aRetreat = Math.max(0, (a.x - before[0].x) * aAway);
  const bRetreat = Math.max(0, (b.x - before[1].x) * -aAway);
  const total = aRetreat + bRetreat;
  const aShare = total === 0 ? Math.trunc(excess / 2) : Math.trunc((excess * aRetreat) / total);
  const bShare = excess - aShare;
  return [
    { ...a, x: a.x - aAway * aShare },
    { ...b, x: b.x + aAway * bShare },
  ];
}

/** True when the fighter is against the arena wall on the given side (-1 left, 1 right). */
export function atWall(fighter: FighterState, side: 1 | -1): boolean {
  return side === 1 ? fighter.x >= RIGHT_WALL : fighter.x <= LEFT_WALL;
}

function keepInsideWalls(fighter: FighterState): FighterState {
  const x = Math.min(RIGHT_WALL, Math.max(LEFT_WALL, fighter.x));
  return x === fighter.x ? fighter : { ...fighter, x };
}

function horizontalOverlap(a: FighterState, b: FighterState): number {
  return 2 * HALF_WIDTH - Math.abs(a.x - b.x);
}

/** Push boxes only collide where their heights overlap, which is how a jump can clear an opponent. */
function overlapVertically(a: FighterState, b: FighterState): boolean {
  const boxA = pushBox(a);
  const boxB = pushBox(b);
  return boxA.bottom < boxB.bottom + boxB.height && boxB.bottom < boxA.bottom + boxA.height;
}

/** The part of a fighter the other one cannot walk through. In the air it starts above the tucked feet. */
export function pushBox(fighter: FighterState): Box {
  const height = toSubpixels(fighter.posture === 'crouching' ? BODY.crouchHeight : BODY.standHeight);
  const tuck = toSubpixels(fighter.posture === 'airborne' ? BODY.airborneTuck : 0);
  return { left: fighter.x - HALF_WIDTH, bottom: fighter.y + tuck, width: 2 * HALF_WIDTH, height: height - tuck };
}
