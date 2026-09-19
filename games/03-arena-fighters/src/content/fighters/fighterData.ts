import type { FighterId } from '../roster';
import { BRAND_ART } from './brand/brandArt';
import { BRAND_CPU } from './brand/brandCpu';
import { BRAND_MOVES } from './brand/brandMoves';
import { BRAND_SPECIALS } from './brand/brandSpecials';
import { AZAR_ART } from './azar/azarArt';
import { AZAR_CPU } from './azar/azarCpu';
import { AZAR_SPECIALS } from './azar/azarSpecials';
import type { CpuStyle } from './cpuStyle';
import type { FighterArt } from './fighterArt';
import { STANDARD_MOVEMENT, type FighterMovement } from './fighterMovement';
import { GROM_ART } from './grom/gromArt';
import { GROM_CPU } from './grom/gromCpu';
import { GROM_MOVEMENT, GROM_MOVES } from './grom/gromMoves';
import { GROM_SPECIALS } from './grom/gromSpecials';
import { KANAN_ART } from './kanan/kananArt';
import { KANAN_CPU } from './kanan/kananCpu';
import { KANAN_MOVEMENT, KANAN_MOVES } from './kanan/kananMoves';
import { KANAN_SPECIALS } from './kanan/kananSpecials';
import { MAHMOOD_ART } from './mahmood/mahmoodArt';
import { MAHMOOD_CPU } from './mahmood/mahmoodCpu';
import { MAHMOOD_MOVEMENT, MAHMOOD_MOVES } from './mahmood/mahmoodMoves';
import { MAHMOOD_SPECIALS } from './mahmood/mahmoodSpecials';
import type { FighterMoves } from './moves';
import { OSAL_ART } from './osal/osalArt';
import { OSAL_CPU } from './osal/osalCpu';
import { OSAL_SPECIALS } from './osal/osalSpecials';
import { RAJAB_ART } from './rajab/rajabArt';
import { RAJAB_CPU } from './rajab/rajabCpu';
import { RAJAB_SPECIALS } from './rajab/rajabSpecials';
import type { SpecialMove } from './specials';
import { TALA_ART } from './tala/talaArt';
import { TALA_CPU } from './tala/talaCpu';
import { TALA_MOVEMENT, TALA_MOVES } from './tala/talaMoves';
import { TALA_SPECIALS } from './tala/talaSpecials';

/** Everything that makes one fighter different: how they look and how their moves work. */
export interface FighterData {
  readonly art: FighterArt;
  readonly moves: FighterMoves;
  /** Tried in this order when an input completes more than one motion. */
  readonly specials: readonly SpecialMove[];
  /** How the CPU fights with them. */
  readonly cpu: CpuStyle;
  readonly movement: FighterMovement;
}

/** Fighters built so far. The rest arrive one per roster step. */
export const FIGHTER_DATA: Partial<Record<FighterId, FighterData>> = {
  brand: { art: BRAND_ART, moves: BRAND_MOVES, specials: BRAND_SPECIALS, cpu: BRAND_CPU, movement: STANDARD_MOVEMENT },
  tala: { art: TALA_ART, moves: TALA_MOVES, specials: TALA_SPECIALS, cpu: TALA_CPU, movement: TALA_MOVEMENT },
  grom: { art: GROM_ART, moves: GROM_MOVES, specials: GROM_SPECIALS, cpu: GROM_CPU, movement: GROM_MOVEMENT },
  kanan: { art: KANAN_ART, moves: KANAN_MOVES, specials: KANAN_SPECIALS, cpu: KANAN_CPU, movement: KANAN_MOVEMENT },
  mahmood: { art: MAHMOOD_ART, moves: MAHMOOD_MOVES, specials: MAHMOOD_SPECIALS, cpu: MAHMOOD_CPU, movement: MAHMOOD_MOVEMENT },
  // Rajab, Azar and Osal share Brand's build, so they share his normals and his footwork too.
  rajab: { art: RAJAB_ART, moves: BRAND_MOVES, specials: RAJAB_SPECIALS, cpu: RAJAB_CPU, movement: STANDARD_MOVEMENT },
  azar: { art: AZAR_ART, moves: BRAND_MOVES, specials: AZAR_SPECIALS, cpu: AZAR_CPU, movement: STANDARD_MOVEMENT },
  osal: { art: OSAL_ART, moves: BRAND_MOVES, specials: OSAL_SPECIALS, cpu: OSAL_CPU, movement: STANDARD_MOVEMENT },
};

/** Fighters not built yet stand in as Brand, both in looks and in moves. */
export function builtFighter(id: FighterId): FighterId {
  return FIGHTER_DATA[id] ? id : 'brand';
}

export function fighterData(id: FighterId): FighterData {
  const data = FIGHTER_DATA[builtFighter(id)];
  if (!data) throw new Error(`No fighter data for "${id}", and none for Brand to stand in.`);
  return data;
}
