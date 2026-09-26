/** Numbers between 0 and 1, like `Math.random`. Tests pass their own, to get the same results every time. */
export type Random = () => number;

/**
 * A repeatable stream of numbers between 0 and 1 (a linear congruential generator): the same
 * seed always gives the same stream, so generated scenery looks the same every time.
 */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
