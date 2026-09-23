import { FIGHTERS, FIGHTER_IDS, type PlayableId } from '../content/roster';
import { Random } from './cpu/random';

/**
 * The draws the game makes on a player's behalf: the `?` box on the character select, and the
 * opponent and the arena of a VS CPU match. Each is a pure function of a seed, like the arcade
 * shuffle, so a draw can be run thousands of times in a test without a browser.
 *
 * `drawSeed` is the one place a real random number is taken. Keeping it apart from the draws
 * themselves is what leaves everything downstream of it testable.
 */
export function drawSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

/**
 * A fighter at random, for the `?` box. It draws from `FIGHTER_IDS`, which is the fifteen anyone
 * may pick, so the box can never hand a player the boss.
 */
export function randomFighter(seed: number): PlayableId {
  return pickFrom(FIGHTER_IDS, new Random(seed), FIGHTERS[0].id);
}

/** One of a list, from a generator that has already been seeded. */
export function pickFrom<T>(items: readonly T[], random: Random, fallback: T): T {
  return items[Math.floor(random.next() * items.length)] ?? fallback;
}
