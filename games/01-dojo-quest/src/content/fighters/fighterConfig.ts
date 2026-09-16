import { ARENA } from '../../config';
import type { FighterConfig } from '../../entities/Fighter';
import type { AttackMoveSet, Hitbox } from '../../entities/fighterMoves';
import type { HealthConfig } from '../../entities/Health';
import type { FighterAnimations } from '../sprites/fighterSprites';
import { HERO_MOVES } from './heroMoves';

interface FighterStats {
  readonly health: HealthConfig;
  /** Pixels per second. */
  readonly runSpeed: number;
  readonly walkSpeed: number;
  /** Defaults to Kenji's moves, which the guards use as well. The boss brings his own. */
  readonly attacks?: AttackMoveSet;
}

/** The body area attacks can hit: 12×40 pixels, centred on the feet (matches the fighting pose). */
const HURTBOX: Hitbox = { x: -6, y: -40, width: 12, height: 40 };

/** Combines a fighter's sprite sheet and stats with the moves, blocks and hurtbox every fighter shares. */
export function buildFighterConfig(
  texture: string,
  animations: FighterAnimations,
  { health, runSpeed, walkSpeed, attacks = HERO_MOVES }: FighterStats,
): FighterConfig {
  return {
    texture,
    animations: {
      stand: animations.stand.key,
      run: animations.run.key,
      toFight: animations.toFight.key,
      toStand: animations.toStand.key,
      fightIdle: animations.fightIdle.key,
      walk: animations.walk.key,
      hit: animations.hit.key,
      fall: animations.fall.key,
    },
    attacks,
    blockFrames: { high: 'blockHigh', low: 'blockLow' },
    hurtbox: HURTBOX,
    minX: ARENA.minX,
    maxX: ARENA.maxX,
    health,
    runSpeed,
    walkSpeed,
  };
}
