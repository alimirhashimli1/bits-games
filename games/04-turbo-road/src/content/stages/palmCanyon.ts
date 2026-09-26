import { ROAD } from '../../config';
import type { Track } from '../../systems/road/Track';
import { TrackBuilder } from '../../systems/road/TrackBuilder';
import { PALM_CANYON } from '../themes/palmCanyon';
import {
  CURVE,
  FORK_APPROACH,
  FORK_LENGTH,
  HILL,
  SIDE,
  STAGE_CHECKPOINT_SECONDS,
  START_STRAIGHT,
} from './shapes';

/** Leg 2, left: down into the canyon. Tight, twisting bends between buttes, and few straights. */
export function buildPalmCanyon(): Track {
  const { tall, low, building, obstacle } = PALM_CANYON.scenery;
  return new TrackBuilder(ROAD.segmentLength)
    .straight(START_STRAIGHT)
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .straight(35)
    .checkpoint(STAGE_CHECKPOINT_SECONDS)
    .scenery(low, { every: 5, offsets: [-SIDE.near, SIDE.near] })
    .road(80, { curve: CURVE.medium, rise: -HILL.medium })
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 4 })
    .scenery(building, { every: 14, offsets: [-SIDE.far, SIDE.far] })
    .curve(70, -CURVE.sharp)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 5 })
    .scenery(obstacle, { every: 7, offsets: [-SIDE.near, SIDE.far] })
    .curve(70, CURVE.sharp)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 5 })
    .scenery(tall, { every: 6, offsets: [-SIDE.near] })
    .straight(50)
    .scenery(tall, { every: 5, offsets: [-SIDE.near, SIDE.near] })
    .road(90, { curve: -CURVE.medium, rise: HILL.low })
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 4 })
    .scenery(building, { every: 12, offsets: [SIDE.far] })
    .curve(80, CURVE.medium)
    .scenery(low, { every: 5, offsets: [-SIDE.near, SIDE.near] })
    .scenery(obstacle, { every: 9, offsets: [SIDE.near] })
    .hill(60, -HILL.medium)
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .curve(70, -CURVE.sharp)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 5 })
    .scenery(building, { every: 10, offsets: [-SIDE.far] })
    .road(80, { curve: CURVE.gentle, rise: HILL.medium })
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .curve(90, CURVE.sharp)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 5 })
    .scenery(obstacle, { every: 8, offsets: [-SIDE.far, SIDE.near] })
    .straight(40)
    .scenery(low, { every: 5, offsets: [-SIDE.near, SIDE.near] })
    .road(100, { curve: -CURVE.medium, rise: -HILL.low })
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 4 })
    .scenery(building, { every: 16, offsets: [-SIDE.far, SIDE.far] })
    .curve(70, CURVE.medium)
    .scenery(tall, { every: 6, offsets: [SIDE.near] })
    .curve(70, -CURVE.medium)
    .scenery(tall, { every: 6, offsets: [-SIDE.near] })
    .hill(80, HILL.high)
    .scenery(low, { every: 4, offsets: [-SIDE.near, SIDE.near] })
    .scenery(obstacle, { every: 12, offsets: [SIDE.far] })
    .road(90, { curve: -CURVE.sharp, rise: -HILL.medium })
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 5 })
    .scenery(building, { every: 12, offsets: [-SIDE.far] })
    .straight(60)
    .scenery(tall, { every: 5, offsets: [-SIDE.near, SIDE.near] })
    .curve(80, CURVE.sharp)
    .scenery('signRight', { every: 4, offsets: [-SIDE.verge], count: 5 })
    .scenery(obstacle, { every: 8, offsets: [SIDE.near] })
    .curve(60, -CURVE.gentle)
    .scenery(low, { every: 5, offsets: [-SIDE.near, SIDE.far] })
    .road(80, { curve: CURVE.medium, rise: -HILL.low })
    .scenery(building, { every: 14, offsets: [-SIDE.far, SIDE.far] })
    .curve(80, -CURVE.medium)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 4 })
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .straight(70)
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .road(80, { curve: CURVE.gentle, rise: HILL.medium })
    .scenery(obstacle, { every: 10, offsets: [-SIDE.far] })
    .curve(80, -CURVE.sharp)
    .scenery('signLeft', { every: 4, offsets: [SIDE.verge], count: 5 })
    .scenery(building, { every: 12, offsets: [SIDE.far] })
    .straight(60)
    .scenery(low, { every: 5, offsets: [-SIDE.near, SIDE.near] })
    .straight(FORK_APPROACH)
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .fork(FORK_LENGTH)
    .scenery(tall, { every: 6, offsets: [-SIDE.near, SIDE.near] })
    .end()
    .scenery(building, { every: 16, offsets: [-SIDE.far, SIDE.far] })
    .build();
}
