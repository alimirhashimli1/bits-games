import type { MusicHit } from '@shared/audio/music';

/** The drums every radio song shares: a thump, a crack and a tick, all bursts of noise. */
export const KICK: Omit<MusicHit, 'step'> = { durationMs: 90, volume: 0.35, cutoffHz: 180 };
export const SNARE: Omit<MusicHit, 'step'> = { durationMs: 110, volume: 0.16, cutoffHz: 3000 };
export const HAT: Omit<MusicHit, 'step'> = { durationMs: 25, volume: 0.05, cutoffHz: 9000 };

/** Four on the floor, the snare on the second and fourth beats, and a hat on every off-beat: one bar. */
export const STRAIGHT_KICK = 'x... x... x... x...';
export const BACKBEAT_SNARE = '.... x... .... x...';
export const OFFBEAT_HAT = '..x. ..x. ..x. ..x.';
