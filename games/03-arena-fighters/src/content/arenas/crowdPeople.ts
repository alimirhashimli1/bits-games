import { PixelGrid } from '@shared/pixel-art/pixelGrid';
import type { PixelMap } from '@shared/pixel-art/pixelMap';

import type { CrowdPerson } from './arenaTypes';

/** The palette symbols one kind of person is drawn with. The arena's palette gives them colours. */
export interface PersonLook {
  readonly shirt: string;
  readonly skin: string;
  readonly hair: string;
  readonly legs: string;
  readonly outline: string;
}

/** Crowd frames are 12×22 pixels, feet on the row above the bottom (the outline takes the last row). */
export const PERSON_FRAME = { width: 12, height: 22 } as const;

interface Stance {
  readonly armsUp: boolean;
  /** Pixels the upper body sits lower (a bob) or, negative, higher. */
  readonly bob: number;
  /** Pixels the whole person is off the ground, for a jump. */
  readonly lift: number;
}

/** Standing about, a small bob, and two frames of cheering with arms up. */
export function createPerson(look: PersonLook): CrowdPerson {
  return {
    idle: [drawPerson(look, { armsUp: false, bob: 0, lift: 0 }), drawPerson(look, { armsUp: false, bob: 1, lift: 0 })],
    cheer: [drawPerson(look, { armsUp: true, bob: 0, lift: 0 }), drawPerson(look, { armsUp: true, bob: 0, lift: 1 })],
  };
}

function drawPerson(look: PersonLook, { armsUp, bob, lift }: Stance): PixelMap {
  const grid = new PixelGrid(PERSON_FRAME.width, PERSON_FRAME.height);
  const ground = PERSON_FRAME.height - 2 - lift;
  const top = ground - 17 + bob;

  // Legs, then the body and head on top of them.
  grid.fillRect(4, top + 12, 2, ground - top - 11, look.legs);
  grid.fillRect(6, top + 12, 2, ground - top - 11, look.legs);
  grid.fillRect(3, top + 5, 6, 7, look.shirt);
  grid.fillRect(4, top + 1, 4, 4, look.skin);
  grid.fillRect(4, top, 4, 1, look.hair);
  grid.plot(4, top + 1, look.hair);
  grid.plot(7, top + 1, look.hair);

  if (armsUp) {
    grid.fillRect(2, top, 1, 5, look.shirt);
    grid.fillRect(9, top, 1, 5, look.shirt);
    grid.fillRect(2, top - 2, 1, 2, look.skin);
    grid.fillRect(9, top - 2, 1, 2, look.skin);
  } else {
    grid.fillRect(2, top + 6, 1, 4, look.shirt);
    grid.fillRect(9, top + 6, 1, 4, look.shirt);
    grid.plot(2, top + 10, look.skin);
    grid.plot(9, top + 10, look.skin);
  }
  grid.outline(look.outline);
  return grid.toPixelMap();
}
