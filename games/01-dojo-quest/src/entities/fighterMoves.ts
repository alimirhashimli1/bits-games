export type AttackKind = 'punch' | 'kick';
export type AttackHeight = 'high' | 'mid' | 'low';
export type BlockHeight = 'high' | 'low';

/** Wind-up and recovery cannot hit; only the active phase can. */
export type AttackPhase = 'windup' | 'active' | 'recovery';

/** A rectangle relative to the fighter's feet (the sprite origin) while facing right. Negative y is above the feet. */
export interface Hitbox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface AttackTiming {
  readonly windupMs: number;
  readonly activeMs: number;
  readonly recoveryMs: number;
}

export interface AttackMove extends AttackTiming {
  readonly kind: AttackKind;
  readonly height: AttackHeight;
  /** Frame shown during wind-up and recovery. */
  readonly windupFrame: string;
  /** Frame shown while the attack can hit. */
  readonly strikeFrame: string;
  readonly hitbox: Hitbox;
  /** Pips this blow costs. Left out, it does the standard damage for its kind. */
  readonly damage?: number;
}

export type AttackMoveSet = Readonly<Record<AttackKind, Readonly<Record<AttackHeight, AttackMove>>>>;

/** The phase an attack is in `elapsedMs` after it started, or null once it has finished. */
export function attackPhaseAt(timing: AttackTiming, elapsedMs: number): AttackPhase | null {
  const activeStartMs = timing.windupMs;
  const recoveryStartMs = activeStartMs + timing.activeMs;
  const endMs = recoveryStartMs + timing.recoveryMs;

  if (elapsedMs < activeStartMs) return 'windup';
  if (elapsedMs < recoveryStartMs) return 'active';
  if (elapsedMs < endMs) return 'recovery';
  return null;
}
