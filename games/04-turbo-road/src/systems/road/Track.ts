import type { SceneryKind } from '../../content/sprites/scenery';

/** The shape of one segment, as the track builder lays it down. */
export interface SegmentShape {
  /** How much the road bends over this segment: positive to the right, negative to the left. */
  readonly curve: number;
  /** Height of the road at the segment's near and far edges. */
  readonly nearY: number;
  readonly farY: number;
  readonly scenery: readonly SceneryPlacement[];
  /** A checkpoint gate stands at this segment's near edge, adding this many seconds; or none. */
  readonly checkpoint: number | null;
  /** The finish line is at this segment's near edge: a gate over it, and chequers across the road. */
  readonly finish: boolean;
  /**
   * Where the road has forked, how far each branch's centre is from the old centre line, in
   * road half-widths, at the segment's near and far edges. 0 where the road is still one road.
   */
  readonly branchNear: number;
  readonly branchFar: number;
}

/** Something standing beside the road, at the near edge of its segment. */
export interface SceneryPlacement {
  readonly kind: SceneryKind;
  /**
   * Sideways, in road half-widths: negative on the left, positive on the right. The sprite
   * stands on the outer side of this point, so it never reaches back over the road. After a
   * fork it is measured from its own branch. At exactly 0 it stands centred, in the median.
   */
  readonly offset: number;
}

/** A short piece of road. The track is a loop of these. */
export interface Segment extends SegmentShape {
  readonly index: number;
  /** Distance of the segment's near edge from the start of the track. */
  readonly z: number;
}

/** Where a stage's road ends, and where it forks before that. */
export interface TrackEnds {
  /** The end line: crossing it finishes the stage. */
  readonly endZ: number;
  /** Where the road starts to split, if it does. */
  readonly forkZ: number | null;
}

/**
 * A road made of equal-length segments. A stage is driven from the start to its end line, but
 * the road carries on past that, so there is always road ahead to draw. Distances wrap round
 * as if it were a loop, which keeps traffic flowing: a car that drives off the end comes back
 * on at the start, far behind the Comet.
 */
export class Track {
  readonly segments: readonly Segment[];
  readonly segmentLength: number;
  /** Total length of the road, in world units. */
  readonly length: number;

  constructor(
    shapes: readonly SegmentShape[],
    segmentLength: number,
    readonly ends: TrackEnds,
  ) {
    if (shapes.length < 1) throw new Error('A track needs at least one segment.');
    this.segmentLength = segmentLength;
    this.length = shapes.length * segmentLength;
    this.segments = shapes.map((shape, index) => ({ ...shape, index, z: index * segmentLength }));
  }

  /** The segment `offset` places after `index`, going round the loop. */
  segmentAfter(index: number, offset: number): Segment {
    const segment = this.segments[(index + offset) % this.segments.length];
    if (!segment) throw new Error(`Segment ${index} + ${offset} is not on the track.`);
    return segment;
  }

  /** The segment under a distance along the track. Distances past one lap wrap round. */
  segmentAt(z: number): Segment {
    return this.segmentAfter(Math.floor(this.wrap(z) / this.segmentLength), 0);
  }

  /**
   * The segments driven into while moving from `fromZ` to `toZ`: those whose near edge, where
   * their scenery stands, was passed. A car creeping along inside one segment enters none.
   */
  segmentsEntered(fromZ: number, toZ: number): Segment[] {
    const entered: Segment[] = [];
    const first = Math.floor(fromZ / this.segmentLength) + 1;
    const last = Math.floor(toZ / this.segmentLength);
    for (let index = first; index <= last; index++) entered.push(this.segmentAt(index * this.segmentLength));
    return entered;
  }

  /** Height of the road at a distance along the track, blended across the segment. */
  heightAt(z: number): number {
    const segment = this.segmentAt(z);
    const along = (this.wrap(z) - segment.z) / this.segmentLength;
    return segment.nearY + (segment.farY - segment.nearY) * along;
  }

  /** How far the branches are from the old centre line at a distance along the track, blended across the segment. */
  branchOffsetAt(z: number): number {
    const segment = this.segmentAt(z);
    const along = (this.wrap(z) - segment.z) / this.segmentLength;
    return segment.branchNear + (segment.branchFar - segment.branchNear) * along;
  }

  /** Brings any distance into the range of one lap. */
  wrap(z: number): number {
    return ((z % this.length) + this.length) % this.length;
  }
}
