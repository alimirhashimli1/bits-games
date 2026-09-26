import type { Palette, PixelMap } from '@shared/pixel-art/pixelMap';

import {
  BLUE_SALOON,
  ORANGE_TRUCK,
  SALOON,
  TRUCK,
  WHITE_SALOON,
  WHITE_TRUCK,
  YELLOW_SALOON,
} from './sprites/traffic';

/** One kind of vehicle in the traffic: how it looks, and how fast its driver likes to go. */
export interface VehicleModel {
  readonly name: string;
  readonly map: PixelMap;
  readonly palette: Palette;
  /** The range a driver's cruising speed is picked from, in world units per step (200 ≈ 290 km/h). */
  readonly cruise: { readonly min: number; readonly max: number };
}

/** Saloons cruise at about 100 to 160 km/h, trucks at about 70 to 110. */
export const VEHICLE_MODELS: readonly VehicleModel[] = [
  { name: 'blue saloon', map: SALOON, palette: BLUE_SALOON, cruise: { min: 70, max: 110 } },
  { name: 'yellow saloon', map: SALOON, palette: YELLOW_SALOON, cruise: { min: 70, max: 110 } },
  { name: 'white saloon', map: SALOON, palette: WHITE_SALOON, cruise: { min: 70, max: 110 } },
  { name: 'white truck', map: TRUCK, palette: WHITE_TRUCK, cruise: { min: 50, max: 75 } },
  { name: 'orange truck', map: TRUCK, palette: ORANGE_TRUCK, cruise: { min: 50, max: 75 } },
];
