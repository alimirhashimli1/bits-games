import { ROAD } from '../../config';
import type { Track } from '../../systems/road/Track';
import { TrackBuilder } from '../../systems/road/TrackBuilder';
import { HARBOUR_LIGHTS } from '../themes/harbourLights';
import {
  CURVE,
  FORK_APPROACH,
  FORK_LENGTH,
  HILL,
  SIDE,
  STAGE_CHECKPOINT_SECONDS,
  START_STRAIGHT,
} from './shapes';

/** Leg 2, right: along the quays at night. Flat and fast, long lamp-lit straights and quick corners. */
export function buildHarbourLights(): Track {
  const { tall, low, building, obstacle } = HARBOUR_LIGHTS.scenery;
  return new TrackBuilder(ROAD.segmentLength)
    .straight(START_STRAIGHT)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .straight(35)
    .checkpoint(STAGE_CHECKPOINT_SECONDS)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .straight(120)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .scenery(building, { every: 20, offsets: [-SIDE.far, SIDE.far] })
    .curve(70, CURVE.sharp)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 5 })
    .scenery(low, { every: 6, offsets: [SIDE.near] })
    .straight(100)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .scenery(obstacle, { every: 14, offsets: [SIDE.far] })
    .curve(60, -CURVE.medium)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 4 })
    .scenery(low, { every: 6, offsets: [-SIDE.near] })
    .straight(140)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .scenery(building, { every: 18, offsets: [SIDE.far] })
    .hill(40, HILL.low)
    .scenery(low, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .hill(40, -HILL.low)
    .scenery(obstacle, { every: 10, offsets: [-SIDE.far, SIDE.far] })
    .curve(80, -CURVE.sharp)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 5 })
    .scenery(tall, { every: 8, offsets: [-SIDE.near] })
    .straight(120)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .scenery(building, { every: 20, offsets: [-SIDE.far] })
    .curve(70, CURVE.medium)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 4 })
    .scenery(obstacle, { every: 12, offsets: [SIDE.near] })
    .curve(70, -CURVE.medium)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 4 })
    .scenery(low, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .straight(130)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .scenery(building, { every: 16, offsets: [-SIDE.far, SIDE.far] })
    .curve(80, CURVE.sharp)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 5 })
    .scenery(obstacle, { every: 10, offsets: [SIDE.far] })
    .straight(90)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .road(80, { curve: -CURVE.gentle, rise: HILL.low })
    .scenery(low, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .road(80, { curve: CURVE.gentle, rise: -HILL.low })
    .scenery(building, { every: 20, offsets: [SIDE.far] })
    .straight(120)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .curve(70, -CURVE.sharp)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 5 })
    .scenery(obstacle, { every: 10, offsets: [-SIDE.near] })
    .straight(100)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .scenery(building, { every: 18, offsets: [-SIDE.far, SIDE.far] })
    .curve(70, CURVE.medium)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 4 })
    .scenery(low, { every: 6, offsets: [SIDE.near] })
    .straight(80)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .straight(FORK_APPROACH)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .fork(FORK_LENGTH)
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .end()
    .scenery(tall, { every: 8, offsets: [-SIDE.near, SIDE.near] })
    .build();
}
