import type { SceneryKind } from '../../content/sprites/scenery';
import { FORK, ROAD } from '../../config';
import { smoothStep } from '../easing';
import { type SegmentShape, Track, type TrackEnds } from './Track';

export interface SectionShape {
  /** Bend at the middle of the section: positive to the right, negative to the left. */
  readonly curve?: number;
  /** How much higher the road is at the end of the section than at its start. Negative goes down. */
  readonly rise?: number;
}

export interface SceneryRow {
  /** Segments between one placement and the next. */
  readonly every: number;
  /** Sideways positions, in road half-widths: negative on the left, positive on the right. */
  readonly offsets: readonly number[];
  /** Stop after this many placements. */
  readonly count?: number;
}

/** Share of a curve's length spent turning in, and again turning out, so bends have no kinks. */
const CURVE_EASE = 0.25;
/** A smooth-step hill is steepest in its middle, where it climbs this many times its average slope. */
const PEAK_SLOPE_FACTOR = Math.PI / 2;

/**
 * Lays down a stage one section at a time, so it reads like directions:
 * `straight(30).curve(60, CURVE.medium).hill(60, HILL.medium)`, and last of all `end()`, or `finish()` on the last stage of a route.
 * Lengths are in segments.
 */
export class TrackBuilder {
  private readonly shapes: SegmentShape[] = [];
  private height = 0;
  /** How far apart the branches are so far: 0 until the road forks. */
  private branch = 0;
  /** Where the last section starts, for `scenery()` to decorate. */
  private sectionStart = 0;
  private forkZ: number | null = null;
  private ends: TrackEnds | null = null;

  constructor(private readonly segmentLength: number) {}

  straight(length: number): this {
    return this.road(length);
  }

  curve(length: number, curve: number): this {
    return this.road(length, { curve });
  }

  hill(length: number, rise: number): this {
    return this.road(length, { rise });
  }

  /** A section that may bend and climb at once. */
  road(length: number, { curve = 0, rise = 0 }: SectionShape = {}): this {
    this.checkSlope(length, rise);

    const start = this.height;
    this.sectionStart = this.shapes.length;
    for (let step = 0; step < length; step++) {
      this.shapes.push({
        curve: curve * curveStrength((step + 0.5) / length),
        nearY: start + rise * smoothStep(step / length),
        farY: start + rise * smoothStep((step + 1) / length),
        scenery: [],
        checkpoint: null,
        finish: false,
        branchNear: this.branch,
        branchFar: this.branch,
      });
    }
    this.height = start + rise;
    return this;
  }

  /**
   * Lines the section just laid down with scenery: one of `kind` every `every` segments, at
   * each of `offsets` (in road half-widths, negative on the left). `count` stops after that
   * many, for things like a few warning signs at the start of a bend.
   */
  scenery(kind: SceneryKind, { every, offsets, count = Infinity }: SceneryRow): this {
    let placed = 0;
    for (let index = this.sectionStart; index < this.shapes.length && placed < count; index += every) {
      const shape = this.shapes[index];
      if (!shape) break;
      this.shapes[index] = { ...shape, scenery: [...shape.scenery, ...offsets.map((offset) => ({ kind, offset }))] };
      placed++;
    }
    return this;
  }

  /** A checkpoint gate at the start of the section just laid down, worth `seconds` of extra time. */
  checkpoint(seconds: number): this {
    const shape = this.shapes[this.sectionStart];
    if (!shape) throw new Error('A checkpoint needs a section of road to stand on.');
    this.shapes[this.sectionStart] = { ...shape, checkpoint: seconds };
    return this;
  }

  /**
   * A straight on which the road splits in two: it widens, then the two branches pull apart,
   * with grass between them and the fork sign standing in the middle. It ends a stage.
   */
  fork(length: number): this {
    this.forkZ = this.shapes.length * this.segmentLength;
    this.road(length);
    let signed = false;
    for (let step = 0; step < length; step++) {
      const index = this.sectionStart + step;
      const shape = this.shapes[index];
      if (!shape) continue;
      const branchNear = FORK.branchOffset * smoothStep(step / length);
      const branchFar = FORK.branchOffset * smoothStep((step + 1) / length);
      const placeSign: boolean = !signed && branchNear >= FORK.signFrom;
      signed ||= placeSign;
      const scenery = placeSign ? [...shape.scenery, { kind: 'forkSign' as const, offset: 0 }] : shape.scenery;
      this.shapes[index] = { ...shape, branchNear, branchFar, scenery };
    }
    this.branch = FORK.branchOffset;
    return this;
  }

  /**
   * The end line, here. The road carries on straight for as far as can be seen, so there is
   * road ahead to draw right up to the line.
   */
  end(): this {
    this.ends = { endZ: this.shapes.length * this.segmentLength, forkZ: this.forkZ };
    return this.straight(ROAD.drawDistance);
  }

  /** The end line of the last stage of a route: the finish, with a gate over it and chequers across the road. */
  finish(): this {
    const finishIndex = this.shapes.length;
    this.end();
    const shape = this.shapes[finishIndex];
    if (!shape) throw new Error('The finish needs road beyond it.');
    this.shapes[finishIndex] = { ...shape, finish: true };
    return this;
  }

  build(): Track {
    if (!this.ends) throw new Error('A stage needs an end: finish it with end() or finish().');
    return new Track(this.shapes, this.segmentLength, this.ends);
  }

  /**
   * The camera always looks level, so on a steep enough drop the road just ahead falls out
   * of the bottom of the screen. Hills are kept gentle enough that it never does.
   */
  private checkSlope(length: number, rise: number): void {
    const peakSlope = (Math.abs(rise) * PEAK_SLOPE_FACTOR) / (length * this.segmentLength);
    if (peakSlope > ROAD.maxSlope) {
      throw new Error(`A hill climbing ${rise} over ${length} segments is too steep. Make it longer or lower.`);
    }
  }
}

/** 0 to 1 and back to 0 across a curve: turning in, holding the bend, turning out. */
function curveStrength(along: number): number {
  return smoothStep(Math.min(1, along / CURVE_EASE, (1 - along) / CURVE_EASE));
}
