import { SKYLINE_PIER_ENDING } from '../endings/skylinePier';
import { STAR_OBSERVATORY_ENDING } from '../endings/starObservatory';
import { SUMMIT_LODGE_ENDING } from '../endings/summitLodge';
import type { GateStyle } from '../sprites/gates';
import { HARBOUR_LIGHTS } from '../themes/harbourLights';
import { NEON_BOULEVARD } from '../themes/neonBoulevard';
import { PALM_CANYON } from '../themes/palmCanyon';
import { PINEWOOD_PASS } from '../themes/pinewoodPass';
import { REDROCK_DESERT } from '../themes/redrockDesert';
import { SUNSET_COAST } from '../themes/sunsetCoast';
import { buildHarbourLights } from './harbourLights';
import { buildNeonBoulevard } from './neonBoulevard';
import { buildPalmCanyon } from './palmCanyon';
import { buildPinewoodPass } from './pinewoodPass';
import { buildRedrockDesert } from './redrockDesert';
import type { Goal, GoalId, Stage, StageId } from './stage';
import { buildSunsetCoast } from './sunsetCoast';

/**
 * The Sunward Run: a pyramid of six stages. Every stage on legs 1 and 2 ends at a fork, and
 * the side taken picks the next stage. Each leg 3 stage ends at its own finish line.
 *
 *                 Sunset Coast
 *               /              \
 *       Palm Canyon           Harbour Lights
 *        /        \           /            \
 *   Redrock    Pinewood Pass              Neon Boulevard
 */
export const STAGES: Readonly<Record<StageId, Stage>> = {
  sunsetCoast: {
    id: 'sunsetCoast',
    name: 'SUNSET COAST',
    theme: SUNSET_COAST,
    buildTrack: buildSunsetCoast,
    exit: { kind: 'fork', left: 'palmCanyon', right: 'harbourLights' },
  },
  palmCanyon: {
    id: 'palmCanyon',
    name: 'PALM CANYON',
    theme: PALM_CANYON,
    buildTrack: buildPalmCanyon,
    exit: { kind: 'fork', left: 'redrockDesert', right: 'pinewoodPass' },
  },
  harbourLights: {
    id: 'harbourLights',
    name: 'HARBOUR LIGHTS',
    theme: HARBOUR_LIGHTS,
    buildTrack: buildHarbourLights,
    exit: { kind: 'fork', left: 'pinewoodPass', right: 'neonBoulevard' },
  },
  redrockDesert: {
    id: 'redrockDesert',
    name: 'REDROCK DESERT',
    theme: REDROCK_DESERT,
    buildTrack: buildRedrockDesert,
    exit: { kind: 'goal', goal: 'starObservatory' },
  },
  pinewoodPass: {
    id: 'pinewoodPass',
    name: 'PINEWOOD PASS',
    theme: PINEWOOD_PASS,
    buildTrack: buildPinewoodPass,
    exit: { kind: 'goal', goal: 'summitLodge' },
  },
  neonBoulevard: {
    id: 'neonBoulevard',
    name: 'NEON BOULEVARD',
    theme: NEON_BOULEVARD,
    buildTrack: buildNeonBoulevard,
    exit: { kind: 'goal', goal: 'skylinePier' },
  },
};

/** Every finish gate has a chequered banner saying GOAL, in the colours of its goal. */
function finishGate(banner: string, text: string): GateStyle {
  return {
    text: 'GOAL',
    chequered: true,
    colors: { postLight: '#f4f4f4', postDark: '#1b1b22', banner, bannerEdge: '#1b1b22', text },
  };
}

export const GOALS: Readonly<Record<GoalId, Goal>> = {
  starObservatory: {
    id: 'starObservatory',
    name: 'STAR OBSERVATORY',
    gate: finishGate('#3a2470', '#ffd23f'),
    ending: STAR_OBSERVATORY_ENDING,
  },
  summitLodge: {
    id: 'summitLodge',
    name: 'SUMMIT LODGE',
    gate: finishGate('#1e5a2a', '#f4f8ff'),
    ending: SUMMIT_LODGE_ENDING,
  },
  skylinePier: {
    id: 'skylinePier',
    name: 'SKYLINE PIER',
    gate: finishGate('#c8246e', '#ffd23f'),
    ending: SKYLINE_PIER_ENDING,
  },
};

/** Every race starts on the coast road out of Port Calla. */
export const FIRST_STAGE: StageId = 'sunsetCoast';
