import type { FighterId } from '../roster';
import { BRAND_ART } from './brand/brandArt';
import { BRAND_CPU } from './brand/brandCpu';
import { BRAND_MOVES } from './brand/brandMoves';
import { BRAND_SPECIALS } from './brand/brandSpecials';
import { AZAR_ART } from './azar/azarArt';
import { AZAR_CPU } from './azar/azarCpu';
import { AZAR_SPECIALS } from './azar/azarSpecials';
import { COMETA_ART } from './cometa/cometaArt';
import { COMETA_CPU } from './cometa/cometaCpu';
import { COMETA_MOVEMENT, COMETA_MOVES } from './cometa/cometaMoves';
import { COMETA_SPECIALS } from './cometa/cometaSpecials';
import type { CpuStyle } from './cpuStyle';
import type { FighterArt } from './fighterArt';
import { STANDARD_MOVEMENT, type FighterMovement } from './fighterMovement';
import { GROM_ART } from './grom/gromArt';
import { GROM_CPU } from './grom/gromCpu';
import { GROM_MOVEMENT, GROM_MOVES } from './grom/gromMoves';
import { GROM_SPECIALS } from './grom/gromSpecials';
import { KESTREL_ART } from './kestrel/kestrelArt';
import { KESTREL_CPU } from './kestrel/kestrelCpu';
import { KESTREL_MOVEMENT, KESTREL_MOVES } from './kestrel/kestrelMoves';
import { KESTREL_SPECIALS } from './kestrel/kestrelSpecials';
import { KANAN_ART } from './kanan/kananArt';
import { KANAN_CPU } from './kanan/kananCpu';
import { KANAN_MOVEMENT, KANAN_MOVES } from './kanan/kananMoves';
import { KANAN_SPECIALS } from './kanan/kananSpecials';
import { KNOX_ART } from './knox/knoxArt';
import { KNOX_CPU } from './knox/knoxCpu';
import { KNOX_MOVEMENT, KNOX_MOVES } from './knox/knoxMoves';
import { KNOX_SPECIALS } from './knox/knoxSpecials';
import { MAHMOOD_ART } from './mahmood/mahmoodArt';
import { MAHMOOD_CPU } from './mahmood/mahmoodCpu';
import { MAHMOOD_MOVEMENT, MAHMOOD_MOVES } from './mahmood/mahmoodMoves';
import { MAHMOOD_SPECIALS } from './mahmood/mahmoodSpecials';
import type { FighterMoves } from './moves';
import { NOVA_ART } from './nova/novaArt';
import { NOVA_CPU } from './nova/novaCpu';
import { NOVA_MOVEMENT, NOVA_MOVES } from './nova/novaMoves';
import { NOVA_SPECIALS } from './nova/novaSpecials';
import { OSAL_ART } from './osal/osalArt';
import { OSAL_CPU } from './osal/osalCpu';
import { OSAL_SPECIALS } from './osal/osalSpecials';
import { RAJAB_ART } from './rajab/rajabArt';
import { RAJAB_CPU } from './rajab/rajabCpu';
import { RAJAB_SPECIALS } from './rajab/rajabSpecials';
import { ROOK_ART } from './rook/rookArt';
import { ROOK_CPU } from './rook/rookCpu';
import { ROOK_SPECIALS } from './rook/rookSpecials';
import type { SpecialMove } from './specials';
import { SABLE_ART } from './sable/sableArt';
import { SABLE_CPU } from './sable/sableCpu';
import { SABLE_MOVEMENT, SABLE_MOVES } from './sable/sableMoves';
import { SABLE_SPECIALS } from './sable/sableSpecials';
import { VANE_ART } from './vane/vaneArt';
import { VANE_CPU } from './vane/vaneCpu';
import { VANE_MOVEMENT, VANE_MOVES } from './vane/vaneMoves';
import { VANE_SPECIALS } from './vane/vaneSpecials';
import { TALA_ART } from './tala/talaArt';
import { TALA_CPU } from './tala/talaCpu';
import { TALA_MOVEMENT, TALA_MOVES } from './tala/talaMoves';
import { TALA_SPECIALS } from './tala/talaSpecials';
import { WEN_ART } from './wen/wenArt';
import { WEN_CPU } from './wen/wenCpu';
import { WEN_MOVEMENT, WEN_MOVES } from './wen/wenMoves';
import { WEN_SPECIALS } from './wen/wenSpecials';

/** Everything that makes one fighter different: how they look and how their moves work. */
export interface FighterData {
  readonly art: FighterArt;
  readonly moves: FighterMoves;
  /** Both of the fighter's specials. An input that finishes both motions starts the longer one. */
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
  nova: { art: NOVA_ART, moves: NOVA_MOVES, specials: NOVA_SPECIALS, cpu: NOVA_CPU, movement: NOVA_MOVEMENT },
  kestrel: { art: KESTREL_ART, moves: KESTREL_MOVES, specials: KESTREL_SPECIALS, cpu: KESTREL_CPU, movement: KESTREL_MOVEMENT },
  wen: { art: WEN_ART, moves: WEN_MOVES, specials: WEN_SPECIALS, cpu: WEN_CPU, movement: WEN_MOVEMENT },
  cometa: { art: COMETA_ART, moves: COMETA_MOVES, specials: COMETA_SPECIALS, cpu: COMETA_CPU, movement: COMETA_MOVEMENT },
  sable: { art: SABLE_ART, moves: SABLE_MOVES, specials: SABLE_SPECIALS, cpu: SABLE_CPU, movement: SABLE_MOVEMENT },
  kanan: { art: KANAN_ART, moves: KANAN_MOVES, specials: KANAN_SPECIALS, cpu: KANAN_CPU, movement: KANAN_MOVEMENT },
  knox: { art: KNOX_ART, moves: KNOX_MOVES, specials: KNOX_SPECIALS, cpu: KNOX_CPU, movement: KNOX_MOVEMENT },
  mahmood: { art: MAHMOOD_ART, moves: MAHMOOD_MOVES, specials: MAHMOOD_SPECIALS, cpu: MAHMOOD_CPU, movement: MAHMOOD_MOVEMENT },
  // Rook, Rajab, Azar and Osal share Brand's build, so they share his normals and his footwork too.
  rook: { art: ROOK_ART, moves: BRAND_MOVES, specials: ROOK_SPECIALS, cpu: ROOK_CPU, movement: STANDARD_MOVEMENT },
  rajab: { art: RAJAB_ART, moves: BRAND_MOVES, specials: RAJAB_SPECIALS, cpu: RAJAB_CPU, movement: STANDARD_MOVEMENT },
  azar: { art: AZAR_ART, moves: BRAND_MOVES, specials: AZAR_SPECIALS, cpu: AZAR_CPU, movement: STANDARD_MOVEMENT },
  osal: { art: OSAL_ART, moves: BRAND_MOVES, specials: OSAL_SPECIALS, cpu: OSAL_CPU, movement: STANDARD_MOVEMENT },
  // The boss, who is fought but never chosen.
  vane: { art: VANE_ART, moves: VANE_MOVES, specials: VANE_SPECIALS, cpu: VANE_CPU, movement: VANE_MOVEMENT },
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
