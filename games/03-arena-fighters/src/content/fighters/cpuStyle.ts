/**
 * How a fighter likes to fight when the CPU plays them. Chances run from 0 to 1; the CPU level
 * decides how well these plans are carried out.
 */
export interface CpuStyle {
  /** The distance, in pixels between centres, the fighter tries to keep. */
  readonly preferredRange: number;
  /** How often, when in reach, it attacks rather than waits. */
  readonly aggression: number;
  /** How often, from a distance, it jumps in. */
  readonly jumpiness: number;
  /** How often, from a distance, it throws a projectile (if it has one). */
  readonly projectileLove: number;
  /** How often, up close, it goes for a throw. */
  readonly throwLove: number;
}
