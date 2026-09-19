/**
 * A small seeded random number generator (mulberry32). The CPU uses it instead of Math.random,
 * so a CPU given the same seed makes the same choices, which makes its behaviour testable.
 * It lives outside the fight simulation: the CPU's choices reach the fight only as inputs.
 */
export class Random {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** A number from 0 up to (not including) 1. */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** True with the given chance, from 0 to 1. */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T | undefined {
    return items[Math.floor(this.next() * items.length)];
  }
}
